const express = require('express');
const router = express.Router();
const {
  getFriendsOfUser,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  getPendingFriendRequests,
  denyFriendRequest
} = require('../controllers/FriendsController');


// Get friends of a user
router.get('/:id', getFriendsOfUser);

// Send a friend request
router.post('/', sendFriendRequest);

// Get pending friend requests for a user
router.get('/:id/pending', getPendingFriendRequests);

// Accept a friend request
router.put('/:id/accept', acceptFriendRequest);

// Deny a friend request
router.put('/:id/deny', denyFriendRequest);

// Delete a friend
router.delete('/:id', deleteFriend);


module.exports = router;