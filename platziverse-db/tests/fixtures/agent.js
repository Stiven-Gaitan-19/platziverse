'use strict'

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  cloneObject(agent, { id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test' }),
  cloneObject(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  cloneObject(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' })
]

function cloneObject (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  getOne: agent,
  getAll: agents,
  getConnected: agents.filter(agent => agent.connected),
  getPlatziUsers: agents.filter(agent => agent.username === 'platzi'),
  getOneById: (id) => agents.filter(agent => agent.id === id),
  getOneByUuid: (uuid) => agents.filter(agent => agent.uuid === uuid)
}
