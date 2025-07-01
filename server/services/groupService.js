
const { Groups, Users } = require('../schemas');

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
  
  return group;
};

module.exports = {
  createGroup,
};
