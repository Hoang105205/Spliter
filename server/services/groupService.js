const { Groups, Users, groupMembers, Activities, Expenses, expenseItems } = require('../schemas');
const sequelize = require('../config/db');


const createGroup = async ({ name, ownerId }) => {
  if (!name || !ownerId) {
    throw new Error('Name and ownerId are required');
  }

  // Kiểm tra xem user có tồn tại không (optional but recommended)
  const owner = await Users.findByPk(ownerId);
  if (!owner) {
    throw new Error('Owner does not exist');
  }

  // Tạo nhóm
  const group = await Groups.create({ name, ownerId });

  // Thêm owner vào group_members với status là 'accepted'
  await groupMembers.create({
    groupId: group.id,
    userId: ownerId,
    status: 'accepted'
  });

  return group;
};

const createGroupMemberRequest = async ({senderId, groupId, memberId}) => {
 if (!groupId || !memberId) {
    throw new Error('groupId and memberId are required');
  }

  // Kiểm tra xem group và member có tồn tại không
  const group = await Groups.findByPk(groupId);
  const member = await Users.findByPk(memberId);


  if (!group) {
    throw new Error('Group does not exist');
  }
  if (!member) {
    throw new Error('Member does not exist');
  }

  // Kiểm tra tồn tại theo cặp groupId và memberId
  const existing = await groupMembers.findOne({
    where: {
      groupId: groupId,
      userId: memberId
    }
  });

  if (existing) {
    if (existing.status === 'pending' || existing.status === 'accepted') {
      // Nếu đang chờ hoặc đã là thành viên, không gửi lại
      return { exists: true, record: existing };
    } else if (existing.status === 'rejected') {
      // Nếu đã bị từ chối, cho phép gửi lại bằng cách cập nhật
      existing.status = 'pending';
      await existing.save();
      return { exists: false, record: existing, resent: true };
    }
  }

  // Nếu chưa có gì, tạo mới request
  const newRequest = await groupMembers.create({
    groupId: groupId,
    userId: memberId,
    status: 'pending',
  });

  return { exists: false, record: newRequest, resent: false };

};


const deleteGroup = async (groupId) => {
  if (!groupId) {
    throw new Error('groupId is required');
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Xóa tất cả ExpenseItem liên quan đến group
    await expenseItems.destroy({
      where: { groupId },
      transaction,
    });

    // 2. Xóa tất cả Expense liên quan đến group
    await Expenses.destroy({
      where: { groupId },
      transaction,
    });

    // 3. Xóa tất cả thành viên liên quan đến group
    await groupMembers.destroy({
      where: { groupId },
      transaction,
    });

    // 4. Xóa group
    const deleted = await Groups.destroy({
      where: { id: groupId },
      transaction,
    });

    if (!deleted) {
      throw new Error('Group not found');
    }

    await transaction.commit();

    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createGroup,
  createGroupMemberRequest,
  deleteGroup
};
