const { Groups, Users } = require('../schemas');


// Only Admin can access this controller
const getAllGroups = async (req, res) => {
    try {
        const groups = await Groups.findAll({
            attributes: ['id', 'name', 'ownerId'],
            include: [{
                model: Users,
                as: 'owner',
                attributes: ['id', 'username', 'email']
            }]
        });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Only Admin can access this controller
const getGroupById = async (req, res) => {
    try {
        const group = await Groups.findByPk(req.params.id, {
            attributes: ['id', 'name', 'ownerId'],
            include: [{
                model: Users,
                as: 'owner',
                attributes: ['id', 'username', 'email']
            }]
        });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Khong can thiet, vi Server tao bang service, client khong duoc phep tao group
const createGroup = async (req, res) => {
    try {
        const { name, ownerId } = req.body;
        if (!name || !ownerId) {
            return res.status(400).json({ message: 'Name and ID of the owner are required' });
        }
        const group = await Groups.create({ name, ownerId });
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const updateGroup = async (req, res) => {
    try {
        const group = await Groups.update(req.body, {
            where: { id: req.params.id },
            returning: true
        });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteGroup = async (req, res) => {
    try {
        const deleted = await Groups.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGroupMembers = async (req, res) => {
    try {
        const group = await Groups.findByPk(req.params.id, {
            include: [{
                model: Users,
                as: 'members',
                attributes: ['id', 'username', 'email'],
                through: {
                    where : { status: 'accepted' },
                    attributes: [] 
                }
            }]
        });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group.members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
};

