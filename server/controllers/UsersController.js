const Users = require('../schemas/Users');
const uploadToCloudinary = require('../lib/cloudinaryUpload');

const getUsers = async (req, res) => {
    try {
        const user = await Users.findAll({ 
            attributes: { exclude: ['password'] }, 
            where: { role: 'user' } // Assuming you want to get only users, not admins
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getSingleUser = async (req, res) => {
    try {
        const user = await Users.findOne({ 
            where: { username: req.params.username },
            attributes: { exclude: ['password'] } 
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUser = async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await Users.findOne({ where: { username: req.body.username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const user = await Users.create(req.body);
        // Exclude password from the response
        const { password, ...userWithoutPassword } = user.toJSON();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const [updated] = await Users.update(req.body, {
            where: { id: req.params.id },
            returning: true,
        });
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await Users.findOne({ where: { id: req.params.id } });
        const { password, ...userWithoutPassword } = updatedUser.toJSON();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await Users.destroy({
            where: { id: req.params.id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const changePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.validatePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        // Exclude password from the response
        const { password: userPassword, ...userWithoutPassword } = user.toJSON();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAvatar = async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id, {
            attributes: ['avatarURL']
        });
        if (!user || !user.avatarURL) {
            return res.status(404).json({ message: 'Avatar not found' });
        }
        res.status(200).json({ avatarURL: user.avatarURL });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateAvatar = async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Upload file lên Cloudinary
        let avatarURL;
        try {
            avatarURL = await uploadToCloudinary(req.file.buffer, user.id);
        } catch (err) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
        }
        user.avatarURL = avatarURL;
        await user.save();
        res.status(200).json({ message: 'Avatar updated successfully', avatarURL: user.avatarURL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    loginUser,
    getAvatar,
    updateAvatar
}