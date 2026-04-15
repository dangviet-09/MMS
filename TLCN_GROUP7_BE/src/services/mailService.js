const nodemailer = require("nodemailer");

class MailService {
  static transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  static async sendMail({ to, subject, text, html }) {
    return this.transporter.sendMail({
      from: `"My App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
  }

  static async sendWelcomeEmail(user) {
    const subject = " Welcome to My App! Thank you for signing up";
    const text = `Hello ${user.fullName || user.username}, thank you for signing up for our service.`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: auto; background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 300;">Welcome to My App! 🎉</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Your journey to success starts here</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hello ${user.fullName || user.username}! 👋</h2>
            
            <p style="font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 20px;">
              We're absolutely thrilled to welcome you to the <strong>My App</strong> community! 
              Thank you for choosing us as your learning and career development partner.
            </p>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li style="margin-bottom: 8px;">Complete your profile to get personalized recommendations</li>
                <li style="margin-bottom: 8px;">Explore our extensive course catalog</li>
                <li style="margin-bottom: 8px;">Connect with other learners in your field</li>
                <li style="margin-bottom: 8px;">Take career assessments to discover your strengths</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 25px;">
              Our platform is designed to help you achieve your career goals through personalized learning paths, 
              industry-relevant courses, and connections with top companies. Whether you're just starting out 
              or looking to advance your career, we've got the tools and resources you need.
            </p>

            <div style="background: #e8f5e8; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #2e7d32; margin: 0 0 10px 0;">Featured Resources</h4>
              <p style="margin: 0; color: #555; font-size: 14px;">Check out our beginner-friendly courses, career guides, and success stories from our community members.</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #777; margin-bottom: 15px;">
              Need help getting started? Our support team is here for you! 
              Contact us at <a href="mailto:support@myapp.com" style="color: #4CAF50; text-decoration: none;">support@myapp.com</a>
            </p>
            
            <div style="margin: 20px 0;">
              <a href="#" style="color: #4CAF50; text-decoration: none; margin: 0 15px; font-size: 14px;">Help Center</a>
              <a href="#" style="color: #4CAF50; text-decoration: none; margin: 0 15px; font-size: 14px;">Community Forum</a>
              <a href="#" style="color: #4CAF50; text-decoration: none; margin: 0 15px; font-size: 14px;">Course Catalog</a>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #aaa; margin: 0;">
              This is an automated email. Please do not reply directly to this email.<br>
              If you have questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: user.email, subject, text, html });
  }

  static async sendOTPEmail(user, otpCode) {
    const subject = "OTP Verification Code for Password Reset";
    const text = `Hello ${user.fullName || user.username},\nYour OTP code is: ${otpCode}\nValid for 10 minutes.`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: auto; background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ff6b35, #e55527); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300;">🔐 Password Reset Request</h1>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">Secure verification code inside</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Hello ${user.fullName || user.username}! 👋</h2>
            
            <p style="font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 25px;">
              We received a request to reset your password for your <strong>My App</strong> account. 
              For your security, we've generated a verification code that you'll need to complete the password reset process.
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Security Notice</h3>
              <p style="margin: 0; color: #856404; font-size: 14px;">
                If you didn't request this password reset, someone may be trying to access your account. 
                Please contact our support team immediately if this wasn't you.
              </p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <div style="background: linear-gradient(135deg, #ff6b35, #e55527); color: white; display: inline-block; padding: 25px 40px; border-radius: 15px; box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);">
                <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your verification code is:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0;">
                  ${otpCode}
                </div>
                <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Valid for 10 minutes only</p>
              </div>
            </div>

            <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff6b35;">
              <h3 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 18px;">How to use this code:</h3>
              <ol style="margin: 0; padding-left: 20px; color: #666;">
                <li style="margin-bottom: 10px;">Return to the password reset page</li>
                <li style="margin-bottom: 10px;">Enter the 6-digit code above</li>
                <li style="margin-bottom: 10px;">Create a strong new password</li>
                <li style="margin-bottom: 10px;">Confirm your new password</li>
              </ol>
            </div>

            <p style="font-size: 14px; color: #777; line-height: 1.6; margin-bottom: 20px;">
              <strong>Security Tips:</strong><br>
              • Never share this code with anyone<br>
              • We will never ask for this code via phone or email<br>
              • The code expires in exactly 10 minutes for your security<br>
              • Use a strong password with at least 8 characters, including numbers and symbols
            </p>

            <div style="background: #d1ecf1; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #0c5460; margin: 0 0 10px 0;">Account Security</h4>
              <p style="margin: 0; color: #0c5460; font-size: 14px;">
                We take your account security seriously. All password reset requests are logged and monitored for suspicious activity.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #777; margin-bottom: 15px;">
              Having trouble with password reset? Our security team is here to help! 
              Contact us at <a href="mailto:security@myapp.com" style="color: #ff6b35; text-decoration: none;">security@myapp.com</a>
            </p>
            
            <div style="margin: 20px 0;">
              <a href="#" style="color: #ff6b35; text-decoration: none; margin: 0 15px; font-size: 14px;">Security Center</a>
              <a href="#" style="color: #ff6b35; text-decoration: none; margin: 0 15px; font-size: 14px;">Account Settings</a>
              <a href="#" style="color: #ff6b35; text-decoration: none; margin: 0 15px; font-size: 14px;">Help & Support</a>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #aaa; margin: 0;">
              This is an automated security email. Please do not reply directly to this email.<br>
              For security concerns, please contact our dedicated security team.
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: user.email, subject, text, html });
  }
}

module.exports = MailService;
