const express = require('express')
const path = require('path')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)
const bodyParser = require('body-parser')
const requireSignIn = require('./controllers/utils/requireSignIn')

// Get routes
var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var homeRouter = require('./routes/home')
var viewRouter = require('./routes/view')

// Get environment variables
const PORT = process.env.PORT || 3000
const TVP_ACCESS_ID = process.env.TVP_ACCESS_ID
const TVP_ACCESS_PASSCODE = process.env.TVP_ACCESS_PASSCODE
const SESSION_SECRET = process.env.SESSION_SECRET

if ( (TVP_ACCESS_ID === undefined) ||
     (TVP_ACCESS_PASSCODE === undefined) ||
     (SESSION_SECRET === undefined) ) {
  console.log('Error: Missing environment variables!')
  return
}

// Database set-up
const environment = process.env.NODE_ENV || 'staging'
const configuration = require('./config/knexfile')[environment]
const database = require('knex')(configuration)

const store = new KnexSessionStore({
  knex: database,
  createtable: false,
  tablename: 'sessions'
})

// Server set-up
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  session({
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 10000 * 60, // 60 seconds, for testing
      httpOnly: false
    },
    store,
    resave: false,
    saveUninitialized: false
  })
)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.locals.store = store
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/home', requireSignIn, homeRouter)
app.use('/view', requireSignIn, viewRouter)

var server = require('http').createServer(app)
var wsServer = require('./controllers/websocket')(server, app)

server.listen(PORT, () => {
  console.log('Environment: ' + environment)
  console.log(`Listening on ${PORT}`)
  database.raw("SELECT 'Connected to database'::text as message;")
    .then((data) => console.log(data.rows[0].message))
})




