const express = require('express');
const passport = require('passport');
const router = express.Router();

const jwt = require('jsonwebtoken');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res) => {
    const username = req.user.username

    // Tạo JWT chỉ chứa username
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.redirect(`/oauth2/redirect?token=${token}`);
  }
);
module.exports = router;
