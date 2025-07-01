const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notifications = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // refers to table name
      key: 'id', // refers to column name in Users table
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, 
{
  timestamps: true,
  tableName: 'notifications', // specify the table name
});

module.exports = Notifications;