'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const metricFixture = require('./fixtures/metric')

let db = null
let sandbox = null
let MetricStub = null
const uuid = 'yyy-yyy-yyy'

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

const AgentStub = {
  hasMany: sinon.spy()
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy(),
    findAll: sandbox.stub(),
    create: sandbox.stub(),
    findOne: sandbox.stub()
  }

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
  const metrics = await db.Metric.findByUuid(uiid)

  t.true(metricStub.findAll.called, 'findAll should be called')
  t.true(metricStub.findAll.calledOne, 'findAll should be called only once')
  t.true(metricStub.findAll.calledWith(), 'findOne should be called with the condition')

  t.deepEqual(metrics, metricFixture.getByUuid, 'should be the same object')
})

test.serial('Metric #findByTypeAgentUuid', async (t) => {
  const metrics = await db.Metric.findByUuid(uiid)

  t.true(metricStub.findAll.called, 'findAll should be called')
  t.true(metricStub.findAll.calledOne, 'findAll should be called only once')
  t.true(metricStub.findAll.calledWith(), 'findOne should be called with the condition')

  t.deepEqual(metrics, metricFixture.getByUuid, 'should be the same object')
})

test.serial('Metric #create - with nonexists uuid', async (t) => {
  const metrics = await db.Metric.findByUuid(uiid)

  t.true(metricStub.findOne.called, 'findOne should be called')
  t.true(metricStub.findOne.calledOne, 'findOne should be called only once')
  t.true(metricStub.findOne.calledWith(), 'findOne should be called with the condition')

  t.deepEqual(metrics, metricFixture.getByUuid, 'should be the same object')
})

test.serial('Metric #create - with existing uuid', async (t) => {
  const metrics = await db.Metric.findByUuid(uiid)

  t.true(metricStub.findOne.called, 'findOne should be called')
  t.true(metricStub.findOne.calledOne, 'findOne should be called only once')
  t.true(metricStub.findOne.calledWith(), 'findOne should be called with the condition')
  t.true(metricStub.create.called, 'create should be called')
  t.true(metricStub.create.calledOne, 'create should be called only once')
  t.true(metricStub.create.calledWith(), 'findOne should be called with the condition')

  t.deepEqual(metrics, metricFixture.getByUuid, 'should be the same object')
})
