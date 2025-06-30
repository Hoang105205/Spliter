const express = require('express');
const router = express.Router();
const {
    getAllGroupsOfUser,
    sendGroupReuqest,
    acceptGroupRequest,
    rejectGroupRequest,
    removeMember,
    getPendingGroupInvites,
    getSentGroupRequests
} = require('../controllers/groupMembersController');

// API: /api/group-members/

// Get all groups of a user
router.get('/:userId', getAllGroupsOfUser);

// Send a group request
router.post('/send-request', sendGroupReuqest);

// Accept a group request
router.put('/accept', acceptGroupRequest);

// Reject a group request
router.put('/reject', rejectGroupRequest);

// Remove a member from a group
router.delete('/remove-member', removeMember);

// Get pending group invites for a user
router.get('/:userId/pending-invites', getPendingGroupInvites);

// Get sent group requests for a user
router.get('/:userId/sent-requests', getSentGroupRequests);

module.exports = router;