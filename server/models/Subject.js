const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      ref: 'School'
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true
    },
    subjectType: {
      type: String,
      required: [true, 'Subject type/category is required'],
      enum: {
        values: ['ACADEMIC', 'CO_CURRICULAR'],
        message: '{VALUE} is not a valid subject category. Must be ACADEMIC or CO_CURRICULAR.'
      },
      uppercase: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'subjects_info',
    timestamps: true
  }
);

// Enforce uniqueness per school
subjectSchema.index({ schoolId: 1, subjectCode: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, subjectName: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, subjectType: 1 });
subjectSchema.index({ schoolId: 1, isActive: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
