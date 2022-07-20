'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixture = require('./fixtures/agent')

const config = {
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
let db = null
const MetricStub = {
  belongsTo: sinon.spy()
}
let AgentStub = null
let sandbox = null
const id = 1
const uuid = 'yyy-yyy-yyy'
const whereCondition = {
  where: {
    uuid
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy(),
    findById: sandbox.stub(),
    findOne: sandbox.stub(),
    update: sandbox.stub(),
    create: sandbox.stub()
  }

  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixture.getOneById(id)))
  AgentStub.findOne.withArgs(whereCondition).returns(Promise.resolve(agentFixture.getOne))
  AgentStub.update.withArgs(agentFixture.getOne, whereCondition).returns(Promise.resolve(agentFixture.getOne))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', t => t.truthy(db.Agent, 'Agent service should exists'))

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentStub.hasMany was changed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the AgentModel')
  t.true(MetricStub.belongsTo.called, 'Metric.belongsTo was changed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the MetricModel')
})

test.serial('Agent - findById', async (t) => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called')
  t.true(AgentStub.findById.calledOnce, 'findById should be called only once')
  t.true(AgentStub.findById.calledWith(id), `findById should be called with the id "${id}"`)

  t.deepEqual(agent, agentFixture.getOneById(id), 'should be the same object')
})

test.serial('Agent - save for exits agent', async (t) => {
  const agent = await db.Agent.save(agentFixture.getOne)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called at leat twice')
  t.true(AgentStub.findOne.calledWith(whereCondition), 'findOne should be called with the condition')
  t.true(AgentStub.update.called, 'update should be called')
  t.true(AgentStub.update.calledOnce, 'update should be called only once')
  t.true(AgentStub.update.calledWith(agentFixture.getOne, whereCondition), 'update should be called with the agent object and condition')

  t.deepEqual(agent, agentFixture.getOne, 'should be the same object')
})
