const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Groups = sequelize.define('Group', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
}, 
{
    tableName: 'groups',
    timestamps: true,
});

module.exports = Groups;