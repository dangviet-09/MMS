const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleData = {
      provider: 'GOOGLE',
      providerId: profile.id,
      email: profile.emails[0].value,
      refreshToken: refreshToken,
      fullName: profile.displayName,
    };

    done(null, googleData);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
