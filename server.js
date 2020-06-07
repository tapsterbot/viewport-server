const express = require('express');
const basicAuth = require('express-basic-auth')
const { Server } = require('ws')

const PORT = process.env.PORT || 3000
const INDEX = '/static/index.html'

const app = express()
app.use(basicAuth({
    users: { 'someuser': 'somepassword' },
    challenge: true,
    realm: 'Imb4T3st4pp',
}))
app.use(express.static('static'))

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`))
const wss = new Server({ server });


wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));

  ws.on('message', function incoming(message) {
      try {
        var msg = JSON.parse(message)

        if (msg.type == 'message') {
          console.log('Received Message: ' + msg.data)
        }

        else if (msg.type == 'image') {
          console.log('Received Image: ')

          wss.clients.forEach((client) => {
            client.send(message);
          })

        }

      } catch(err) {

      }
  })

})

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({'type': 'date', 'data': new Date().toTimeString()}));
  });
}, 1000);

