const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dmms_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT for authenticated school session
 */
function generateSchoolToken(schoolId) {
  return jwt.sign(
    { schoolId, tokenType: 'school' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate JWT for authenticated user session
 */
function generateUserToken({ schoolId, userId, role }) {
  return jwt.sign(
    { schoolId, userId, role, tokenType: 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Standard cookie configuration
 */
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

/**
 * Verify token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateSchoolToken,
  generateUserToken,
  getCookieOptions,
  verifyToken
};
