const express = require('express');
const router = express.Router();
const {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/UsersController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

// Get all users
router.get('/', getUsers);

// Get a single user
router.get('/:username', getSingleUser);

// Create a new user
router.post('/', createUser);

// Update a user
router.put('/:username', ensureAuthenticated, updateUser);

// Delete a user
router.delete('/:username', ensureAuthenticated, deleteUser);

// (Tạo thêm route lấy user hiện tại nếu cần)
router.get('/me', ensureAuthenticated, (req, res) => {
  res.status(200).json(req.user);
});


module.exports = router;



