const express = require('express')
const app = express()
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

const environment = process.env.NODE_ENV || 'staging'
const configuration = require('../config/knexfile')[environment]
const database = require('knex')(configuration);

const store = new KnexSessionStore({
  knex: database,
  createtable: false,
  tablename: 'sessions'
})

app.use(
  session({
    secret: 'keyboard cat',
    cookie: {
      maxAge: 10000, // ten seconds, for testing
    },
    store,
    resave: false,
    saveUninitialized: false
  })
)

app.use('/yo', (req, res) => {
  const n = req.session.views || 0
  req.session.views = n + 1
  res.end(`${n} views`)
})

app.listen(3000)