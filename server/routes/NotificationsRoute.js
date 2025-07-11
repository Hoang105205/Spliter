const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead
} = require('../controllers/NotificationsController');

// API: /api/notifications/

// Get notifications for the logged-in user
router.get('/:id', getNotifications);

// Mark a notification as read
router.put('/:id/mark-as-read', markAsRead);

module.exports = router;