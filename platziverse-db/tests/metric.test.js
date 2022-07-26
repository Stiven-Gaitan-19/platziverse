'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const metricFixture = require('./fixtures/metric')
const agentFixture = require('./fixtures/agent')

let db = null
let sandbox = null
let MetricStub = null
const uuid = 'yyy-yyy-yyy'
const type = 'test'

const AgentStub = {
  hasMany: sinon.spy()
}

const uuidParams = {
  raw: true,
  attributes: ['type'],
  group: ['type'],
  include: [
    {
      attributes: [],
      model: AgentStub,
      where: { uuid }
    }
  ]
}
const typeAgentUuidParams = {
  where: { type },
  limit: 20,
  order: [['created', 'DESC']],
  include: [
    {
      model: AgentStub,
      attributes: [],
      where: { uuid }
    }
  ]
}
const whereUuid = {
  where: { uuid }
}

const dbConfig = {
  dialect: 'sqlite',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  },
  query: {
    raw: true
  },
  logging: () => {}
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy(),
    create: sandbox.stub(),
    findAll: sandbox.stub(),
  }

  MetricStub.findAll.withArgs(uuidParams).returns(Promise.resolve(metricFixture.getAllByUuid))
  MetricStub.findAll.withArgs(typeAgentUuidParams).returns(Promise.resolve(metricFixture.getAllByTypeAndUuid))
  MetricStub.create.withArgs({...metricFixture.newMetric(), agentId: agentFixture.getOne.id}).returns(Promise.resolve({ toJSON() { return {...metricFixture.newMetric(), agentId: agentFixture.getOne.id, agent: agentFixture.getOne} }}))

  AgentStub.findOne = sinon.stub()
  AgentStub.findOne.withArgs(whereUuid).returns(Promise.resolve(agentFixture.getOne))

  const setupDataBase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDataBase(dbConfig)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => t.truthy(db.Metric, 'should be Metric available'))

test.serial('Setub', t => {
  t.true(AgentStub.hasMany.called, 'hasMany should be called')
  t.true(AgentStub.hasMany.calledOnce, 'hasMany should be called only once')
  t.true(MetricStub.belongsTo.called, 'belongsTo should be called')
  t.true(MetricStub.belongsTo.calledOnce, 'belongsTo should be called only once')
})

test.serial('Metric #findByUuid', async (t) => {
  const metrics = await db.Metric.findByUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called only once')
  t.true(MetricStub.findAll.calledWith(uuidParams), 'findAll should be called with the condition')

  t.deepEqual(metrics, metricFixture.getAllByUuid, 'should be the same object')
})

test.serial('Metric #findByTypeAgentUuid', async (t) => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called only once')
  t.true(MetricStub.findAll.calledWith(typeAgentUuidParams), 'findAll should be called with the condition')

  t.deepEqual(metrics, metricFixture.getAllByTypeAndUuid, 'should be the same object')
})

test.serial('Metric #create - with nonexists agent', async (t) => {
  const metric = await db.Metric.save('tttt-ppp-ddd', metricFixture.newMetric())

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called only once')
  t.false(AgentStub.findOne.calledWith(whereUuid), 'findOne should be called with the condition')
  t.deepEqual(metric, undefined, 'should not be present')
})

test.serial('Metric #create - with existing agent', async (t) => {
  const metric = await db.Metric.save(uuid, metricFixture.newMetric())

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called only once')
  t.true(AgentStub.findOne.calledWith(whereUuid), 'findOne should be called with the condition')

  t.true(MetricStub.create.called, 'create should be called')
  t.true(MetricStub.create.calledOnce, 'create should be called only once')
  t.true(MetricStub.create.calledWith({...metricFixture.newMetric(), agentId: agentFixture.getOne.id}), 'create should be called with the condition')

  t.deepEqual(metric, {...metricFixture.newMetric(), agentId: agentFixture.getOne.id, agent: agentFixture.getOne}, 'should be the same object')
})