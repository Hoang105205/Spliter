const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../schemas/Users');

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
      
      let user = await Users.findOne({ where: { email: profile.emails[0].value } });

      if ( !user) {
        // Nếu chưa có, tạo mới (default password là "abc123", default username là phần trước @ trong email)
        try { 
          user = await Users.create({
            username: getUsernameFromEmail(profile.emails[0].value),
            email:  profile.emails[0].value,
            password: "abc123",
            role: "user"
          });
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

  

  // // Hàm callback khi người dùng đăng nhập thành công (chua thao tac voi database)
  // async (accessToken, refreshToken, profile, done) => {
  //   // Tạo một object user đơn giản từ profile Google
  //   const user = {
  //     googleId: profile.id,
  //     username: profile.displayName,
  //     email: profile.emails[0].value,
  //     avatar: profile.photos?.[0]?.value // nếu muốn lấy avatar
  //   };
  //   // Gán vào req.user thông qua done
  //   return done(null, user);
  //}
));


// serialize user vào session
passport.serializeUser((user, done) => {
  done(null, user);
});

// deserialize user từ session
passport.deserializeUser((user, done) => {
  done(null, user);
});

