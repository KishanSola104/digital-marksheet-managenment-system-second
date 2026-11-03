const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      ref: 'School'
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      trim: true,
      uppercase: true
    },
    plannedSectionCount: {
      type: Number,
      min: [0, 'Planned section count cannot be negative'],
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'classes_info',
    timestamps: true
  }
);

// Unique constraints per school
classSchema.index({ schoolId: 1, classCode: 1 }, { unique: true });
classSchema.index({ schoolId: 1, className: 1 }, { unique: true });
classSchema.index({ schoolId: 1, isActive: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
