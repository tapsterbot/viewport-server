
let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST + '/viewer')
let el
ws.onmessage = (event) => {
  try {

    var msg = JSON.parse(event.data)

    if (msg.type == 'date') {
      //console.log('Received Date: ' + msg.data)
      el = document.getElementById('server-time')
      el.innerHTML = 'Server time: ' + msg.data
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

// var elem;
// function openFullscreen() {
//   var elem = document.getElementById("live-stream")
//   if (elem.requestFullscreen) {
//     elem.requestFullscreen();
//   } else if (elem.mozRequestFullScreen) { /* Firefox */
//     elem.mozRequestFullScreen();
//   } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
//     elem.webkitRequestFullscreen();
//   } else if (elem.msRequestFullscreen) { /* IE/Edge */
//     elem.msRequestFullscreen();
//   }
// }

