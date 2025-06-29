const { Friends, Users } = require('../schemas');
const { Op } = require('sequelize');

const getFriendsOfUser = async (req, res) => {
  const { userid } = req.params;
  
  try {
    const friends = await Friends.findAll({
      where: {
        status: 'accepted',
        // Get all where user is either userId or friendId
        [Op.or]: [
          { requesterId: userid },
          { addresseeId: userid }
        ]
      },
      include: [
        // Just include requester and addressee information
        { model: Users, as: 'requester', attributes: ['id', 'username', 'email'] },
        { model: Users, as: 'addressee', attributes: ['id', 'username', 'email'] }
      ]
    });
    if (!friends || friends.length === 0) {
      return res.status(404).json({ message: 'No friends found.' });
    }
    // Map the results to get only the user information
    const result = friends.map(f => {
      // If requester is the user, return addressee, otherwise return requester
      return f.requesterId === userid ? f.addressee : f.requester;
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  const { requesterId, addresseeId } = req.body;
  try {
    // Check if request already exists
    const exists = await Friends.findOne({ 
      where: {
        [Op.or]: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ],
        status: { [Op.in]: ['pending', 'accepted'] }
      },
    });
    if (exists) {
      return res.status(400).json({ message: 'Friend request already sent or exists.' });
    }
    const friendRequest = await Friends.create({ requesterId, addresseeId, status: 'pending' });
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params; // Friends table record id
  try {
    const friendRequest = await Friends.findByPk(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }
    friendRequest.status = 'accepted';
    await friendRequest.save();
    res.status(200).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFriend = async (req, res) => {
  const { requestId } = req.params; // Friends table record id
  try {
    const deleted = await Friends.destroy({ where: { id: requestId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Friend not found.' });
    }
    res.status(200).json({ message: 'Friend deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending friend requests for a user
const getPendingFriendRequests = async (req, res) => {
  const { userid } = req.params
  try {
    const requests = await Friends.findAll({
      where: {
        status: 'pending',
        addresseeId: userid
      },
      include: [
        // just include requester information
        { model: Users, as: 'requester', attributes: ['id', 'username', 'email'] }
      ]
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deny a friend request
const denyFriendRequest = async (req, res) => {
  const { requestId } = req.params; // Friends table record id
  try {
    const friendRequest = await Friends.findByPk(requestId);
    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.status(404).json({ message: 'Pending friend request not found.' });
    }
    friendRequest.status = 'rejected';
    await friendRequest.save(); // Save the change to status
    res.status(200).json({ message: 'Friend request rejected.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSentFriendRequests = async (req, res) => {
  const { userid } = req.params; // User ID of the logged-in user
  try {
    const sentRequests = await Friends.findAll({
      where: {
        requesterId: userid,
        status: 'pending'
      },
      include: [
        { model: Users, as: 'addressee', attributes: ['id', 'username', 'email'] }
      ]
    });
    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFriendsOfUser,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  getPendingFriendRequests,
  denyFriendRequest,
  getSentFriendRequests
};