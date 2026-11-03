const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Get all notifications for the user within their school
   */
  async getNotifications(schoolId, userId, userRole) {
    const query = {
      schoolId: schoolId.toUpperCase(),
      $or: [
        { recipientUserId: userId.toUpperCase() },
        { recipientRole: userRole.toUpperCase() },
        { recipientUserId: null, recipientRole: null }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      notifications,
      unreadCount
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(schoolId, notificationId, userId, userRole) {
    const notification = await Notification.findOne({
      _id: notificationId,
      schoolId: schoolId.toUpperCase(),
      $or: [
        { recipientUserId: userId.toUpperCase() },
        { recipientRole: userRole.toUpperCase() },
        { recipientUserId: null, recipientRole: null }
      ]
    });

    if (!notification) {
      const err = new Error('Notification not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    notification.isRead = true;
    await notification.save();

    return { success: true, message: 'Notification marked as read.' };
  }

  /**
   * Mark all matching notifications as read
   */
  async markAllAsRead(schoolId, userId, userRole) {
    await Notification.updateMany(
      {
        schoolId: schoolId.toUpperCase(),
        isRead: false,
        $or: [
          { recipientUserId: userId.toUpperCase() },
          { recipientRole: userRole.toUpperCase() },
          { recipientUserId: null, recipientRole: null }
        ]
      },
      { isRead: true }
    );

    return { success: true, message: 'All notifications marked as read.' };
  }

  /**
   * Helper to create a notification (for seeding / future triggers)
   */
  async createNotification(schoolId, data) {
    return await Notification.create({
      schoolId: schoolId.toUpperCase(),
      ...data
    });
  }
}

module.exports = new NotificationService();
