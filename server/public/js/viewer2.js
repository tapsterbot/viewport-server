
let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST + '/viewer2')
let el
let lastPositionTime = new Date().getTime()

ws.onmessage = (event) => {
  try {

    var msg = JSON.parse(event.data)

    if (msg.type == 'date') {
      //console.log('Received Date: ' + msg.data)
      //el = document.getElementById('server-time')
      //el.innerHTML = 'Server time: ' + msg.data
    }
    else if (msg.type == 'image') {
      imageElem = document.getElementById('live-stream')
      if (imageElem) {
        if (msg.data.length != 0) {
           imageElem.src = `data:image/jpeg;base64,${msg.data}`
        } else {
          imageElem.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
        }
      }
    }
  } catch(err) {
    console.log(err)
  }
}

var liveStreamImg = document.getElementById("live-stream")

function getMousePos(evt, wait = true) {
  console.log(wait)
  var pos = null
  let now = new Date().getTime()
  if (now - lastPositionTime > 200) { // 200 ms
    lastPositionTime = now

    var rect = liveStreamImg.getBoundingClientRect()

    pos = {
       //x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * liveStreamImg.naturalWidth),
       //y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * liveStreamImg.naturalHeight)
       x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * 768),
       y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * 1024)
    }
    if (pos.x < 768 && pos.y < 1024) {
      console.log(pos.x, pos.y)
      return pos
    }
  }
}

function sendMouseMove(evt) {
  var pos = getMousePos(evt, true)
  if (pos) {
    ws.send(JSON.stringify({'type': 'mouseMove', 'data': {x:pos.x, y:pos.y}}))
  }
}

function sendMouseUp(evt) {
  var pos = getMousePos(evt, false)
  if (pos) {
    ws.send(JSON.stringify({'type': 'mouseUp', 'data': {x:pos.x, y:pos.y}}))
  }
}


window.addEventListener('mousemove', sendMouseMove, false);
window.addEventListener('mouseup', sendMouseUp, false);