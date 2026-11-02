const fs = require('fs');
const path = require('path');

/**
 * Appends initial registration credentials to docs/INITIAL_CREDENTIALS.local.txt
 * for local development and initial testing.
 */
function logInitialCredentials({ school, schoolPlainPassword, admins }) {
  try {
    const docsDir = path.resolve(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const filePath = path.join(docsDir, 'INITIAL_CREDENTIALS.local.txt');
    const timestamp = new Date().toISOString();

    let content = '';
    content += `================================================================================\n`;
    content += `DMMS LOCAL DEVELOPMENT INITIAL CREDENTIALS (TEMPORARY - FIRST LOGIN REQUIRED)\n`;
    content += `Timestamp: ${timestamp}\n`;
    content += `IMPORTANT: Force password change is enabled on first login for all accounts.\n`;
    content += `--------------------------------------------------------------------------------\n`;
    content += `SCHOOL ACCOUNT:\n`;
    content += `  School Name        : ${school.schoolName}\n`;
    content += `  School ID          : ${school.schoolId}\n`;
    content += `  Initial Password   : ${schoolPlainPassword}\n`;
    content += `  School Email       : ${school.schoolEmail}\n`;
    content += `  Must Change Pass   : true\n\n`;

    content += `INITIAL ADMIN ACCOUNTS:\n`;
    admins.forEach((admin, index) => {
      content += `  [Admin #${index + 1}${admin.isPrimaryAdmin ? ' - PRIMARY' : ''}]\n`;
      content += `    Name             : ${admin.name}\n`;
      content += `    User ID          : ${admin.userId}\n`;
      content += `    Email            : ${admin.email}\n`;
      content += `    Initial Password : ${admin.plainPassword}\n`;
      content += `    Assigned Role    : ADMIN\n`;
      content += `    Must Change Pass : true\n`;
    });
    content += `================================================================================\n\n`;

    fs.appendFileSync(filePath, content, 'utf8');
    console.log(`[Credentials] Saved initial credentials to docs/INITIAL_CREDENTIALS.local.txt`);
  } catch (err) {
    console.error(`[Credentials Error] Could not write credentials to file: ${err.message}`);
  }
}

module.exports = {
  logInitialCredentials
};
