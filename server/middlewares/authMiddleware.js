const { verifyToken } = require('../utils/tokenHelper');
const School = require('../models/School');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');

/**
 * Middleware to verify School session
 */
async function verifySchoolToken(req, res, next) {
  try {
    let token = req.cookies?.dmms_school_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'School authentication session required. Please log in as a School first.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.tokenType !== 'school' || !decoded.schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired school session. Please log in again.'
      });
    }

    const school = await School.findOne({ schoolId: decoded.schoolId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Associated school record not found.'
      });
    }

    if (!school.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This school account is currently inactive. Contact system administrator.'
      });
    }

    req.school = school;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate school session.'
    });
  }
}

/**
 * Middleware to verify User session
 */
async function verifyUserToken(req, res, next) {
  try {
    let token = req.cookies?.dmms_user_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required. Please log in.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.tokenType !== 'user' || !decoded.userId || !decoded.schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired user session. Please log in again.'
      });
    }

    const user = await User.findOne({
      userId: decoded.userId,
      schoolId: decoded.schoolId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in this school.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This user account is inactive. Please contact school administration.'
      });
    }

    // Verify role assignment exists in DB
    const assignment = await RoleAssignment.findOne({
      schoolId: decoded.schoolId,
      userId: decoded.userId,
      roleId: decoded.role
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: User is not assigned role '${decoded.role}' in this school.`
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    req.schoolId = decoded.schoolId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user session.'
    });
  }
}

/**
 * Middleware to restrict access to specific roles
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.'
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = {
  verifySchoolToken,
  verifyUserToken,
  requireRole
};
