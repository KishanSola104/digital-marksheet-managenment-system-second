const crypto = require('crypto');

/**
 * Generates a cryptographically strong random password.
 * Guaranteed to have uppercase, lowercase, numbers, and special characters.
 * Length defaults to 14 (>= 12).
 */
function generateStrongPassword(length = 14) {
  if (length < 12) length = 12;

  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous like I, O
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz'; // exclude ambiguous like l
  const numberChars = '23456789'; // exclude ambiguous like 0, 1
  const specialChars = '!@#$%^&*()_+~|}{[]:;?><,.-=';
  const allChars = upperChars + lowerChars + numberChars + specialChars;

  // Guarantee at least 2 of each character category
  const passwordArray = [
    upperChars[crypto.randomInt(0, upperChars.length)],
    upperChars[crypto.randomInt(0, upperChars.length)],
    lowerChars[crypto.randomInt(0, lowerChars.length)],
    lowerChars[crypto.randomInt(0, lowerChars.length)],
    numberChars[crypto.randomInt(0, numberChars.length)],
    numberChars[crypto.randomInt(0, numberChars.length)],
    specialChars[crypto.randomInt(0, specialChars.length)],
    specialChars[crypto.randomInt(0, specialChars.length)],
  ];

  // Fill the remaining length with random characters from all sets
  while (passwordArray.length < length) {
    passwordArray.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = passwordArray[i];
    passwordArray[i] = passwordArray[j];
    passwordArray[j] = temp;
  }

  return passwordArray.join('');
}

module.exports = {
  generateStrongPassword
};
