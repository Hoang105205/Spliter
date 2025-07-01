const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Activities = sequelize.define(
  'Activity',
    {
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
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            // references: {
            //     model: 'groups', // refers to table name
            //     key: 'id', // refers to column name in Groups table
            // },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        activityType: {
            type: DataTypes.ENUM('relationship', 'expense', 'report'),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        }, 
    },
    {
        timestamps: true,
        tableName: "activities", // specify the table name
    }
);

module.exports = Activities;