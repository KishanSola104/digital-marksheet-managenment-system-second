const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Role = require('../models/Role');
const RoleAssignment = require('../models/RoleAssignment');
const { generateStaffUserId } = require('../helpers/idGenerator');
const { generateStrongPassword } = require('../helpers/passwordGenerator');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

class UserService {
  /**
   * Get all users for the authenticated school with role & employee information
   */
  async getUsers(schoolId, { search, status, role } = {}) {
    const query = { schoolId: schoolId.toUpperCase() };

    if (status !== undefined && status !== '') {
      query.isActive = status === 'true' || status === true;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { userId: { $regex: term, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .lean();

    // Attach role and employee information
    const userIds = users.map((u) => u.userId);

    const [roleAssignments, employees] = await Promise.all([
      RoleAssignment.find({
        schoolId: schoolId.toUpperCase(),
        userId: { $in: userIds }
      }).lean(),
      Employee.find({
        schoolId: schoolId.toUpperCase(),
        userId: { $in: userIds }
      }).lean()
    ]);

    const roleMap = new Map();
    roleAssignments.forEach((ra) => {
      if (!roleMap.has(ra.userId)) roleMap.set(ra.userId, []);
      roleMap.get(ra.userId).push(ra.roleId);
    });

    const employeeMap = new Map();
    employees.forEach((emp) => {
      employeeMap.set(emp.userId, emp);
    });

    let result = users.map((u) => {
      const roles = roleMap.get(u.userId) || [];
      const primaryRole = roles[0] || 'USER';
      const employee = employeeMap.get(u.userId) || null;
      return {
        ...u,
        roles,
        role: primaryRole,
        employee
      };
    });

    // Optional role filter
    if (role && role.trim()) {
      result = result.filter((u) => u.roles.includes(role.toUpperCase()));
    }

    return result;
  }

  /**
   * Get single user by ID
   */
  async getUserById(schoolId, userId) {
    const user = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: userId.toUpperCase()
    })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const [roleAssignments, employee] = await Promise.all([
      RoleAssignment.find({
        schoolId: schoolId.toUpperCase(),
        userId: user.userId
      }).lean(),
      Employee.findOne({
        schoolId: schoolId.toUpperCase(),
        userId: user.userId
      }).lean()
    ]);

    const roles = roleAssignments.map((ra) => ra.roleId);
    return {
      ...user,
      roles,
      role: roles[0] || 'USER',
      employee
    };
  }

  /**
   * Create a new user (with employee and role assignment)
   */
  async createUser(schoolId, { name, email, mobile, role }) {
    if (!name || !name.trim()) {
      const err = new Error('Full Name is required.');
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      const err = new Error('A valid email address is required.');
      err.statusCode = 400;
      throw err;
    }

    const mobileRegex = /^[0-9+\-\s]{7,15}$/;
    if (!mobile || !mobileRegex.test(mobile.trim())) {
      const err = new Error('A valid mobile number is required (7-15 digits).');
      err.statusCode = 400;
      throw err;
    }

    if (!role || !role.trim()) {
      const err = new Error('A user role must be selected.');
      err.statusCode = 400;
      throw err;
    }

    const targetRole = role.trim().toUpperCase();

    // Verify role exists in global roles
    const roleDoc = await Role.findOne({ roleId: targetRole });
    if (!roleDoc) {
      const err = new Error(`Role '${targetRole}' is not a recognized system role.`);
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate email in this school
    const existingEmail = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      email: email.trim().toLowerCase()
    });
    if (existingEmail) {
      const err = new Error(`A user with email '${email.trim()}' already exists in this school.`);
      err.statusCode = 400;
      throw err;
    }

    // ONE HEAD TEACHER PER SCHOOL RULE:
    // Prevent duplicate Head Teacher assignments even if the existing Head Teacher account is inactive.
    if (targetRole === 'HEAD_TEACHER') {
      const existingHeadTeacher = await RoleAssignment.findOne({
        schoolId: schoolId.toUpperCase(),
        roleId: 'HEAD_TEACHER'
      });
      if (existingHeadTeacher) {
        const err = new Error(
          'Each school can have only ONE Head Teacher account. A Head Teacher is already assigned for this school.'
        );
        err.statusCode = 400;
        throw err;
      }
    }

    // Generate unique ID and strong temporary password
    const newUserId = await generateStaffUserId(schoolId, targetRole);
    const plainTemporaryPassword = generateStrongPassword(14);
    const hashedPassword = await bcrypt.hash(plainTemporaryPassword, SALT_ROUNDS);

    // 1. Create User
    const newUser = new User({
      schoolId: schoolId.toUpperCase(),
      userId: newUserId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password: hashedPassword,
      mustChangePassword: true,
      isActive: true,
      isPrimaryAdmin: false
    });
    await newUser.save();

    // 2. Create Employee
    const newEmployee = new Employee({
      schoolId: schoolId.toUpperCase(),
      userId: newUserId,
      employeeName: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      employeeType: targetRole
    });
    await newEmployee.save();

    // 3. Create Role Assignment
    await RoleAssignment.create({
      schoolId: schoolId.toUpperCase(),
      userId: newUserId,
      roleId: targetRole,
      assignedAt: new Date()
    });

    return {
      user: {
        userId: newUserId,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: targetRole,
        isActive: newUser.isActive,
        mustChangePassword: newUser.mustChangePassword
      },
      temporaryPassword: plainTemporaryPassword,
      message: 'User account and employee profile created successfully.'
    };
  }

  /**
   * Update existing user details (Name, Email, Mobile, Role, Status)
   */
  async updateUser(schoolId, userId, { name, email, mobile, role, isActive }) {
    const user = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: userId.toUpperCase()
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    // If changing email, verify uniqueness
    if (email && email.trim().toLowerCase() !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        const err = new Error('Invalid email address format.');
        err.statusCode = 400;
        throw err;
      }

      const existingEmail = await User.findOne({
        schoolId: schoolId.toUpperCase(),
        email: email.trim().toLowerCase(),
        userId: { $ne: user.userId }
      });
      if (existingEmail) {
        const err = new Error(`A user with email '${email.trim()}' already exists in this school.`);
        err.statusCode = 400;
        throw err;
      }
      user.email = email.trim().toLowerCase();
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (mobile && mobile.trim()) {
      const mobileRegex = /^[0-9+\-\s]{7,15}$/;
      if (!mobileRegex.test(mobile.trim())) {
        const err = new Error('Invalid mobile number format.');
        err.statusCode = 400;
        throw err;
      }
      user.mobile = mobile.trim();
    }

    if (isActive !== undefined) {
      if (user.isPrimaryAdmin && isActive === false) {
        const err = new Error('The Primary Administrator account cannot be deactivated.');
        err.statusCode = 400;
        throw err;
      }
      user.isActive = Boolean(isActive);
    }

    await user.save();

    // Update or verify Role Assignment if provided
    let updatedRole = null;
    if (role && role.trim()) {
      const targetRole = role.trim().toUpperCase();
      const roleDoc = await Role.findOne({ roleId: targetRole });
      if (!roleDoc) {
        const err = new Error(`Role '${targetRole}' is not a valid system role.`);
        err.statusCode = 400;
        throw err;
      }

      // Check current assigned role
      const currentAssignment = await RoleAssignment.findOne({
        schoolId: schoolId.toUpperCase(),
        userId: user.userId
      });

      if (!currentAssignment || currentAssignment.roleId !== targetRole) {
        // Enforce ONE Head Teacher rule
        if (targetRole === 'HEAD_TEACHER') {
          const existingHeadTeacher = await RoleAssignment.findOne({
            schoolId: schoolId.toUpperCase(),
            roleId: 'HEAD_TEACHER',
            userId: { $ne: user.userId }
          });
          if (existingHeadTeacher) {
            const err = new Error(
              'Each school can have only ONE Head Teacher account. A Head Teacher is already assigned for this school.'
            );
            err.statusCode = 400;
            throw err;
          }
        }

        if (currentAssignment) {
          currentAssignment.roleId = targetRole;
          await currentAssignment.save();
        } else {
          await RoleAssignment.create({
            schoolId: schoolId.toUpperCase(),
            userId: user.userId,
            roleId: targetRole,
            assignedAt: new Date()
          });
        }
      }
      updatedRole = targetRole;
    }

    // Keep employee record synchronized
    let employee = await Employee.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: user.userId
    });

    if (employee) {
      employee.employeeName = user.name;
      employee.email = user.email;
      employee.mobile = user.mobile;
      if (updatedRole) employee.employeeType = updatedRole;
      await employee.save();
    } else {
      employee = await Employee.create({
        schoolId: schoolId.toUpperCase(),
        userId: user.userId,
        employeeName: user.name,
        email: user.email,
        mobile: user.mobile,
        employeeType: updatedRole || 'USER'
      });
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: updatedRole || employee.employeeType,
      isActive: user.isActive,
      message: 'User updated successfully.'
    };
  }

  /**
   * Toggle user active/inactive status
   */
  async updateUserStatus(schoolId, userId, isActive) {
    const user = await User.findOne({
      schoolId: schoolId.toUpperCase(),
      userId: userId.toUpperCase()
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.isPrimaryAdmin && !isActive) {
      const err = new Error('The Primary Administrator account cannot be deactivated.');
      err.statusCode = 400;
      throw err;
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return {
      userId: user.userId,
      isActive: user.isActive,
      message: `User ${user.name} has been ${user.isActive ? 'activated' : 'deactivated'}.`
    };
  }

  /**
   * Get all predefined system roles
   */
  async getRoles() {
    return await Role.find({}).sort({ roleId: 1 }).lean();
  }
}

module.exports = new UserService();
