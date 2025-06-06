// Environment variables 
require('dotenv').config();

// Import necessary modules
 
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

// Configure session
require('./config/session')(app);

// Passport config
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

const ensureAuthenticated = require('./middlewares/ensureAuthenticated');

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

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/users', UsersRoute);

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
