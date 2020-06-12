const express = require('express')
const basicAuth = require('express-basic-auth')
const { Server } = require('ws')
const url = require('url')

const PORT = process.env.PORT || 3000
const INDEX = '/static/index.html'

const app = express()
app.use(basicAuth({
    authorizer: authorized,
    challenge: true
}))
app.use(express.static('static'))

function authorized(username, password) {
    const userMatches = basicAuth.safeCompare(username, 'user')
    const passwordMatches = basicAuth.safeCompare(password, 'tapster!')

    return userMatches & passwordMatches
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

      } catch(err) {

      }
  })
})

wss_view.on('connection', (ws) => {
  console.log('Viewer connected')
  console.log('Total # clients: ' + wss_view.clients.size)
})

setInterval(() => {
  wss_view.clients.forEach((client) => {
    client.send(JSON.stringify({'type': 'date', 'data': new Date().toTimeString()}))
  })
}, 1000)

server.on('upgrade', function upgrade(request, socket, head) {
  var authHeader = request.headers.authorization

  if (!authHeader) {
    console.log('Denied connection request. No auth header')
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  } else {
    try {
      var username, password
      [username, password] = Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':')
      if (!authorized(username, password)) {
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

