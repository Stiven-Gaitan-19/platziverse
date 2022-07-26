'use strict'

module.exports = function setupMetric (agentModel, metricModel) {
  async function findByUuid (uuid) {
    return metricModel.findAll({
      raw: true,
      attributes: ['type'],
      group: ['type'],
      include: [
        {
          attributes: [],
          model: agentModel,
          where: { uuid }
        }
      ]
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return metricModel.findAll({
      where: { type },
      limit: 20,
      order: [['created', 'DESC']],
      include: [
        {
          model: agentModel,
          attributes: [],
          where: { uuid }
        }
      ]
    })
  }

  async function save (uuid, metric) {
    const agent = await agentModel.findOne({ where: { uuid } })

    if (agent) {
      metric.agentId = agent.id
      const result = await metricModel.create(metric)
      return result.toJSON()
    }
  }

  return {
    findByUuid,
    findByTypeAgentUuid,
    save
  }
}
