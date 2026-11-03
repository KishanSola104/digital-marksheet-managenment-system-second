const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
      ref: 'School'
    },
    academicYearName: {
      type: String,
      required: true,
      trim: true
    },
    yearName: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Closed', 'Completed'],
      default: 'Upcoming'
    }
  },
  {
    collection: 'academic_year_info',
    timestamps: true
  }
);

// Sync yearName and academicYearName before validation
academicYearSchema.pre('validate', function (next) {
  if (this.academicYearName && !this.yearName) {
    this.yearName = this.academicYearName;
  } else if (this.yearName && !this.academicYearName) {
    this.academicYearName = this.yearName;
  }
  next();
});

// Calculate status helper
academicYearSchema.methods.calculateStatus = function () {
  if (!this.startDate || !this.endDate) return 'Active';
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) {
    return 'Upcoming';
  } else if (now > end) {
    return 'Closed';
  } else {
    return 'Active';
  }
};

// Update status before saving
academicYearSchema.pre('save', function (next) {
  this.status = this.calculateStatus();
  next();
});

// Ensure academicYearName is unique per school
academicYearSchema.index({ schoolId: 1, academicYearName: 1 }, { unique: true });
academicYearSchema.index({ schoolId: 1, yearName: 1 }, { unique: true });
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });
academicYearSchema.index({ schoolId: 1, startDate: 1, endDate: 1 });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

module.exports = AcademicYear;
