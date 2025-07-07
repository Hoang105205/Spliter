const { Activities } = require('../schemas');
const { Op } = require('sequelize');

const logActivity = async ({userId, groupId, title, activityType, description}) => {
  try {
    await Activities.create({
      userId,
      groupId,
      title,
      activityType,
      description
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity
};
