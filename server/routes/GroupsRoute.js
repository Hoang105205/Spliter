const express = require('express');
const router = express.Router();
const {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
} = require('../controllers/GroupsController');


// Get all groups
router.get('/', getAllGroups);

// Get a group by ID
router.get('/:id', getGroupById);

// Create a new group
router.post('/', createGroup);

// Update a group
router.put('/:id', updateGroup);

// Delete a group
router.delete('/:id', deleteGroup);

// Get members of a group
router.get('/:id/members', getGroupMembers);

module.exports = router;