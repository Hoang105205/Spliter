const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../schemas/Users');

// Đăng ký chiến lược Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
  },
 
  //Nếu bạn muốn lưu thông tin googleId vào user (sap lam duoc)

  async (accessToken, refreshToken, profile, done) => {
    try {
      // Tìm user theo googleId hoặc email
      
      let user = await Users.findOne({ where: { email: profile.emails[0].value } });

      if ( !user) {
        // Nếuchưa có, tạo mới (default password là "abc123")
        try {
          user = await Users.create({
            username: profile.displayName,
            email:  profile.emails[0].value,
            password: "abc123",
            role: "user"
          });
        } catch (err) {
          console.error('Lỗi khi tạo user:', err); // Log đầy đủ error object
          return done(err, null);
        }
        
        console.log('da Creating user với:'), {
          username: profile.displayName,
          email: profile.emails[0].value,
          password: null,
          role: 'user',
        }
      }

      else{
        console.log('user da co trong db:', {
          username: user.username,
          email: user.email,
          role: user.role,
          password: user.password,
        });
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
