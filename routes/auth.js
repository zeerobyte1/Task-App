const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/task');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('sessionId');
    res.redirect('/');
  });
});


module.exports = router;
