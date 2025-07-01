const { Friends, Users, Activities } = require('../schemas');

const { Op } = require('sequelize');



async function createFriendRequest(senderId, receiverId) {
  // Kiểm tra tồn tại theo cả hai chiều
  const existing = await Friends.findOne({
    where: {
      [Op.or]: [
        { requesterId: senderId, addresseeId: receiverId },
        { requesterId: receiverId, addresseeId: senderId }
      ]
    }
  });

  if (existing) {
    if (existing.status === 'pending' || existing.status === 'accepted') {
      // Nếu đang chờ hoặc đã là bạn thì không gửi lại
      return { exists: true, record: existing };
    } else if (existing.status === 'rejected') {
      // Cho phép gửi lại bằng cách cập nhật bản ghi
      existing.requesterId = senderId;
      existing.addresseeId = receiverId;
      existing.status = 'pending';
      await existing.save();
      return { exists: false, record: existing, resent: true };
    }
  }

  // Nếu chưa có gì thì tạo mới
  const newRequest = await Friends.create({
    requesterId: senderId,
    addresseeId: receiverId,
    status: 'pending',
  });

  // Ghi nhận activity: sender gửi lời mời kết bạn cho receiver
  const receiver = await Users.findByPk(receiverId);
  const receiverName = receiver ? receiver.username : 'Unknown User';
  await Activities.create({
    userId: senderId,
    groupId: null,
    title: 'Send Friend Request',
    activityType: 'relationship',
    description: `Sent a friend request to ${receiverName}.`,
  });

  return { exists: false, record: newRequest, resent: false };
}

module.exports = {
  createFriendRequest
};
