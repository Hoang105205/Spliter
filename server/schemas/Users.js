const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Users = sequelize.define(
  'Users',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
  }, 
  {
    timestamps: true,
    tableName: 'users',  // specify the table name
  }
);

module.exports = Users;