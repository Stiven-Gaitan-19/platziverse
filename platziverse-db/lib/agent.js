'use strict'

module.exports = (agentModel) => {
  function findById (id) {
    return agentModel.findById(id)
  }

  async function save (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }
    const existingAgent = await agentModel.findOne(cond)

    if (existingAgent) {
      const updated = await agentModel.update(agent, cond)
      return updated ? agentModel.findOne(cond) : existingAgent
    }

    const result = await agentModel.create(agent)
    return result.toJSON()
  }

  return {
    findById,
    save
  }
}
