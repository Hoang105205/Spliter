const { Model } = require('sequelize');
const Reports = require('../schemas/Reports');

const createReport = async (req, res) => {
    try {
        const { reporterId, reportedUserId, reason } = req.body;

        // Validate required fields
        if (!reporterId || !reportedUserId || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create the report
        const report = await Reports.create({
            reporterId,
            reportedUserId,
            reason
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createReport
}

