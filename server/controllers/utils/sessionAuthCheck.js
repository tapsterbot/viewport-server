var cookie = require('cookie')
var signature = require('cookie-signature')

function deny(socket) {
  console.log('Connection request denied. Invalid session.')
  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
  socket.destroy()
}

module.exports = function(app, request, socket, callback) {
  var store = app.locals.store
  if (request.headers.cookie) {
    var cookies = cookie.parse(request.headers.cookie)
    var cookieName = 'connect.' + store.sidfieldname
    if (cookies.hasOwnProperty(cookieName)) {
      // Signed cookies begin with "s:'
      var cookieData = cookies[cookieName].substr(2)
      // Check signature & get session id
      var sessionId = signature.unsign(cookieData,process.env.SESSION_SECRET)
      // If sessionId is not undefined, that means the cookie wasn't tampered with.
      if (sessionId) {
        store.get(sessionId, function cookieData(error, session) {
          callback(session)
        })
      } else {
        deny(socket)
      }
    } else {
      deny(socket)
    }
  } else {
    deny(socket)
  }
}

