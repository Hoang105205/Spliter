const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/ReportsController');

// API: /api/reports/

// Create a new report
router.post('/', createReport);

module.exports = router;
