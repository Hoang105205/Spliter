const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/log_in.html'));
});

router.get('/sign-up', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/sign_up.html'));
});

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/dashboard.html'));
});

module.exports = router;
