const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Friends = sequelize.define('Friend', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  requesterId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'users',
        key: 'id'
        }
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'users',
        key: 'id'
        }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
},
{
  tableName: 'friends',
  timestamps: false,
}
);

module.exports = Friends;