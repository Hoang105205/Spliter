const { Notifications, Users } = require('../schemas');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notifications.findAll({
            where: { userId: req.params.id },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const markAsRead = async (req, res) => {
    try {
        const notification = await Notifications.findOne({
            where: { id: req.params.id } // bỏ biến check, chỉ cần id
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getNotifications,
    markAsRead
};