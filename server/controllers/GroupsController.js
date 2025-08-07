const { Groups, Users, Expenses, expenseItems } = require('../schemas');
const sequelize = require('../config/db');
const { deleteGroup: deleteGroupService } = require('../services/groupService');

// Only Admin can access this controller
const getAllGroups = async (req, res) => {
    try {
        const groups = await Groups.findAll({
            include: [{
                model: Users,
                as: 'owner',
                attributes: ['id', 'username', 'email', 'avatarURL']
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
            include: [{
                model: Users,
                as: 'owner',
                attributes: ['id', 'username', 'email', 'avatarURL']
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


const updateGroupName = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name } = req.body; // Lấy tên mới từ request body
    const groupId = req.params.id;

    if (!name || !groupId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Group ID and name are required' });
    }

    const group = await Groups.findByPk(groupId, { transaction });
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Group not found' });
    }

    const [updated] = await Groups.update(
      { name },
      {
        where: { id: groupId },
        transaction,
      }
    );

    if (!updated) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Failed to update group name' });
    }

    await transaction.commit();
    res.status(200).json({ message: 'Group name updated successfully', name });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message || 'Failed to update group name' });
  }
};

const getGroupMembers = async (req, res) => {
    try {
        const group = await Groups.findByPk(req.params.id, {
            include: [{
                model: Users,
                as: 'members',
                attributes: ['id', 'username', 'email', 'avatarURL'],
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

// Delete group - Admin only
const deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }
        
        // Check if group exists
        const group = await Groups.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Use groupService to delete group
        await deleteGroupService(groupId);
        
        res.status(200).json({ 
            message: 'Group deleted successfully',
            groupId: parseInt(groupId)
        });
        
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ message: error.message || 'Failed to delete group' });
    }
}

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroupName,
    getGroupMembers,
    deleteGroup,
};

