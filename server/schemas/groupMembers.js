const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const groupMembers = sequelize.define('GroupMember', {
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'id'
        },
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
}, 
{
    tableName: 'group_members',
    timestamps: false,
});

module.exports = groupMembers;