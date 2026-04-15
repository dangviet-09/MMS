const validator = require("deep-email-validator");

// In-memory store for rate limiting (production nên dùng Redis)
const emailAttempts = new Map();
const ipAttempts = new Map();

// Cleanup old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  for (const [key, data] of emailAttempts.entries()) {
    if (now - data.firstAttempt > fifteenMinutes) {
      emailAttempts.delete(key);
    }
  }
  
  for (const [key, data] of ipAttempts.entries()) {
    if (now - data.firstAttempt > fifteenMinutes) {
      ipAttempts.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Only block obvious disposable email domains
const blockedDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'yopmail.com',
  'throwaway.email',
  'temp-mail.org',
  'getairmail.com',
  'maildrop.cc',
  'sharklasers.com'
];

// Very obvious spam patterns only
const spamPatterns = [
  /(.)\1{6,}/, // Same character 7+ times (aaaaaaa)
  /\d{12,}/, // 12+ consecutive digits
  /(spam|fake|test123|admin123)/i // Obvious spam words
];

module.exports = async function checkEmail(req, res, next) {
  try {
    const { email } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 
                      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      req.headers['x-real-ip'] || 'unknown';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const emailLower = email.toLowerCase().trim();
    const now = Date.now();

    // Relaxed rate limiting per email (5 attempts in 15 minutes)
    const emailKey = emailLower;
    const emailData = emailAttempts.get(emailKey);
    
    if (emailData) {
      emailData.count++;
      emailData.lastAttempt = now;
      
      if (emailData.count > 5) {
        return res.status(429).json({
          success: false,
          message: "Too many attempts with this email. Please try again later."
        });
      }
    } else {
      emailAttempts.set(emailKey, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    }

    // Relaxed rate limiting per IP (20 attempts in 15 minutes)
    if (clientIp !== 'unknown') {
      const ipData = ipAttempts.get(clientIp);
      
      if (ipData) {
        ipData.count++;
        ipData.lastAttempt = now;
        
        if (ipData.count > 20) {
          return res.status(429).json({
            success: false,
            message: "Too many registration attempts from this IP. Please try again later."
          });
        }
      } else {
        ipAttempts.set(clientIp, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        });
      }
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const domain = emailLower.split('@')[1];

    // Check only obvious disposable domains
    if (blockedDomains.some(blocked => domain === blocked)) {
      return res.status(400).json({
        success: false,
        message: "Disposable email addresses are not allowed"
      });
    }

    // Check only very obvious spam patterns
    if (spamPatterns.some(pattern => pattern.test(emailLower))) {
      return res.status(400).json({
        success: false,
        message: "Email appears to be invalid"
      });
    }

    // Trusted domains - skip further validation
    const trustedDomains = [
      'gmail.com',
      'yahoo.com', 
      'outlook.com',
      'hotmail.com',
      'icloud.com',
      'protonmail.com',
      'student.hcmute.edu.vn',
      'hcmute.edu.vn',
      'edu.vn'
    ];

    const isTrustedDomain = trustedDomains.some(trusted => 
      domain === trusted || domain.endsWith('.' + trusted)
    );

    if (isTrustedDomain) {
      // Skip deep validation for trusted domains
      console.log(`✅ Trusted domain registration: ${emailLower}`);
      return next();
    }

    // For other domains, do light validation
    try {
      const result = await validator.validate({
        email: emailLower,
        validateSMTP: false, // Skip SMTP for speed
        validateDNS: true,
        validateRegex: true
      });

      if (!result.valid) {
        console.log(`❌ Email validation failed: ${emailLower} - ${result.reason}`);
        return res.status(400).json({
          success: false,
          message: "Please use a valid email address"
        });
      }

      console.log(`✅ Non-trusted domain passed validation: ${emailLower}`);
    } catch (validationError) {
      console.warn("Email validation error:", validationError.message);
      // Allow on validation errors to avoid blocking legitimate users
    }

    next();
  } catch (err) {
    console.error("Email middleware error:", err);
    // In case of errors, allow the request to proceed
    next();
  }
};
