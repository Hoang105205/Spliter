const express = require('express');
const router = express.Router();
const activityController = require('../controllers/ActivitiesController');

// GET /api/activities/:userId
router.get('/:userId', activityController.getAllActivities);

module.exports = router;