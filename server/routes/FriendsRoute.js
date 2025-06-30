const express = require('express');
const router = express.Router();
const {
  getFriendsOfUser,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  getPendingFriendRequests,
  denyFriendRequest,
  getSentFriendRequests
} = require('../controllers/FriendsController');


// API: /api/friends/

// Get friends of a user
router.get('/:userid', getFriendsOfUser);

// Send a friend request
router.post('/add-friend', sendFriendRequest);

// Get pending friend requests for a user
router.get('/:userid/pending', getPendingFriendRequests);

// Get sent friend requests for the logged-in user
router.get('/:userid/sent-requests', getSentFriendRequests);

// Accept a friend request
router.put('/:requestId/accept', acceptFriendRequest);

// Deny a friend request
router.put('/:requestId/deny', denyFriendRequest);

// Delete a friend
router.delete('/:requestId', deleteFriend);


module.exports = router;