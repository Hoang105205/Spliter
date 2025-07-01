const { Groups, Users, groupMembers } = require('../schemas');


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

module.exports = {
  createGroup,
};
