const environment = process.env.NODE_ENV || 'staging'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)