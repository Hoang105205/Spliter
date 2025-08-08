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
            '🎉 Welcome to Spliter - Your Account is Ready!',
            `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Spliter</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 36px; margin: 0; font-weight: 300; letter-spacing: -1px;">
                      Spliter
                    </h1>
                    <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">
                      Smart Expense Splitting Made Easy
                    </p>
                  </div>

                  <!-- Main Content -->
                  <div style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; background-color: #34a853; border-radius: 50%; padding: 15px; margin-bottom: 20px;">
                        <span style="color: #ffffff; font-size: 24px; font-weight: bold;">✓</span>
                      </div>
                      <h2 style="color: #202124; font-size: 28px; margin: 0; font-weight: 400;">
                        Welcome, ${getUsernameFromEmail(email)}!
                      </h2>
                      <p style="color: #5f6368; font-size: 16px; margin: 10px 0 0 0;">
                        Your account has been successfully created using your Google account
                      </p>
                    </div>

                    <!-- Account Info Card -->
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4285f4;">
                      <h3 style="color: #202124; font-size: 18px; margin: 0 0 15px 0; font-weight: 500;">
                        📋 Your Account Details
                      </h3>
                      <div style="margin-bottom: 12px;">
                        <span style="color: #5f6368; font-size: 14px; font-weight: 500;">Email:</span>
                        <span style="color: #202124; font-size: 14px; margin-left: 8px;">${email}</span>
                      </div>
                      <div style="margin-bottom: 12px;">
                        <span style="color: #5f6368; font-size: 14px; font-weight: 500;">Username:</span>
                        <span style="color: #202124; font-size: 14px; margin-left: 8px; background-color: #e8f0fe; padding: 2px 8px; border-radius: 4px;">${getUsernameFromEmail(email)}</span>
                      </div>
                      <div style="margin-bottom: 0;">
                        <span style="color: #5f6368; font-size: 14px; font-weight: 500;">Default Password:</span>
                        <span style="color: #202124; font-size: 14px; margin-left: 8px; background-color: #fef7e0; padding: 2px 8px; border-radius: 4px; font-family: monospace;">abc123</span>
                      </div>
                    </div>

                    <!-- Next Steps -->
                    <div style="margin: 30px 0;">
                      <h3 style="color: #202124; font-size: 18px; margin: 0 0 15px 0; font-weight: 500;">
                        🚀 What's Next?
                      </h3>
                      <ul style="color: #5f6368; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Login to your account and complete your profile</li>
                        <li style="margin-bottom: 8px;">Add your bank account information for payments</li>
                        <li style="margin-bottom: 8px;">Start creating groups and splitting expenses with friends</li>
                        <li style="margin-bottom: 8px;">Explore our features: activities, reports, and notifications</li>
                      </ul>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                         style="display: inline-block; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 500; transition: transform 0.2s;">
                        Get Started Now →
                      </a>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8eaed;">
                    <p style="color: #5f6368; font-size: 12px; margin: 0; line-height: 1.4;">
                      © 2025 Spliter. All rights reserved.<br>
                      This email was sent to ${email} because you signed up for a Spliter account.
                    </p>
                    <p style="color: #9aa0a6; font-size: 11px; margin: 15px 0 0 0;">
                      If you didn't create this account, please ignore this email or contact our support team.
                    </p>
                  </div>
                </div>
              </body>
              </html>
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

