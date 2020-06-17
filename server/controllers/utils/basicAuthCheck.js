const basicAuth = require('express-basic-auth')

const TVP_ACCESS_ID = process.env.TVP_ACCESS_ID
const TVP_ACCESS_PASSCODE = process.env.TVP_ACCESS_PASSCODE

function checkIdAndPasscode(access_id, access_passcode) {
    const idMatches = basicAuth.safeCompare(access_id, TVP_ACCESS_ID)
    const passcodeMatches = basicAuth.safeCompare(access_passcode, TVP_ACCESS_PASSCODE)
    return idMatches & passcodeMatches
}

module.exports = function(request, socket) {
  var authHeader = request.headers.authorization
  if (!authHeader) {
    console.log('Denied connection request. No auth header')
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return false
  } else {
    try {
      var userid, passcode
      [userid, passcode] = Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':')
      if (checkIdAndPasscode(userid, passcode)) {
        return true
      } else {
        console.log('Denied connection request. Auth failed.')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return false
      }
    } catch(err) {
      console.log('Denied connection request. Server Error.')
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
      socket.destroy()
      return false
    }
  }
}