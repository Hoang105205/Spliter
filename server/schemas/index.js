const Users = require('./Users');
const Friends = require('./Friends');
const Notifications = require('./Notifications');
const Activities = require('./Activities');
const Groups = require('./Groups');
const groupMembers = require('./groupMembers');
const Expenses = require('./Expenses');
const expenseItems = require('./expenseItems');

// Associations
Users.hasMany(Friends, { foreignKey: 'requesterId', as: 'sentRequests' });
Users.hasMany(Friends, { foreignKey: 'addresseeId', as: 'receivedRequests' });
Friends.belongsTo(Users, { foreignKey: 'requesterId', as: 'requester' });
Friends.belongsTo(Users, { foreignKey: 'addresseeId', as: 'addressee' });

Users.hasMany(Notifications, { foreignKey: 'userId', as: 'notifications' });
Users.hasMany(Activities, { foreignKey: 'userId', as: 'activities' });
Notifications.belongsTo(Users, { foreignKey: 'userId', as: 'notificationUser' });
Activities.belongsTo(Users, { foreignKey: 'userId', as: 'activityUser' });

Users.hasMany(Groups, { foreignKey: 'ownerId', as: 'ownedGroups' });
Groups.belongsTo(Users, { foreignKey: 'ownerId', as: 'owner' });
Users.belongsToMany(Groups, { through: groupMembers, foreignKey: 'userId', otherKey: 'groupId', as: 'groups' });
Groups.belongsToMany(Users, { through: groupMembers, foreignKey: 'groupId', otherKey: 'userId', as: 'members' });

groupMembers.belongsTo(Groups, { foreignKey: 'groupId', as: 'group', constraints: false });
groupMembers.belongsTo(Users, { foreignKey: 'userId', as: 'user', constraints: false });

Groups.hasMany(Expenses, { foreignKey: 'groupId', as: 'expenses' });
Expenses.belongsTo(Groups, { foreignKey: 'groupId', as: 'group' });

Expenses.hasMany(expenseItems, { foreignKey: 'expenseId', as: 'items' });
expenseItems.belongsTo(Expenses, { foreignKey: 'expenseId', as: 'expense', constraints: false });


expenseItems.belongsTo(Groups, { foreignKey: 'groupId', as: 'group', constraints: false });
expenseItems.belongsTo(Users, { foreignKey: 'userId', as: 'user', constraints: false });


module.exports = {
  Users,
  Friends,
  Notifications,
  Activities,
  Groups,
  groupMembers,
  Expenses,
  expenseItems
};