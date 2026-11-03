const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      ref: 'School'
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
      index: true
    },
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true
    },
    sectionCode: {
      type: String,
      required: [true, 'Section code is required'],
      trim: true,
      uppercase: true
    },
    maximumCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be at least 1']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'sections_info',
    timestamps: true
  }
);

// Enforce uniqueness per school
sectionSchema.index({ schoolId: 1, sectionCode: 1 }, { unique: true });
// Enforce unique section name within the same class
sectionSchema.index({ schoolId: 1, classId: 1, sectionName: 1 }, { unique: true });
sectionSchema.index({ schoolId: 1, isActive: 1 });

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
