const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    roleName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    collection: 'roles_info',
    timestamps: true
  }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
