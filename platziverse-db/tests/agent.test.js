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
const username = 'platzi'
const newAgent = agentFixture.getAll[1]
const whereCondition = {
  where: {
    uuid
  }
}
const whereUuidCreate = {
  where: {
    uuid: newAgent.uuid
  }
}
const whereUsername = {
  where: {
    username
  }
}
const whereConnected = {
  where: {
    connected: true
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy(),
    findById: sandbox.stub(),
    findOne: sandbox.stub(),
    update: sandbox.stub(),
    create: sandbox.stub(),
    findAll: sandbox.stub()
  }

  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixture.getOneById(id)))
  AgentStub.findOne.withArgs(whereCondition).returns(Promise.resolve(agentFixture.getOne))
  AgentStub.update.withArgs(agentFixture.getOne, whereCondition).returns(Promise.resolve(agentFixture.getOne))
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({ toJSON () { return newAgent } }))
  AgentStub.findAll.withArgs(whereUsername).returns(Promise.resolve(agentFixture.getPlatziUsers))
  AgentStub.findAll.withArgs(whereConnected).returns(Promise.resolve(agentFixture.getConnected))
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixture.getAll))

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

test.serial('Agent #findById()', async (t) => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called')
  t.true(AgentStub.findById.calledOnce, 'findById should be called only once')
  t.true(AgentStub.findById.calledWith(id), `findById should be called with the id "${id}"`)

  t.deepEqual(agent, agentFixture.getOneById(id), 'should be the same object')
})

test.serial('Agent #save() - exits', async (t) => {
  const agent = await db.Agent.save(agentFixture.getOne)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called at leat twice')
  t.true(AgentStub.findOne.calledWith(whereCondition), 'findOne should be called with the condition')
  t.true(AgentStub.update.called, 'update should be called')
  t.true(AgentStub.update.calledOnce, 'update should be called only once')
  t.true(AgentStub.update.calledWith(agentFixture.getOne, whereCondition), 'update should be called with the agent object and condition')

  t.deepEqual(agent, agentFixture.getOne, 'should be the same object')
})

test.serial('Agent #save() - new', async (t) => {
  const agent = await db.Agent.save(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called only once')
  t.true(AgentStub.findOne.calledWith(whereUuidCreate), 'findOne should be called with the condition')
  t.true(AgentStub.create.called, 'create should be called')
  t.true(AgentStub.create.calledOnce, 'create should be called only once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with the agent object and condition')

  t.deepEqual(agent, newAgent, 'should be the same object')
})

test.serial('Agent #findByUuid()', async (t) => {
  const agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called only once')
  t.true(AgentStub.findOne.calledWith(whereCondition), 'findOne should be called with the condition')

  t.deepEqual(agent, agentFixture.getOne, 'should be the same object')
})

test.serial('Agent #findByUsername()', async (t) => {
  const platziAgents = await db.Agent.findByUsername(username)

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called only once')
  t.true(AgentStub.findAll.calledWith(whereUsername), 'findAll should be called with the condition')

  t.deepEqual(platziAgents, agentFixture.getPlatziUsers, 'should be the same object')
})

test.serial('Agent #findByConnected()', async (t) => {
  const connectedAgents = await db.Agent.findByConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called only once')
  t.true(AgentStub.findAll.calledWith(whereConnected), 'findAll should be called with the condition')

  t.deepEqual(connectedAgents, agentFixture.getConnected, 'should be the same object')
})

test.serial('Agent #findAll()', async (t) => {
  const agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called only once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called with the condition')

  t.deepEqual(agents, agentFixture.getAll, 'should be the same object')
})
