const express = require('express');
const router = express.Router();
const { createReport, getAllReports, updateReportStatus } = require('../controllers/ReportsController');

// API: /api/reports/

// Get all reports
router.get('/', getAllReports);

// Create a new report
router.post('/', createReport);

// Update report status
router.put('/:id/status', updateReportStatus);

module.exports = router;
