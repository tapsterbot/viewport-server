const express = require('express')
const router = express.Router()

router.get('/', function(req, res, next) {
  res.render('home', {username: req.session.username})
})

module.exports = router