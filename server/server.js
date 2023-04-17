const express = require('express')
const path = require('path')
const helmet = require('helmet')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)
const bodyParser = require('body-parser')
const requireSignIn = require('./controllers/utils/requireSignIn')

// Get routes
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var homeRouter = require('./routes/home')
var viewRouter = require('./routes/view')
var viewRouter2 = require('./routes/view2')

// Get environment variables
const PORT = process.env.PORT || 3000
const TVP_ACCESS_ID = process.env.TVP_ACCESS_ID
const TVP_ACCESS_PASSCODE = process.env.TVP_ACCESS_PASSCODE
const SESSION_SECRET = process.env.SESSION_SECRET

// Exit if environment variables are not set
if ( (TVP_ACCESS_ID === undefined) ||
     (TVP_ACCESS_PASSCODE === undefined) ||
     (SESSION_SECRET === undefined) ) {
  console.log('Error: Missing environment variables!')
  console.log('  From the terminal, run this:\n')
  console.log('  source config/env-vars.sh\n')
  return
}

// Database set-up
const environment = process.env.NODE_ENV || 'staging'
const configuration = require('./config/knexfile')[environment]
const database = require('knex')(configuration)
const store = new KnexSessionStore({
  knex: database,
  createtable: true,
  tablename: 'sessions'
})

// Server set-up
const app = express()
//app.use(helmet())
var sess = {
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 10000 * 60, // 60 seconds, for testing
      httpOnly: true
    },
    store,
    resave: false,
    saveUninitialized: false
}
if (app.get('env') === 'production') {
  console.log('Enabling production cookie settings')
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.locals.store = store
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/home', requireSignIn, homeRouter)
app.use('/view', requireSignIn, viewRouter)
app.use('/view2', requireSignIn, viewRouter2)

var server = require('http').createServer(app)
var wsServer = require('./controllers/websocket')(server, app)

server.listen(PORT, () => {
  console.log('Environment: ' + environment)
  console.log(`Listening on ${PORT}`)
  database.raw(configuration.connectionCheck)
    .then((data) => {
      if (data.rows) { // PostgreSQL
        console.log(data.rows[0].message)
      } else { // SQLite3
        console.log(data[0].message)
      }
    })
    .catch(function(err) {
      console.error(err);
    })
})




