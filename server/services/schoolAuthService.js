const bcrypt = require('bcryptjs');
const School = require('../models/School');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');
const { generateSchoolId, generateAdminUserId } = require('../helpers/idGenerator');
const { generateStrongPassword } = require('../helpers/passwordGenerator');
const { logInitialCredentials } = require('../helpers/credentialsLogger');
const { generateSchoolToken } = require('../utils/tokenHelper');
const { createResetToken, hashResetToken } = require('../utils/cryptoHelper');
const { sendPasswordResetEmail } = require('../utils/emailService');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

class SchoolAuthService {
  /**
   * Register a new School, along with contact persons and initial Admin account(s).
   */
  async registerSchool(data) {
    const {
      schoolName,
      establishedYear,
      state,
      district,
      address,
      schoolEmail,
      schoolMobile,
      websiteUrl,
      contactPersons,
      admins
    } = data;

    // 1. Validations
    if (!schoolName || !schoolName.trim()) {
      const err = new Error('School Name is required.');
      err.statusCode = 400;
      throw err;
    }

    const currentYear = new Date().getFullYear();
    const estYearNum = Number(establishedYear);
    if (!estYearNum || estYearNum < 1800 || estYearNum > currentYear) {
      const err = new Error(`Established Year must be a valid 4-digit year between 1800 and ${currentYear}.`);
      err.statusCode = 400;
      throw err;
    }

    if (!state || !state.trim()) {
      const err = new Error('State is required.');
      err.statusCode = 400;
      throw err;
    }

    if (!district || !district.trim()) {
      const err = new Error('District is required.');
      err.statusCode = 400;
      throw err;
    }

    if (!address || !address.trim()) {
      const err = new Error('Complete Address is required.');
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!schoolEmail || !emailRegex.test(schoolEmail.trim())) {
      const err = new Error('A valid School Email address is required.');
      err.statusCode = 400;
      throw err;
    }

    const mobileRegex = /^[0-9+\-\s]{7,15}$/;
    if (!schoolMobile || !mobileRegex.test(schoolMobile.trim())) {
      const err = new Error('A valid School Mobile Number is required (7-15 digits).');
      err.statusCode = 400;
      throw err;
    }

    // Check contact persons (min 2, max 3)
    if (!Array.isArray(contactPersons) || contactPersons.length < 2 || contactPersons.length > 3) {
      const err = new Error('Between 2 and 3 contact persons are required.');
      err.statusCode = 400;
      throw err;
    }

    for (let i = 0; i < contactPersons.length; i++) {
      const cp = contactPersons[i];
      if (!cp.name?.trim() || !cp.position?.trim() || !cp.email?.trim() || !cp.mobile?.trim()) {
        const err = new Error(`All fields are required for Contact Person #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
      if (!emailRegex.test(cp.email.trim())) {
        const err = new Error(`Invalid email for Contact Person #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
      if (!mobileRegex.test(cp.mobile.trim())) {
        const err = new Error(`Invalid mobile for Contact Person #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
    }

    // Check initial admins (min 1, max 3)
    if (!Array.isArray(admins) || admins.length < 1 || admins.length > 3) {
      const err = new Error('Between 1 and 3 initial Admin accounts must be registered.');
      err.statusCode = 400;
      throw err;
    }

    const adminEmailSet = new Set();
    for (let i = 0; i < admins.length; i++) {
      const adm = admins[i];
      if (!adm.name?.trim() || !adm.email?.trim() || !adm.mobile?.trim()) {
        const err = new Error(`All fields are required for Admin #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
      const admEmailLower = adm.email.trim().toLowerCase();
      if (!emailRegex.test(admEmailLower)) {
        const err = new Error(`Invalid email format for Admin #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
      if (!mobileRegex.test(adm.mobile.trim())) {
        const err = new Error(`Invalid mobile for Admin #${i + 1}.`);
        err.statusCode = 400;
        throw err;
      }
      if (adminEmailSet.has(admEmailLower)) {
        const err = new Error(`Duplicate admin email detected: ${admEmailLower}. Each admin must have a unique email.`);
        err.statusCode = 400;
        throw err;
      }
      adminEmailSet.add(admEmailLower);
    }

    // Check schoolEmail uniqueness in database
    const existingSchool = await School.findOne({ schoolEmail: schoolEmail.trim().toLowerCase() });
    if (existingSchool) {
      const err = new Error('A school with this email address is already registered in DMMS.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Generate unique IDs and strong passwords
    const generatedSchoolId = await generateSchoolId(schoolName);
    const schoolPlainPassword = generateStrongPassword(14);
    const hashedSchoolPassword = await bcrypt.hash(schoolPlainPassword, SALT_ROUNDS);

    // 3. Create School Record
    const newSchool = new School({
      schoolId: generatedSchoolId,
      schoolName: schoolName.trim(),
      establishedYear: estYearNum,
      state: state.trim(),
      district: district.trim(),
      address: address.trim(),
      schoolEmail: schoolEmail.trim().toLowerCase(),
      schoolMobile: schoolMobile.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : '',
      contactPersons: contactPersons.map((cp) => ({
        name: cp.name.trim(),
        position: cp.position.trim(),
        email: cp.email.trim().toLowerCase(),
        mobile: cp.mobile.trim()
      })),
      password: hashedSchoolPassword,
      mustChangePassword: true,
      isActive: true
    });

    await newSchool.save();

    // 4. Create Admin Users and Role Assignments
    const createdAdmins = [];
    const credentialsAdmins = [];

    for (let i = 0; i < admins.length; i++) {
      const adm = admins[i];
      const adminUserId = await generateAdminUserId(generatedSchoolId, adm.name);
      const adminPlainPassword = generateStrongPassword(14);
      const hashedAdminPassword = await bcrypt.hash(adminPlainPassword, SALT_ROUNDS);
      const isPrimary = i === 0;

      const newUser = new User({
        schoolId: generatedSchoolId,
        userId: adminUserId,
        name: adm.name.trim(),
        email: adm.email.trim().toLowerCase(),
        mobile: adm.mobile.trim(),
        password: hashedAdminPassword,
        mustChangePassword: true,
        isActive: true,
        isPrimaryAdmin: isPrimary
      });

      await newUser.save();

      // Assign global ADMIN role
      await RoleAssignment.create({
        schoolId: generatedSchoolId,
        userId: adminUserId,
        roleId: 'ADMIN',
        assignedAt: new Date()
      });

      createdAdmins.push({
        userId: adminUserId,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        isPrimaryAdmin: isPrimary
      });

      credentialsAdmins.push({
        userId: adminUserId,
        name: newUser.name,
        email: newUser.email,
        plainPassword: adminPlainPassword,
        isPrimaryAdmin: isPrimary
      });
    }

    // 5. Securely log initial credentials locally for development
    logInitialCredentials({
      school: newSchool,
      schoolPlainPassword,
      admins: credentialsAdmins
    });

    // 6. Return response (never return plain passwords or hashes)
    return {
      schoolId: generatedSchoolId,
      schoolName: newSchool.schoolName,
      schoolEmail: newSchool.schoolEmail,
      admins: createdAdmins,
      message: 'School and initial Admin accounts registered successfully.'
    };
  }

  /**
   * Authenticate a School
   */
  async loginSchool(schoolId, password) {
    if (!schoolId || !password) {
      const err = new Error('School ID and School Password are required.');
      err.statusCode = 400;
      throw err;
    }

    const school = await School.findOne({ schoolId: schoolId.trim().toUpperCase() });
    if (!school) {
      const err = new Error('Invalid School ID or password.');
      err.statusCode = 401;
      throw err;
    }

    if (!school.isActive) {
      const err = new Error('This school account is currently inactive. Please contact system support.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      const err = new Error('Invalid School ID or password.');
      err.statusCode = 401;
      throw err;
    }

    const token = generateSchoolToken(school.schoolId);

    return {
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      schoolEmail: school.schoolEmail,
      mustChangePassword: school.mustChangePassword,
      token
    };
  }

  /**
   * Get authenticated school session profile
   */
  async getSchoolSession(schoolId) {
    const school = await School.findOne({ schoolId: schoolId.toUpperCase() });
    if (!school) {
      const err = new Error('School not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      schoolEmail: school.schoolEmail,
      establishedYear: school.establishedYear,
      state: school.state,
      district: school.district,
      mustChangePassword: school.mustChangePassword,
      isActive: school.isActive
    };
  }

  /**
   * Request password reset for School
   */
  async forgotPassword(email) {
    if (!email || !email.trim()) {
      return { success: true, message: 'If a matching school account exists, reset instructions have been dispatched.' };
    }

    const school = await School.findOne({ schoolEmail: email.trim().toLowerCase() });
    if (!school) {
      return { success: true, message: 'If a matching school account exists, reset instructions have been dispatched.' };
    }

    const { resetToken, hashedToken } = createResetToken();
    school.resetPasswordToken = hashedToken;
    school.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await school.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/school-reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      toEmail: school.schoolEmail,
      recipientName: school.schoolName,
      resetUrl,
      accountType: 'School'
    });

    return {
      success: true,
      message: 'If a matching school account exists, reset instructions have been dispatched.'
    };
  }

  /**
   * Reset School password via reset token
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      const err = new Error('Reset token and new password are required.');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 8) {
      const err = new Error('Password must be at least 8 characters long.');
      err.statusCode = 400;
      throw err;
    }

    const hashedToken = hashResetToken(token);
    const school = await School.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!school) {
      const err = new Error('Password reset token is invalid or has expired.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    school.password = hashedPassword;
    school.resetPasswordToken = null;
    school.resetPasswordExpires = null;
    school.mustChangePassword = false;
    await school.save();

    return {
      success: true,
      message: 'School password reset successfully. You may now log in with your new password.'
    };
  }

  /**
   * Change School password (e.g. forced first login or manual change)
   */
  async changePassword(schoolId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const err = new Error('Current password and new password are required.');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 8) {
      const err = new Error('New password must be at least 8 characters long.');
      err.statusCode = 400;
      throw err;
    }

    const school = await School.findOne({ schoolId: schoolId.toUpperCase() });
    if (!school) {
      const err = new Error('School not found.');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, school.password);
    if (!isMatch) {
      const err = new Error('Current password does not match.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    school.password = hashedPassword;
    school.mustChangePassword = false;
    await school.save();

    return {
      success: true,
      message: 'School password updated successfully.'
    };
  }
}

module.exports = new SchoolAuthService();
