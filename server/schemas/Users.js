const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

const Users = sequelize.define(
  'Users',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        notEmpty: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    avatarURL: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('Unbanned', 'Banned'),
      allowNull: false,
      defaultValue: 'Unbanned',
      validate: {
        isIn: [['Unbanned', 'Banned']],
      }
    }
  }, 
  {
    timestamps: true,
    tableName: 'users',  // specify the table name
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

Users.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

module.exports = Users;