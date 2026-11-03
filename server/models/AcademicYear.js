const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    yearName: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Upcoming'],
      default: 'Active'
    }
  },
  {
    collection: 'academic_year_info',
    timestamps: true
  }
);

// Prevent duplicate year names within the same school
academicYearSchema.index({ schoolId: 1, yearName: 1 }, { unique: true });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

module.exports = AcademicYear;
