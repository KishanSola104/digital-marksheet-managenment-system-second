const schoolAuthService = require('../services/schoolAuthService');
const { getCookieOptions } = require('../utils/tokenHelper');

class SchoolAuthController {
  async registerSchool(req, res, next) {
    try {
      const result = await schoolAuthService.registerSchool(req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          schoolId: result.schoolId,
          schoolName: result.schoolName,
          schoolEmail: result.schoolEmail,
          admins: result.admins
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async loginSchool(req, res, next) {
    try {
      const { schoolId, password } = req.body;
      const result = await schoolAuthService.loginSchool(schoolId, password);

      // Set HTTP-only cookie for secure session
      res.cookie('dmms_school_token', result.token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'School authenticated successfully.',
        data: {
          schoolId: result.schoolId,
          schoolName: result.schoolName,
          schoolEmail: result.schoolEmail,
          mustChangePassword: result.mustChangePassword,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutSchool(req, res, next) {
    try {
      const cookieOptions = getCookieOptions();
      res.clearCookie('dmms_school_token', cookieOptions);
      res.clearCookie('dmms_user_token', cookieOptions);
      return res.status(200).json({
        success: true,
        message: 'School session ended successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getSchoolSession(req, res, next) {
    try {
      const sessionData = await schoolAuthService.getSchoolSession(req.school.schoolId);
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
      const result = await schoolAuthService.forgotPassword(req.body.email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await schoolAuthService.resetPassword(token, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await schoolAuthService.changePassword(
        req.school.schoolId,
        currentPassword,
        newPassword
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SchoolAuthController();
