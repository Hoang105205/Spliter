const { groupMembers, Groups } = require('../schemas');

const getAllGroupsOfUser = async (req, res) => {
    try {
        const groups = await groupMembers.findAll({
            where: { 
                userId: req.params.userId,
                status: 'accepted' // Assuming you want only accepted group memberships
            },
            attributes: ['groupId'],
            include: [{
                model: Groups,
                as: 'group',
                attributes: ['id', 'name', 'ownerId'],
            }]
        });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sendGroupReuqest = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Group ID and User ID are required' });
        }
        // Check if the user is already a member of the group
        const existingMember = await groupMembers.findOne({ where: { groupId, userId} });
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }
        // Create a new group member with status 'pending'
        const newMember = await groupMembers.create({ groupId, userId, status: 'pending' });
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const acceptGroupRequest = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Group ID and User ID are required' });
        }
        const member = await groupMembers.findOne({ where: { groupId, userId } });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        member.status = 'accepted';
        await member.save();
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const rejectGroupRequest = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Group ID and User ID are required' });
        }
        const member = await groupMembers.findOne({ where: { groupId, userId } });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        await member.destroy();
        res.status(200).json({ message: 'Member rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Group ID and User ID are required' });
        }
        const member = await groupMembers.findOne({ where: { groupId, userId } });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        await member.destroy();
        res.status(200).json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPendingGroupInvites = async (req, res) => {
    try {
        const pendingInvites = await groupMembers.findAll({
            where: { 
                userId: req.params.userId,
                status: 'pending' // Assuming you want only pending group memberships
            },
            attributes: ['groupId'],
            include: [{
                model: Groups,
                as: 'group',
                attributes: ['id', 'name', 'ownerId'],
            }]
        });
        res.status(200).json(pendingInvites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getSentGroupRequests = async (req, res) => {
    try {
        const sentInvites = await groupMembers.findAll({
            where: { status: 'pending' },
            include: [{
                model: Groups,
                as: 'group',
                where: { ownerId: req.params.userId },
                attributes: ['id', 'name', 'ownerId'],
            }],
            attributes: ['userId', 'groupId']
        });
        res.status(200).json(sentInvites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const leaveGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Group ID and User ID are required' });
        }

        const member = await groupMembers.findOne({ where: { groupId, userId } });
        if (!member) {
            return res.status(404).json({ message: 'Member not found in this group' });
        }

        await member.destroy();
        res.status(200).json({ message: 'Successfully left the group' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to leave group' });
    }
};


module.exports = {
    getAllGroupsOfUser,
    sendGroupReuqest,
    acceptGroupRequest,
    rejectGroupRequest,
    removeMember,
    getPendingGroupInvites,
    getSentGroupRequests,
    leaveGroup
};