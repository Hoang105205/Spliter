const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res) => {
    // // Lưu ý: req.user ở đây có thể không còn trường isNew nếu bạn không serialize đủ thông tin
    // if (req.user.isNew) {
    //   req.session.isNewUser = true; // Lưu vào session
    // }
    
    res.redirect('/dashboard');
  }
);
module.exports = router;
