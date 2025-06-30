const Users = require('./Users');
const Friends = require('./Friends');
const Notifications = require('./Notifications');
const Activities = require('./Activities');

// Associations
Users.hasMany(Friends, { foreignKey: 'requesterId', as: 'sentRequests' });
Users.hasMany(Friends, { foreignKey: 'addresseeId', as: 'receivedRequests' });
Friends.belongsTo(Users, { foreignKey: 'requesterId', as: 'requester' });
Friends.belongsTo(Users, { foreignKey: 'addresseeId', as: 'addressee' });

Users.hasMany(Notifications, { foreignKey: 'userId', as: 'notifications' });
Users.hasMany(Activities, { foreignKey: 'userId', as: 'activities' });
Notifications.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
Activities.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

module.exports = {
  Users,
  Friends,
  Notifications,
  Activities
};