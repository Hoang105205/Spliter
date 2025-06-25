const express = require('express');
const router = express.Router();
const {
  getFriendsOfUser,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend
} = require('../controllers/FriendsController');


// Get friends of a user
router.get('/:id', getFriendsOfUser);

// Send a friend request
router.post('/', sendFriendRequest);

// Accept a friend request
router.put('/:id/accept', acceptFriendRequest);

// Delete a friend
router.delete('/:id', deleteFriend);

module.exports = router;