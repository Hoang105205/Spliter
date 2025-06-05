require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const sequelize = require('./config/db');
const UsersRoute = require('./routes/UsersRoute');

const app = express();
const PORT = process.env.PORT || 3000;


// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

// // Load passport strategy (Google OAuth)
// require('./config/passport');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// const authRouter = require('./routes/auth');
// app.use('/auth', authRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


// // Tạm thời route cho dashboard
// app.get('/dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, '../views/user/dashboard.html'));
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


// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
