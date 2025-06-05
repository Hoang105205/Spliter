const express = require('express');
const router = express.Router();
const {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/UsersController');

// Get all users
router.get('/', getUsers);

// Get a single user by ID
router.get('/:id', getSingleUser);

// Create a new user
router.post('/', createUser);

// Update a user
router.put('/:id', updateUser);

// Delete a user
router.delete('/:id', deleteUser);

module.exports = router;