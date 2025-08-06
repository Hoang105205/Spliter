const Users = require('../schemas/Users');
const { sendEmail } = require('./mailService');


const updateUserStatus = async (userId, status) => {
    // Validate status
    if (!['Banned', 'Unbanned'].includes(status)) {
        throw new Error('Invalid status. Must be "Banned" or "Unbanned"');
    }
    
    // Find user
    const user = await Users.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    // Update status
    user.status = status;
    await user.save();
    
    // Send email notification (don't fail if email fails)
    try {
        await sendStatusChangeEmail(user, status);
        console.log(`Email notification sent to ${user.email} for status change to ${status}`);
    } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
    }
    
    return user;
};

const sendStatusChangeEmail = async (user, status) => {
    const emailSubject = status === 'Banned' 
        ? 'Account Suspended'
        : 'Account Reactivated';
        
    const emailHTML = status === 'Banned' 
        ? generateBannedEmailTemplate(user)
        : generateUnbannedEmailTemplate(user);
        
    await sendEmail(user.email, emailSubject, emailHTML);
};


const generateBannedEmailTemplate = (user) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Account Suspended</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 8px; 
                overflow: hidden; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
                background-color: #dc3545; 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
            }
            .content { 
                padding: 30px; 
            }
            .warning { 
                background-color: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
            .footer { 
                text-align: center; 
                padding: 20px; 
                background-color: #f8f9fa; 
                color: #666; 
                font-size: 14px; 
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #dc3545;
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Account Suspended</h1>
            </div>
            <div class="content">
                <h2>Dear ${user.username},</h2>
                <p>We regret to inform you that your Spliter account has been suspended due to policy violations or administrative reasons.</p>
                
                <div class="warning">
                    <strong>Account Status:</strong> <span class="status-badge">Suspended</span><br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}<br>
                    <strong>User ID:</strong> #${user.id}
                </div>
                
                <p><strong>What this means:</strong></p>
                <ul>
                    <li>You will not be able to access your Spliter account</li>
                    <li>All ongoing activities have been suspended</li>
                    <li>Your data remains secure and will not be deleted</li>
                </ul>
                
                <p>If you believe this action was taken in error or would like to appeal this decision, please contact our support team at <strong>support@spliter.com</strong> with your User ID.</p>
                
                <p>Thank you for your understanding.</p>
                <p>Best regards,<br><strong>The Spliter Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Spliter. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateUnbannedEmailTemplate = (user) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Account Reactivated</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 8px; 
                overflow: hidden; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
                background-color: #28a745; 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
            }
            .content { 
                padding: 30px; 
            }
            .success { 
                background-color: #d4edda; 
                border: 1px solid #c3e6cb; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
            .footer { 
                text-align: center; 
                padding: 20px; 
                background-color: #f8f9fa; 
                color: #666; 
                font-size: 14px; 
            }
            .cta-button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #28a745;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #28a745;
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Account Reactivated</h1>
            </div>
            <div class="content">
                <h2>Welcome back, ${user.username}!</h2>
                <p>Great news! Your Spliter account has been successfully reactivated and you now have full access to all features.</p>
                
                <div class="success">
                    <strong>Account Status:</strong> <span class="status-badge">Active</span><br>
                    <strong>Reactivated on:</strong> ${new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}<br>
                    <strong>User ID:</strong> #${user.id}
                </div>
                
                <p><strong>What you can do now:</strong></p>
                <ul>
                    <li>Log in to your account immediately</li>
                    <li>Access all your previous data and settings</li>
                    <li>Create and manage expense groups</li>
                    <li>Invite friends and split expenses</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="cta-button">
                        Log In Now
                    </a>
                </div>
                
                <p>We appreciate your patience during the suspension period. If you have any questions or need assistance, feel free to contact our support team.</p>
                
                <p>Happy splitting!</p>
                <p>Best regards,<br><strong>The Spliter Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Spliter. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    updateUserStatus,
    sendStatusChangeEmail,
    generateBannedEmailTemplate,
    generateUnbannedEmailTemplate
};
