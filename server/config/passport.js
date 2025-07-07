const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../schemas/Users');

// Mail Service
const { sendEmail } = require('../services/mailService');

function getUsernameFromEmail(email) {
  if (!email) return '';
  return email.split('@')[0];
}

// Đăng ký chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
  },
 
  //Nếu bạn muốn lưu thông tin googleId vào user (lam duoc roi)

  async (accessToken, refreshToken, profile, done) => {
    try {
      // Tìm user theo googleId hoặc email
      const email = profile.emails[0].value;
      let user = await Users.findOne({ where: { email } });

      if ( !user) {
        // Nếu chưa có, tạo mới (default password là "abc123", default username là phần trước @ trong email)
        try { 
          user = await Users.create({
            username: getUsernameFromEmail(profile.emails[0].value),
            email:  profile.emails[0].value,
            password: "abc123",
            role: "user"
          });

          // ✅ Send welcome email
          await sendEmail(
            email,
            'Welcome to Spliter!',
            `
              <p>Hi ${getUsernameFromEmail(email)},</p>
              <p>You have just signed up using your Google account.</p>
              <p><strong>Your default username is: ${getUsernameFromEmail(email)}</strong></p>
              <p><strong>Your default password is: abc123</strong></p>
              <br><p>Best regards,<br>The Spliter Support Team</p>
            `
          );

        } catch (err) {
          console.error('Lỗi khi tạo user:', err); // Log đầy đủ error object
          return done(err, null);
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }

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

module.exports = passport;

