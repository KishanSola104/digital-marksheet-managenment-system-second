const crypto = require('crypto');

/**
 * Creates an unhashed random token (for the user) and a hashed token (for the DB)
 */
function createResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
}

/**
 * Hashes a given reset token to compare with the one stored in MongoDB
 */
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  createResetToken,
  hashResetToken
};
