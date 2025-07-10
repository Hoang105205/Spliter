const { Notifications } = require('../schemas');

const logNotification = async ({ userId, description, isRead = false }) => {
  try {
    await Notifications.create({
      userId,
      description,
      isRead
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
};

module.exports = {
  logNotification
};