const Activities = require('../schemas/Activities');
const { Op } = require('sequelize');

// Lấy tất cả activities
exports.getAllActivities = async (req, res) => {
  try {
    // Lấy userId từ params
    const { userId }= req.params;

    const activities = await Activities.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};