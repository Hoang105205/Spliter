const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Đăng ký chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
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
