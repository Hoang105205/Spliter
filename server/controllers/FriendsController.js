const { Friends, Users } = require('../schemas');
const { Op } = require('sequelize');

const getFriendsOfUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const friends = await Friends.findAll({
      where: {
        status: 'accepted',
        // Get all where user is either userId or friendId
        [Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: [
        { model: Users, as: 'requester', attributes: ['id', 'username', 'email'] },
        { model: Users, as: 'addressee', attributes: ['id', 'username', 'email'] }
      ]
    });
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  const { requesterId, addresseeId } = req.body;
  try {
    // Check if request already exists
    const exists = await Friends.findOne({ where: { requesterId, addresseeId } });
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
  const { id } = req.params; // Friends table record id
  try {
    const friendRequest = await Friends.findByPk(id);
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
  const { id } = req.params; // Friends table record id
  try {
    const deleted = await Friends.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Friend not found.' });
    }
    res.status(200).json({ message: 'Friend deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFriendsOfUser,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
};