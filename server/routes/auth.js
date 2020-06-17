const path = require('path')
const express = require('express')
const router = express.Router()

const TVP_ACCESS_ID = process.env.TVP_ACCESS_ID
const TVP_ACCESS_PASSCODE = process.env.TVP_ACCESS_PASSCODE

router.post('/sign-in', function(req, res, next) {
  var username = req.body.username
  var password = req.body.password
  if (username && password) {
    if (username == TVP_ACCESS_ID && password == TVP_ACCESS_PASSCODE) {
      req.session.authenticated = true
      req.session.username = username
      req.session.signInError = false
      res.redirect('/')
      return
    } else {
      req.session.authenticated = undefined
      req.session.username = undefined
      req.session.signInError = true
      res.redirect('/')
      return
    }
    res.end()
  } else {
    req.session.authenticated = undefined
    req.session.username = undefined
    req.session.signInError = true
    res.redirect('/')
  }
})

router.get('/sign-out', function(req, res, next) {
  req.session.authenticated = undefined
  req.session.username = undefined
  req.session.signInError = false
  res.redirect('/')
})

module.exports = router
