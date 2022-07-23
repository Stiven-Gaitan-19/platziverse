'use strict'

const metric = {
  id: 1,
  type: 'test',
  value: 'Hello this is for test',
  agentId: 1
}

const metrics = [
  metric,
  cloneObject(metric, { id: 2, type: 'type1', value: 'random metric', agentId: 2 }),
  cloneObject(metric, { id: 3, type: 'type2' }),
  cloneObject(metric, { id: 4, type: 'type3', agentId: 3 })
]

function cloneObject (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  metric,
  metrics
}
