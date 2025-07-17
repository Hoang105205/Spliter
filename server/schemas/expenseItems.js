const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const expenseItems = sequelize.define('ExpenseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    expenseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'expenses', // refers to table name
            key: 'id', // refers to column name in Expenses table
        },
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups', // refers to table name
            key: 'id', // refers to column name in Groups table
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id', // refers to column name in Users table
        },
    },
    shared_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    is_paid: {
        type: DataTypes.ENUM('no', 'yes', 'pending'),
        allowNull: false,
        defaultValue: 'no',
    },
}, {
    timestamps: true,
    tableName: 'expense_items', // specify the table name
});

module.exports = expenseItems;