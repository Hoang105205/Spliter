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
const authRouter = require('./routes/auth');
const ActivitiesRoute = require('./routes/ActivitiesRoute');
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
app.use('/api/activities', ActivitiesRoute);

// ngoai login va signup, cac route khac can phai xac thuc (vd: req.isAuthenticated()) thi moi direct, phai dat truoc app.get('*') de khong bi ghi de
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
