const profileService = require('../services/profileService');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.schoolId, req.user.userId);
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name } = req.body;
      const updated = await profileService.updateProfile(req.schoolId, req.user.userId, { name });
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
