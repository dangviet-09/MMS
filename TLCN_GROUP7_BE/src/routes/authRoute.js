const express = require("express");
const router = express.Router();
const passport = require('../configs/passport.js');
const authcontroller = require('../controllers/authController')
const AuthMiddleware = require('../middlewares/AuthMiddleware');


router.post("/",authcontroller.login)
router.post("/refresh-token", authcontroller.refreshToken);
router.get("/me", AuthMiddleware.verifyToken, authcontroller.getCurrentUser);
router.post("/logout", AuthMiddleware.verifyToken, authcontroller.logout);
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      session: false 
    }, (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=oauth_failed`);
      }
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=oauth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  authcontroller.googleCallback
);
router.post('/verify-username', authcontroller.verifyUsername);
router.post('/verify-otp', authcontroller.verifyOTP);
router.post('/reset-password', authcontroller.changePassword);


module.exports = router 