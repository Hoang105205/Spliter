// Environment variables 
require('dotenv').config();

// Import necessary modules
const cors = require('cors'); 

// Express modules
const express = require('express');

// Path module to handle file paths
const path = require('path');

// Session and Passport for authentication
const session = require('express-session');
const passport = require('passport');

// Database configuration and models
const sequelize = require('./config/db');
const UsersRoute = require('./routes/UsersRoute');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Passport for authentication
require('./config/passport');
const ensureAuthenticated = require('./middlewares/ensureAuthenticated');

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
}));
// Configure session
require('./config/session')(app);

// Passport config
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

//TODO: schemas/Users, routes/UsersRoute.js------------------------------------------------------

// API routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// app.get('/dashboard', (req, res) => {
//   res.send(`Hello ${req.user.email}`);
// });

sequelize.sync()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });


// Routes
app.use('/api/users', UsersRoute);

// ngoai login va signup, cac route khac can phai xac thuc (vd: req.isAuthenticated()) thi moi direct, phai dat truoc app.get('*') de khong bi ghi de
if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
