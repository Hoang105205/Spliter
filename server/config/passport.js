const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Đăng ký chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
  },
  (accessToken, refreshToken, profile, done) => {
    // Hàm này được gọi sau khi Google xác thực thành công
        // Ở đây bạn sẽ tìm hoặc tạo người dùng trong database của bạn
        // Ví dụ:
        // User.findOrCreate({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value }, (err, user) => {
        //   return done(err, user);
        // });
        // Tạm thời, chúng ta sẽ trả về profile trực tiếp (bạn cần xử lý user trong DB)
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails ? profile.emails[0].value : null,
            photo: profile.photos ? profile.photos[0].value : null
        };
        return done(null, user); // user này sẽ được lưu vào req.user
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
