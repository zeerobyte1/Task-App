var express = require('express');
var router = express.Router();

/* GET home page - login */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/task');
  } else {
    res.render('login');
  }
});

module.exports = router;
