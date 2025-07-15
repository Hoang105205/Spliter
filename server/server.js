// Environment variables 
require('dotenv').config();

// Import necessary modules
const cors = require('cors'); 
const path = require('path');
const http = require('http');

// Express modules
const express = require('express');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());



///////// Import routes
const UsersRoute = require('./routes/UsersRoute');
const FriendsRoute = require('./routes/FriendsRoute');
const NotificationsRoute = require('./routes/NotificationsRoute');
const groupMembersRoute = require('./routes/groupMembersRoute');
const GroupsRoute = require('./routes/GroupsRoute');
const authRouter = require('./routes/auth');
const ActivitiesRoute = require('./routes/ActivitiesRoute');
const ExpensesRoute = require('./routes/ExpensesRoute');
const ReportsRoute = require('./routes/ReportsRoute');
/////////


/////////// Configurations

// Configure session
require('./config/session')(app);

// Passport config
passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

//////////


////////// Sync database models
const sequelize = require('./config/db');

sequelize.sync()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

//////////

////////// Import and create WebSocket server
const server = require('http').createServer(app);
const createWebSocketServer = require('./websocket/websocket-server');
createWebSocketServer(server);


//////////












////////////////////////////////////////////////////////////// Serve static files from the React app
// Routes
app.use('/auth', authRouter);
app.use('/api/users', UsersRoute);
app.use('/api/friends', FriendsRoute);
app.use('/api/notifications', NotificationsRoute);
app.use('/api/group-members', groupMembersRoute);
app.use('/api/groups', GroupsRoute);
app.use('/api/activities', ActivitiesRoute);
app.use('/api/expenses', ExpensesRoute);
app.use('/api/reports', ReportsRoute);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
