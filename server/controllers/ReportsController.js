const { Model } = require('sequelize');
const Reports = require('../schemas/Reports');
const Users = require('../schemas/Users');

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

const getAllReports = async (req, res) => {
    try {
        const reports = await Reports.findAll({
            include: [
                {
                    model: Users,
                    as: 'reporter',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Users,
                    as: 'reportedUser',
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const report = await Reports.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;
        await report.save();

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createReport,
    getAllReports,
    updateReportStatus
}

