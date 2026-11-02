const Role = require('../models/Role');

const PREDEFINED_ROLES = [
  {
    roleId: 'ADMIN',
    roleName: 'Admin',
    description: 'System Administrator with full access to school configuration and user management'
  },
  {
    roleId: 'HEAD_TEACHER',
    roleName: 'Head Teacher',
    description: 'Head Teacher responsible for academic oversight and marksheet approvals'
  },
  {
    roleId: 'TEACHER',
    roleName: 'Teacher',
    description: 'Teaching staff responsible for student marks entry and evaluation'
  },
  {
    roleId: 'OFFICE_STAFF',
    roleName: 'Office Staff',
    description: 'Administrative and office staff managing student records and operations'
  }
];

const seedRoles = async () => {
  try {
    for (const roleData of PREDEFINED_ROLES) {
      const exists = await Role.findOne({ roleId: roleData.roleId });
      if (!exists) {
        await Role.create(roleData);
        console.log(`[Seed] Initialized global role: ${roleData.roleId} (${roleData.roleName})`);
      }
    }
  } catch (error) {
    console.error(`[Seed Error] Failed to seed roles: ${error.message}`);
  }
};

module.exports = seedRoles;
