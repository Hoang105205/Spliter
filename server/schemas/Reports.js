const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reports = sequelize.define('Report', 
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id', // refers to column name in Users table
        },
    },
    reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id', // refers to column name in Users table
        },
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
    tableName: 'reports',
    timestamps: true, // adds createdAt and updatedAt fields
});

module.exports = Reports;