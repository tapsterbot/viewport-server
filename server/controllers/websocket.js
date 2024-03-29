const { Server } = require('ws')
const url = require('url')
var checkBasicAuth = require('./utils/basicAuthCheck')
var checkValidSession = require('./utils/sessionAuthCheck')

const wss_cam = new Server({ noServer: true })
//wss_cam.bytesCount = 0;
//wss_cam.start = 0;

const wss_view = new Server({ noServer: true })

function deny(socket) {
  console.log('Connection request denied. Invalid session.')
  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
  socket.destroy()
}

module.exports = function(server, app) {
  if (server) {
    wss_cam.on('connection', (ws) => {
      console.log('Agent connected')
      console.log('Total # agents: ' + wss_cam.clients.size)
      ws.on('close', () => {
        console.log('Agent disconnected')

        wss_view.clients.forEach((client) => {
          console.log('Sending empty to viewer(s)')
          client.send(JSON.stringify({'type': 'image', 'data': ""}))
        })

      })

      ws.on('message', function incoming(message) {
          try {
            var msg = JSON.parse(message)

            if (msg.type == 'message') {
              console.log('Received Message: ' + msg.data)
            }

            else if (msg.type == 'image') {
              //console.log('Received image from agent ')

              //wss_cam.bytesCount += msg.data.length
              //console.log('Data Count: ' + (wss_cam.bytesCount/1000000).toFixed(2) + 'MB')
              //console.log('Duration: ' + ( (Date.now() / 1000) -  wss_cam.start).toFixed(2) )
              ///if (((Date.now() / 1000) -  wss_cam.start) > 60 ) {
              //  console.log('MB/min: ' + (wss_cam.bytesCount/1000000).toFixed(2))
              //  wss_cam.start = Date.now() / 1000;
              //}

              wss_view.clients.forEach((client) => {
                client.send(message.toString())
                //console.log('Sending image to viewer(s)')
              })
            }
          } catch(err) {}
      })
    })

    wss_view.on('connection', (ws) => {
      console.log('Viewer connected')
      console.log('Total # clients: ' + wss_view.clients.size)

      ws.on('message', function incoming(message) {
        console.log('Got message from viewer')
        console.log(message.toString())
        wss_cam.clients.forEach((client) => {
          console.log('Sending message to agent(s)')
          var msgData = message.toString()
          console.log(msgData)
          //client.send(JSON.stringify({'type': 'message', 'data': msgData}))
          client.send(msgData)
        })
      })
    })

    setInterval(() => {
      // Send heartbeat to viewers
      wss_view.clients.forEach((client) => {
        client.send(JSON.stringify({'type': 'date', 'data': new Date().toTimeString()}))
      })

      // Send note to agent that a viewer connected
      wss_cam.clients.forEach((client) => {
        var message = {'viewers-connected': wss_view.clients.size}
        client.send(JSON.stringify({'type': 'message', 'data': message}))
      })

    }, 1000)

    setInterval(() => {
      // Send note to agent that a viewer connected
      wss_cam.clients.forEach((client) => {
        var message = {'viewers-connected': wss_view.clients.size}
        client.send(JSON.stringify({'type': 'message', 'data': message}))
      })

    }, 500)

    server.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname
      if (pathname === '/camera') {
        if (checkBasicAuth(request, socket)) {
          console.log('Agent authenticated')
          wss_cam.handleUpgrade(request, socket, head, function done(ws) {
            wss_cam.emit('connection', ws, request)
          })
        }
      } else if (pathname === '/viewer') {
        checkValidSession(app, request, socket, (session) => {
          if (session.authenticated) {
            console.log('Viewer authenticated')
            console.log('  Username: ' + session.username)
            wss_view.handleUpgrade(request, socket, head, function done(ws) {
              wss_view.emit('connection', ws, request)
            })
          } else {
            deny(socket)
          }
        })
      } else if (pathname === '/viewer2') {
        // FIXME: This is a test. A dangerous test. Add back auth as soon as possible.
        wss_view.handleUpgrade(request, socket, head, function done(ws) {
          wss_view.emit('connection', ws, request)
        })
      } else {
        socket.destroy()
      }
    })
  }
  return server
}