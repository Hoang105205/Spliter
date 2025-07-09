const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expenses = sequelize.define(
    'Expense',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        paidbyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // refers to table name
                key: 'id', // refers to column name in Users table
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: 'expenses', // specify the table name
    }
);

module.exports = Expenses;