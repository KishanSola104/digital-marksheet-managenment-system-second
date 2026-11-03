const express = require('express');
const router = express.Router();

const schoolAuthController = require('../controllers/schoolAuthController');
const userAuthController = require('../controllers/userAuthController');
const { verifySchoolToken, verifyUserToken } = require('../middlewares/authMiddleware');

// ==========================================
// School Registration
// ==========================================
router.post('/register-school', schoolAuthController.registerSchool);

// ==========================================
// School Authentication Endpoints
// ==========================================
router.post('/school-login', schoolAuthController.loginSchool);
router.post('/school-logout', schoolAuthController.logoutSchool);
router.get('/school-session', verifySchoolToken, schoolAuthController.getSchoolSession);
router.post('/school-forgot-password', schoolAuthController.forgotPassword);
router.post('/school-reset-password', schoolAuthController.resetPassword);
router.post('/school-change-password', verifySchoolToken, schoolAuthController.changePassword);

// ==========================================
// User Authentication Endpoints
// (Requires valid active school session context)
// ==========================================
router.post('/user-login', verifySchoolToken, userAuthController.loginUser);
router.post('/user-logout', userAuthController.logoutUser);
router.get('/user-session', verifyUserToken, userAuthController.getUserSession);
router.post('/user-forgot-password', userAuthController.forgotPassword);
router.post('/user-reset-password', userAuthController.resetPassword);
router.post('/user-change-password', verifyUserToken, userAuthController.changePassword);
router.post('/change-password', verifyUserToken, userAuthController.changePassword);

module.exports = router;
