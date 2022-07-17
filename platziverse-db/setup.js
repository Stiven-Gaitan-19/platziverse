'use strict'

const debug = require('debug')('platziverse:db:setup')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')

const prompt = inquirer.createPromptModule()

async function setup () {

  let response = await prompt([{
    type: 'confirm',
    name: 'setup',
    message: 'Do you want to re-create the database?'
  }]);

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USERNAME || 'platzi',
    password: process.env.DB_PASSWORD || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: response?.setup
  }

  await db(config).catch(handleError)

  console.log('Success!')
  process.exit(0)
}

function handleError (err) {
  console.error(chalk.red('[Error] => ')+err.message)
  console.error(err.stack)
  process.exit(1)
}

setup()
