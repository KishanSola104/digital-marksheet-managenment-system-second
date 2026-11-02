const bcrypt = require('bcryptjs');
const User = require('../models/User');
const School = require('../models/School');
const RoleAssignment = require('../models/RoleAssignment');
const { generateUserToken } = require('../utils/tokenHelper');
const { createResetToken, hashResetToken } = require('../utils/cryptoHelper');
const { sendPasswordResetEmail } = require('../utils/emailService');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

class UserAuthService {
  /**
   * Authenticate a user within a school context
   */
  async loginUser({ schoolId, userId, password, selectedRole }) {
    if (!schoolId) {
      const err = new Error('School context is missing. Please log in to your School first.');
      err.statusCode = 401;
      throw err;
    }

    if (!userId || !password || !selectedRole) {
      const err = new Error('User ID, Password, and Role selection are required.');
      err.statusCode = 400;
      throw err;
    }

    // 1. Find user in this school
    const user = await User.findOne({
      userId: userId.trim().toUpperCase(),
      schoolId: schoolId.trim().toUpperCase()
    });

    if (!user) {
      const err = new Error('Invalid User ID or credentials for this school.');
      err.statusCode = 401;
      throw err;
    }

    // 2. Check if active
    if (!user.isActive) {
      const err = new Error('This user account is inactive. Please contact school administration.');
      err.statusCode = 403;
      throw err;
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid User ID or credentials.');
      err.statusCode = 401;
      throw err;
    }

    // 4. Verify that the selected role is assigned to this user
    const roleAssignment = await RoleAssignment.findOne({
      schoolId: user.schoolId,
      userId: user.userId,
      roleId: selectedRole.trim().toUpperCase()
    });

    if (!roleAssignment) {
      const err = new Error(
        `User is not assigned the role '${selectedRole}' in this school. Please select a valid role.`
      );
      err.statusCode = 403;
      throw err;
    }

    // 5. Generate User token
    const token = generateUserToken({
      schoolId: user.schoolId,
      userId: user.userId,
      role: selectedRole.trim().toUpperCase()
    });

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: selectedRole.trim().toUpperCase(),
      schoolId: user.schoolId,
      mustChangePassword: user.mustChangePassword,
      token
    };
  }

  /**
   * Get authenticated user session profile
   */
  async getUserSession({ schoolId, userId, role }) {
    const user = await User.findOne({
      userId: userId.toUpperCase(),
      schoolId: schoolId.toUpperCase()
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const school = await School.findOne({ schoolId: user.schoolId });

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: role.toUpperCase(),
      schoolId: user.schoolId,
      schoolName: school ? school.schoolName : '',
      isPrimaryAdmin: user.isPrimaryAdmin,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive
    };
  }

  /**
   * Request password reset for a user
   */
  async forgotPassword(schoolId, identifier) {
    if (!identifier || !identifier.trim()) {
      return {
        success: true,
        message: 'If an account exists, password reset instructions have been dispatched.'
      };
    }

    const trimmed = identifier.trim();
    const query = {
      $or: [{ userId: trimmed.toUpperCase() }, { email: trimmed.toLowerCase() }]
    };
    if (schoolId) {
      query.schoolId = schoolId.toUpperCase();
    }

    const user = await User.findOne(query);
    if (!user) {
      return {
        success: true,
        message: 'If an account exists, password reset instructions have been dispatched.'
      };
    }

    const { resetToken, hashedToken } = createResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/user-reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      toEmail: user.email,
      recipientName: user.name,
      resetUrl,
      accountType: 'User'
    });

    return {
      success: true,
      message: 'If an account exists, password reset instructions have been dispatched.'
    };
  }

  /**
   * Reset user password via reset token
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
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      const err = new Error('Password reset token is invalid or has expired.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.mustChangePassword = false;
    await user.save();

    return {
      success: true,
      message: 'User password reset successfully. You may now log in with your new password.'
    };
  }

  /**
   * Change user password (forced on first login or manual)
   */
  async changePassword({ schoolId, userId, currentPassword, newPassword }) {
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

    const user = await User.findOne({
      userId: userId.toUpperCase(),
      schoolId: schoolId.toUpperCase()
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password does not match.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save();

    return {
      success: true,
      message: 'User password updated successfully.'
    };
  }
}

module.exports = new UserAuthService();
