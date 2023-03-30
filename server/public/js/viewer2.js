
let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST + '/viewer2')
let el
let lastPositionTime = new Date().getTime()

var orientation = {
  "portrait": {
    x: 768,
    y: 1024
  },
  "landscape": {
    x: 1024,
    y: 768
  }
}

var mouseDrag = false;
var shiftIsDown = false;
var selectingRegion = false;

ws.onmessage = (event) => {
  try {

    var msg = JSON.parse(event.data)

    if (msg.type == 'date') {
      //console.log('Received Date: ' + msg.data)
      //el = document.getElementById('server-time')
      //el.innerHTML = 'Server time: ' + msg.data
    }
    else if (msg.type == 'image') {
      var imageElem = document.getElementById('live-stream')
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
  //console.log(wait)
  var currentOrientation = orientation["portrait"]
  var pos = null
  let now = new Date().getTime()
  if (now - lastPositionTime > 100) { // 100 ms
    lastPositionTime = now

    var rect = liveStreamImg.getBoundingClientRect()
    if (rect.width > rect.height) {
      var currentOrientation = orientation["landscape"]
    }
    pos = {
       //x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * liveStreamImg.naturalWidth),
       //y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * liveStreamImg.naturalHeight)
       x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * currentOrientation.x),
       y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * currentOrientation.y)
    }
    if (pos.x < currentOrientation.x && pos.y < currentOrientation.y) {
      console.log(pos.x, pos.y)
      return pos
    }
  }
}

function onMouseMove(evt) {
  mouseDrag = true;
  var pos = getMousePos(evt, false)
  if (pos) {
    ws.send(JSON.stringify({'type': 'mouseMove', 'data': {x:pos.x, y:pos.y}, 'drag': mouseDrag}))
  }

  var yo = document.getElementById('yo')
  console.log('selectingRegion: ', selectingRegion)
  if (!selectingRegion) {
    yo.style.left = (evt.clientX - 10) + 'px';
    yo.style.top = (evt.clientY - 10) + 'px';
  } else {
    //yo.style.width = 50 + 'px';
    //yo.style.height = 50 + 'px';
    var left = yo.style.left.split('px')[0]
    var top = yo.style.top.split('px')[0]
    yo.style.setProperty("--width", (evt.clientX - left) + 'px');
    yo.style.setProperty("--height", (evt.clientY - top) + 'px');

    console.log('yo.style.left:', yo.style.left)
    console.log('evt.clientX:', evt.clientX)
  }

}

function onMouseDown(evt) {
  mouseDrag = false
  if (shiftIsDown) { // shift
    selectingRegion = true
  }
  var pos = getMousePos(evt, false)
  console.log('Down position: ' + pos.x + ',' + pos.y)
  if (pos) {
    ws.send(JSON.stringify({'type': 'mouseDown', 'data': {x:pos.x, y:pos.y}}))
  }
}

function onMouseUp(evt) {
  mouseDrag = false
  if (!shiftIsDown) {
    if (!selectingRegion) {
      var pos = getMousePos(evt, false)
      if (pos) {
        ws.send(JSON.stringify({'type': 'mouseUp', 'data': {x:pos.x, y:pos.y}, 'drag': mouseDrag}))
      }
    }
  }
  selectingRegion = false
}



function onKeyDown(evt) {
  var imageElem = document.getElementById('live-stream')
  var yo = document.getElementById('yo')
  if (evt.keyCode == 16) { // shift
    shiftIsDown = true;
    //imageElem.classList.add('dim')
    yo.classList.add('overlay')
  }
}

function onKeyUp(evt) {
  var imageElem = document.getElementById('live-stream')
  var yo = document.getElementById('yo')
  if (evt.keyCode == 16) { // shift
    shiftIsDown = false;
    //imageElem.classList.remove('dim')
    yo.classList.remove('overlay')
    yo.style.setProperty("--width",  '20px');
    yo.style.setProperty("--height", '20px');
  }
}

//document.addEventListener("keypress", onKeyPress)
document.addEventListener("keydown", onKeyDown)
document.addEventListener("keyup", onKeyUp)
window.addEventListener('mousemove', onMouseMove, false)
window.addEventListener('mouseup', onMouseUp, false)
window.addEventListener('mousedown', onMouseDown, false)