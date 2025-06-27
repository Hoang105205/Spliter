const { Friends } = require('../schemas');

const { Op } = require('sequelize');


async function createFriendRequest(senderId, receiverId) {
  // Kiểm tra tồn tại theo cả chiều ngược lại
  const existing = await Friends.findOne({
    where: {
      [Op.or]: [
        { requesterId: senderId, addresseeId: receiverId },
        { requesterId: receiverId, addresseeId: senderId }
      ]
    }
  });

  if (existing) {
    // Có rồi, trả về bản ghi đó và đánh dấu là "đã tồn tại"
    return { exists: true, record: existing };
  }

  const newRequest = await Friends.create({
    requesterId: senderId,
    addresseeId: receiverId,
    status: 'pending',
  });

  return { exists: false, record: newRequest };
}

module.exports = {
  createFriendRequest
};
