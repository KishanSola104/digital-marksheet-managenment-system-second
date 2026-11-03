const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getNotifications(
        req.schoolId,
        req.user.userId,
        req.userRole
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(
        req.schoolId,
        req.params.id,
        req.user.userId,
        req.userRole
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(
        req.schoolId,
        req.user.userId,
        req.userRole
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
