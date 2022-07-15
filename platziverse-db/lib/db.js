'use strict'

const Sequelize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (options) {
  if (!sequelize) {
    sequelize = new Sequelize(options)
  }

  return sequelize
}
