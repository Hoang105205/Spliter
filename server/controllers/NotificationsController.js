const { Notifications, Users } = require('../schemas');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notifications.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [{ model: Users, as: 'user', attributes: ['id', 'username'] }]
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const markAsRead = async (req, res) => {
    try {
        const notification = await Notifications.findOne({
            where: { id: req.params.id, userId: req.user.id }
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