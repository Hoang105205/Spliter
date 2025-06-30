const express = require('express');
const router = express.Router();
const {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    loginUser,
    getAvatar,
    updateAvatar
} = require('../controllers/UsersController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const upload = require('../middlewares/uploadMemory');

// API: /api/users/

// Get all users
router.get('/', getUsers);

// Get a single user
router.get('/:username', getSingleUser);

// Get user avatar
router.get('/:id/avatar', getAvatar);

// Create a new user
router.post('/', createUser);

// Update a user
router.put('/:id', updateUser);

// Update user avatar
router.put('/:id/avatar', upload, updateAvatar);

// Delete a user
router.delete('/:id', deleteUser);

// Change password
router.put('/:id/change-password', changePassword);

// Login user
router.post('/login', loginUser);


// (Tạo thêm route lấy user hiện tại nếu cần)
router.get('/me', ensureAuthenticated, (req, res) => {
  res.status(200).json(req.user);
});


module.exports = router;



