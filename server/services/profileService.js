const User = require('../models/User');
const School = require('../models/School');
const Employee = require('../models/Employee');
const RoleAssignment = require('../models/RoleAssignment');

class ProfileService {
  /**
   * Get authenticated user profile with user, employee, and school details
   */
  async getProfile(schoolId, userId) {
    const user = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: userId.toUpperCase()
    })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      const err = new Error('User profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const [school, roleAssignments] = await Promise.all([
      School.findOne({ schoolId: schoolId.toUpperCase() })
        .select('schoolId schoolName schoolEmail state district establishedYear')
        .lean(),
      RoleAssignment.find({
        schoolId: schoolId.toUpperCase(),
        userId: user.userId
      }).lean()
    ]);

    let employee = await Employee.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: user.userId
    }).lean();

    // Auto-create employee record if user was registered prior to Phase 2
    if (!employee) {
      const created = await Employee.create({
        schoolId: user.schoolId,
        userId: user.userId,
        employeeName: user.name,
        email: user.email,
        mobile: user.mobile,
        employeeType: roleAssignments[0]?.roleId || 'ADMIN'
      });
      employee = created.toObject();
    }

    const roles = roleAssignments.map((ra) => ra.roleId);

    return {
      personal: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        roles,
        primaryRole: roles[0] || 'USER',
        isActive: user.isActive,
        isPrimaryAdmin: user.isPrimaryAdmin,
        createdAt: user.createdAt
      },
      school: school || { schoolId, schoolName: '' },
      employee: {
        employeeName: employee.employeeName,
        employeeType: employee.employeeType,
        createdAt: employee.createdAt
      }
    };
  }

  /**
   * Update editable personal profile fields (Name only).
   * Email and Mobile are strictly read-only for the user.
   */
  async updateProfile(schoolId, userId, { name }) {
    if (!name || !name.trim()) {
      const err = new Error('Full Name is required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: userId.toUpperCase()
    });

    if (!user) {
      const err = new Error('User profile not found.');
      err.statusCode = 404;
      throw err;
    }

    user.name = name.trim();
    await user.save();

    // Update Employee name as well
    await Employee.findOneAndUpdate(
      { schoolId: schoolId.toUpperCase(), userId: user.userId },
      { employeeName: name.trim() }
    );

    return await this.getProfile(schoolId, userId);
  }
}

module.exports = new ProfileService();
