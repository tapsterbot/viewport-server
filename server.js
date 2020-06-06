var express = require('express');
var { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/static/index.html';

var app = express()
app.use(express.static('static'))

var server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
var wss = new Server({ server });


wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);

