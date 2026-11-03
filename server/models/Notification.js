const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    recipientUserId: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      index: true
    },
    recipientRole: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'alert'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'notifications',
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
