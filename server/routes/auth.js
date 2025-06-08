const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
module.exports = router;
