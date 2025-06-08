const Users = require('../schemas/Users');


const getUsers = async (req, res) => {
    try {
        const user = await Users.findAll();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getSingleUser = async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.params.username } });
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
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const [updated] = await Users.update(req.body, {
            where: { username: req.params.username },
            returning: true,
        });
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await Users.findOne({ where: { username: req.params.username } });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await Users.destroy({
            where: { username: req.params.username }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser
}