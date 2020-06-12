const express = require('express')
const basicAuth = require('express-basic-auth')
const { Server } = require('ws')
const url = require('url')

const TVP_ACCESS_ID = process.env.TVP_ACCESS_ID
const TVP_ACCESS_PASSCODE = process.env.TVP_ACCESS_PASSCODE

if ( (TVP_ACCESS_ID === undefined) || (TVP_ACCESS_PASSCODE === undefined) ) {
  console.log('Error: Missing environment variables (TVP_ACCESS_ID or TVP_ACCESS_PASSCODE)')
  return
}

const PORT = process.env.PORT || 3000
const INDEX = '/static/index.html'

const app = express()
app.use(basicAuth({
    authorizer: authorized,
    challenge: true
}))
app.use(express.static('static'))

function authorized(access_id, access_passcode) {
    const idMatches = basicAuth.safeCompare(access_id, TVP_ACCESS_ID)
    const passcodeMatches = basicAuth.safeCompare(access_passcode, TVP_ACCESS_PASSCODE)

    return idMatches & passcodeMatches
}

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))
const wss_cam = new Server({ noServer: true })
const wss_view = new Server({ noServer: true })

wss_cam.on('connection', (ws) => {
  console.log('Camera connected')
  console.log('Total # cameras: ' + wss_cam.clients.size)
  ws.on('close', () => console.log('Client disconnected'))

  ws.on('message', function incoming(message) {
      try {
        var msg = JSON.parse(message)

        if (msg.type == 'message') {
          console.log('Received Message: ' + msg.data)
        }

        else if (msg.type == 'image') {
          console.log('Received image from camera ')
          wss_view.clients.forEach((client) => {
            client.send(message)
            console.log('Sending image to viewer(s)')
          })
        }
      } catch(err) {}
  })
})

wss_view.on('connection', (ws) => {
  console.log('Viewer connected')
  console.log('Total # clients: ' + wss_view.clients.size)
})

server.on('upgrade', function upgrade(request, socket, head) {
  var authHeader = request.headers.authorization

  if (!authHeader) {
    console.log('Denied connection request. No auth header')
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  } else {
    try {
      var userid, passcode
      [userid, passcode] = Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':')
      if (!authorized(userid, passcode)) {
        console.log('Denied connection request. Auth failed.')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
    } catch(err) {
      console.log('Denied connection request. Server Error.')
      console.log(err)
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
      socket.destroy()
      return
    }
  }

  const pathname = url.parse(request.url).pathname
  if (pathname === '/camera') {
    console.log('Camera request auth...')
    wss_cam.handleUpgrade(request, socket, head, function done(ws) {
      wss_cam.emit('connection', ws, request)
    })
  } else if (pathname === '/viewer') {

    if (authHeader) {
      console.log('Viewer request auth...')
    }
    wss_view.handleUpgrade(request, socket, head, function done(ws) {
      wss_view.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

setInterval(() => {
  wss_view.clients.forEach((client) => {
    client.send(JSON.stringify({'type': 'date', 'data': new Date().toTimeString()}))
  })
}, 1000)

