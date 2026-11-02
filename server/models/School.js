const mongoose = require('mongoose');

const contactPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
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
    }
  },
  { _id: false }
);

const schoolSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    schoolName: {
      type: String,
      required: true,
      trim: true
    },
    establishedYear: {
      type: Number,
      required: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    schoolEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    schoolMobile: {
      type: String,
      required: true,
      trim: true
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: ''
    },
    contactPersons: {
      type: [contactPersonSchema],
      validate: [
        (val) => val && val.length >= 2 && val.length <= 3,
        'School must have between 2 and 3 contact persons'
      ]
    },
    password: {
      type: String,
      required: true
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    collection: 'schools_info',
    timestamps: true
  }
);

const School = mongoose.model('School', schoolSchema);

module.exports = School;
