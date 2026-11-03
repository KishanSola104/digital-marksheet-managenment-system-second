const School = require('../models/School');
const User = require('../models/User');

/**
 * Extracts a 3-letter uppercase prefix from a name.
 * e.g., "St. Xavier's High School" -> "SXH" or "Green Valley" -> "GVL"
 */
function extractPrefix(name, fallback = 'SCH') {
  if (!name) return fallback;
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let prefix = '';
  if (words.length >= 3) {
    prefix = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    prefix = (words[0][0] + words[1].substring(0, 2)).toUpperCase();
  } else if (words.length === 1) {
    prefix = words[0].substring(0, 3).toUpperCase();
  }

  while (prefix.length < 3) {
    prefix += 'X';
  }
  return prefix.slice(0, 3);
}

/**
 * Generates a unique School ID in the format: DMMS-<PREFIX>-<6_DIGIT_NUMBER>
 * e.g., DMMS-ABC-000001
 */
async function generateSchoolId(schoolName) {
  const prefix = extractPrefix(schoolName, 'SCH');
  let counter = 1;
  let candidateId = '';
  let exists = true;

  // Find highest counter for this prefix or start from 1
  const existingSchoolsCount = await School.countDocuments({
    schoolId: new RegExp(`^DMMS-${prefix}-`, 'i')
  });
  counter = existingSchoolsCount + 1;

  while (exists) {
    const formattedNumber = String(counter).padStart(6, '0');
    candidateId = `DMMS-${prefix}-${formattedNumber}`;
    const found = await School.findOne({ schoolId: candidateId });
    if (!found) {
      exists = false;
    } else {
      counter++;
    }
  }

  return candidateId;
}

/**
 * Generates a unique Admin User ID in the format: ADM-<SCHOOL_PREFIX>-<4_DIGIT_NUMBER>
 * e.g., ADM-ABC-0001
 */
async function generateAdminUserId(schoolId, adminName) {
  // Extract the prefix part from schoolId if available: DMMS-ABC-000001 -> ABC
  const parts = schoolId.split('-');
  const schoolPrefix = parts.length >= 2 ? parts[1] : 'SCH';

  let counter = 1;
  let candidateId = '';
  let exists = true;

  const existingUsersCount = await User.countDocuments({
    userId: new RegExp(`^ADM-${schoolPrefix}-`, 'i')
  });
  counter = existingUsersCount + 1;

  while (exists) {
    const formattedNumber = String(counter).padStart(4, '0');
    candidateId = `ADM-${schoolPrefix}-${formattedNumber}`;
    const found = await User.findOne({ userId: candidateId });
    if (!found) {
      exists = false;
    } else {
      counter++;
    }
  }

  return candidateId;
}

/**
 * Generates a unique Staff User ID based on role:
 * ADMIN -> ADM-<SCHOOL_PREFIX>-<4_DIGIT_NUMBER>
 * HEAD_TEACHER -> HT-<SCHOOL_PREFIX>-<4_DIGIT_NUMBER>
 * TEACHER -> TEA-<SCHOOL_PREFIX>-<4_DIGIT_NUMBER>
 * OFFICE_STAFF -> STF-<SCHOOL_PREFIX>-<4_DIGIT_NUMBER>
 */
async function generateStaffUserId(schoolId, role) {
  const parts = schoolId.split('-');
  const schoolPrefix = parts.length >= 2 ? parts[1] : 'SCH';

  const rolePrefixMap = {
    ADMIN: 'ADM',
    HEAD_TEACHER: 'HDT',
    TEACHER: 'TCH',
    OFFICE_STAFF: 'OFS'
  };

  const rolePrefix = rolePrefixMap[role.toUpperCase()] || 'USR';

  let counter = 1;
  let candidateId = '';
  let exists = true;

  const existingCount = await User.countDocuments({
    userId: new RegExp(`^${rolePrefix}-${schoolPrefix}-`, 'i')
  });
  counter = existingCount + 1;

  while (exists) {
    const formattedNumber = String(counter).padStart(4, '0');
    candidateId = `${rolePrefix}-${schoolPrefix}-${formattedNumber}`;
    const found = await User.findOne({ userId: candidateId });
    if (!found) {
      exists = false;
    } else {
      counter++;
    }
  }

  return candidateId;
}

module.exports = {
  extractPrefix,
  generateSchoolId,
  generateAdminUserId,
  generateStaffUserId
};
