'use strict'

const agentFixture = require('./agent')

const metric = {
  id: 1,
  type: 'test',
  value: 'Hello this is for test',
  agentId: 1,
  agent: agentFixture.getOne
}

const metrics = [
  metric,
  cloneObject(metric, { id: 2, type: 'type1', value: 'random metric', agentId: 2, agent: agentFixture.getAll[2] }),
  cloneObject(metric, { id: 3, type: 'type2' }),
  cloneObject(metric, { id: 4, type: 'test', agentId: 3, agent: agentFixture.getAll[3] })
]

function cloneObject (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function getAllByUuid(uuid){
  return metrics.filter(metric => metric.agent.uuid === uuid)
}

function getOneByUuid(uuid){
  return metrics.filter(metric => metric.agent.uuid === uuid)
}

function getAllByTypeAndUuid(type, uuid){
  return metrics.filter(metric => {
    let metType = metric.type
    let metUuid = metric.agent.uuid
    return (metType === type && metUuid === uuid)
  })
}

function newMetric(){
  let newMetric = {...metric};
  delete newMetric.agent;
  delete newMetric.agentId;
  return newMetric;
}

module.exports = {
  metric,
  metrics,
  getAllByUuid,
  getOneByUuid,
  getAllByTypeAndUuid,
  newMetric
}
