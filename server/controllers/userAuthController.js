const userAuthService = require('../services/userAuthService');
const { getCookieOptions } = require('../utils/tokenHelper');

class UserAuthController {
  async loginUser(req, res, next) {
    try {
      // Prioritize school context from verified School session middleware, or fallback to body if provided
      const schoolId = req.school ? req.school.schoolId : req.body.schoolId;
      const { userId, password, role } = req.body;

      const result = await userAuthService.loginUser({
        schoolId,
        userId,
        password,
        selectedRole: role
      });

      // Set HTTP-only cookie for user session
      res.cookie('dmms_user_token', result.token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'User authenticated successfully.',
        data: {
          userId: result.userId,
          name: result.name,
          email: result.email,
          role: result.role,
          schoolId: result.schoolId,
          schoolName: result.schoolName,
          mustChangePassword: result.mustChangePassword,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutUser(req, res, next) {
    try {
      const cookieOptions = getCookieOptions();
      res.clearCookie('dmms_user_token', cookieOptions);
      return res.status(200).json({
        success: true,
        message: 'User logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSession(req, res, next) {
    try {
      const sessionData = await userAuthService.getUserSession({
        schoolId: req.user.schoolId,
        userId: req.user.userId,
        role: req.userRole
      });
      return res.status(200).json({
        success: true,
        data: sessionData
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const schoolId = req.school ? req.school.schoolId : req.body.schoolId;
      const result = await userAuthService.forgotPassword(schoolId, req.body.identifier);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await userAuthService.resetPassword(token, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userAuthService.changePassword({
        schoolId: req.user.schoolId,
        userId: req.user.userId,
        currentPassword,
        newPassword
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserAuthController();
