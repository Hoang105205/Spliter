const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SERVICE,       // Ví dụ: youremail@gmail.com
    pass: process.env.MAIL_SERVICE_PASSWORD // App Password 16 ký tự
  }
});

// Hàm gửi email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Spliter" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
