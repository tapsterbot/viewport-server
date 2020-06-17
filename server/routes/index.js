const express = require('express')
const router = express.Router()

router.get('/', function(req, res, next) {

  if (req.session.authenticated) {
    console.log('Already authenticated.')
    res.render('home', {username: req.session.username})
    return
  }

  if (req.session.signInError && req.session.signInError == true) {
    res.render('sign-in', {error: true})
  } else {
    res.render('sign-in', {error: false})
  }
})

module.exports = router