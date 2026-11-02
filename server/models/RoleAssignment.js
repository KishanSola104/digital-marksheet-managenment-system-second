const mongoose = require('mongoose');

const roleAssignmentSchema = new mongoose.Schema(
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
    roleId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'role_assignments'
  }
);

// Prevent duplicate assignment of the same role to a user within a school
roleAssignmentSchema.index({ schoolId: 1, userId: 1, roleId: 1 }, { unique: true });

const RoleAssignment = mongoose.model('RoleAssignment', roleAssignmentSchema);

module.exports = RoleAssignment;
