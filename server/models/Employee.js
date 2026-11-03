const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    employeeType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    }
  },
  {
    collection: 'employees_info',
    timestamps: true
  }
);

// Compound index on schoolId and userId for fast lookup and uniqueness
employeeSchema.index({ schoolId: 1, userId: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
