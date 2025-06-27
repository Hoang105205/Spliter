const express = require('express');
const router = express.Router();
const {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    loginUser
} = require('../controllers/UsersController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

// Get all users
router.get('/', getUsers);

// Get a single user
router.get('/:username', getSingleUser);

// Create a new user
router.post('/', createUser);

// Update a user
router.put('/:id', ensureAuthenticated, updateUser);

// Delete a user
router.delete('/:id', ensureAuthenticated, deleteUser);

// Change password
router.put('/:id/change-password', ensureAuthenticated, changePassword);

// Login user
router.post('/login', loginUser);


// (Tạo thêm route lấy user hiện tại nếu cần)
router.get('/me', ensureAuthenticated, (req, res) => {
  res.status(200).json(req.user);
});


module.exports = router;



