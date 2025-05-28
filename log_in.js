require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình session (bắt buộc khi dùng passport)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Khởi tạo passport
app.use(passport.initialize());
app.use(passport.session());

// Đăng ký chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Ở đây bạn xử lý user, lưu vào DB hoặc tạo session
    // Với ví dụ đơn giản, chỉ truyền profile
    return done(null, profile);
  }
));

// serialize user vào session
passport.serializeUser((user, done) => {
  done(null, user);
});

// deserialize user từ session
passport.deserializeUser((user, done) => {
  done(null, user);
});


// Gửi file HTML khi truy cập đường dẫn "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/log_in.html'));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res) => res.redirect('/')
);

app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/sign_up.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


