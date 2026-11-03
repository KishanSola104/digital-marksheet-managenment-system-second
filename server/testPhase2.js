const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const School = require('./models/School');
const User = require('./models/User');
const Role = require('./models/Role');
const RoleAssignment = require('./models/RoleAssignment');
const Employee = require('./models/Employee');
const AcademicYear = require('./models/AcademicYear');
const Notification = require('./models/Notification');

const BASE_URL = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n============================================================');
  console.log('   DMMS PHASE 2 AUTOMATED INTEGRATION TEST SUITE');
  console.log('============================================================\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dmms_db');
  console.log('Connected to MongoDB.\n');

  try {
    // 1. Roles Verification
    console.log('--- 1. Predefined Global Roles Verification ---');
    const requiredRoles = ['ADMIN', 'HEAD_TEACHER', 'TEACHER', 'OFFICE_STAFF'];
    for (const roleId of requiredRoles) {
      const found = await Role.findOne({ roleId });
      assert(!!found, `Role '${roleId}' exists in roles_info`);
    }

    // 2. Setup Test School & Admin
    console.log('\n--- 2. Institutional Authentication & School Setup ---');
    const testSchoolId = 'DMMS-SXM-000001';
    const school = await School.findOne({ schoolId: testSchoolId });
    assert(!!school, `Test School '${testSchoolId}' exists in database`);

    const adminUser = await User.findOne({ schoolId: testSchoolId, isPrimaryAdmin: true });
    assert(!!adminUser, `Primary Admin exists for '${testSchoolId}' (${adminUser?.userId})`);

    // Test Phase 1 School Session
    const { generateSchoolToken, generateUserToken } = require('./utils/tokenHelper');
    const schoolToken = generateSchoolToken(testSchoolId);
    assert(!!schoolToken, 'Generated valid school session JWT token');
    const schoolCookieHeaders = { Cookie: `dmms_school_token=${schoolToken}` };

    const schoolSessionRes = await request('/auth/school-session', { headers: schoolCookieHeaders });
    assert(schoolSessionRes.status === 200, 'Phase 1 School Session verified (HTTP 200)');
    assert(schoolSessionRes.data.data.schoolId === testSchoolId, 'Phase 1 School Session returns correct schoolId');

    const adminToken = generateUserToken({
      schoolId: testSchoolId,
      userId: adminUser.userId,
      role: 'ADMIN'
    });
    assert(!!adminToken, 'Generated valid admin JWT token');

    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      Cookie: `dmms_school_token=${schoolToken}; dmms_user_token=${adminToken}`
    };

    const userSessionRes = await request('/auth/user-session', { headers: adminHeaders });
    assert(userSessionRes.status === 200, 'Phase 1 User Session verified (HTTP 200)');
    assert(userSessionRes.data.data.userId === adminUser.userId, 'Phase 1 User Session returns correct admin userId');

    // 3. Admin User Management - List Users
    console.log('\n--- 3. Admin User Management (GET /api/users) ---');
    const listRes = await request('/users', { headers: adminHeaders });
    assert(listRes.status === 200, 'Admin can fetch users (HTTP 200)');
    assert(listRes.data.success === true, 'Response reports success: true');
    assert(Array.isArray(listRes.data.data), 'Returns users array');
    assert(
      listRes.data.data.every((u) => u.schoolId === testSchoolId),
      'Strict multi-school isolation: all returned users belong to authenticated school'
    );

    // Clean up any previous test-created users to allow repeatable test runs
    await User.deleteMany({
      schoolId: testSchoolId,
      email: { $in: ['anjali.teacher@stxavier.edu', 'father.joseph@stxavier.edu', 'sister.mary@stxavier.edu'] }
    });
    await Employee.deleteMany({
      schoolId: testSchoolId,
      email: { $in: ['anjali.teacher@stxavier.edu', 'father.joseph@stxavier.edu', 'sister.mary@stxavier.edu'] }
    });
    await RoleAssignment.deleteMany({
      schoolId: testSchoolId,
      userId: { $regex: '^(TCH|HDT)-' }
    });

    // 4. Create Teacher User
    console.log('\n--- 4. Create User (POST /api/users - TEACHER) ---');
    const createTeacherRes = await request('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Anjali Sharma',
        email: 'anjali.teacher@stxavier.edu',
        mobile: '9876543211',
        role: 'TEACHER'
      })
    });

    assert(createTeacherRes.status === 201, 'User created with HTTP 201');
    assert(createTeacherRes.data.success === true, 'Create response has success: true');
    const teacherData = createTeacherRes.data.data?.user;
    const tempPassword = createTeacherRes.data.data?.temporaryPassword;

    assert(teacherData?.userId.startsWith('TCH-SXM-'), `Generated User ID format matches 'TCH-SXM-0001' (${teacherData?.userId})`);
    assert(teacherData?.role === 'TEACHER', 'Role assigned as TEACHER');
    assert(teacherData?.mustChangePassword === true, 'mustChangePassword is set to true');
    assert(typeof tempPassword === 'string' && tempPassword.length >= 12, 'Temporary password generated (length >= 12)');
    assert(/[A-Z]/.test(tempPassword), 'Temporary password contains uppercase letter');
    assert(/[a-z]/.test(tempPassword), 'Temporary password contains lowercase letter');
    assert(/[0-9]/.test(tempPassword), 'Temporary password contains number');
    assert(/[^A-Za-z0-9]/.test(tempPassword), 'Temporary password contains special character');

    // Verify DB records separation
    const teacherInDB = await User.findOne({ userId: teacherData.userId });
    assert(!!teacherInDB, 'User record created in users_info');
    assert(teacherInDB.password !== tempPassword, 'Password is securely hashed with bcrypt in MongoDB');

    const employeeInDB = await Employee.findOne({ userId: teacherData.userId });
    assert(!!employeeInDB, 'Employee record created in employees_info');
    assert(employeeInDB.employeeName === 'Anjali Sharma', 'Employee name matches');
    assert(employeeInDB.employeeType === 'TEACHER', 'Employee type matches TEACHER');

    const roleAssignmentInDB = await RoleAssignment.findOne({ userId: teacherData.userId, roleId: 'TEACHER' });
    assert(!!roleAssignmentInDB, 'Role assignment record created in role_assignments');

    // 5. Create Head Teacher User
    console.log('\n--- 5. Create Head Teacher (POST /api/users - HEAD_TEACHER) ---');
    const createHeadTeacherRes = await request('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Father Joseph',
        email: 'father.joseph@stxavier.edu',
        mobile: '9876543212',
        role: 'HEAD_TEACHER'
      })
    });

    assert(createHeadTeacherRes.status === 201, 'Head Teacher created successfully (HTTP 201)');
    const htData = createHeadTeacherRes.data.data?.user;
    assert(htData?.userId.startsWith('HDT-SXM-'), `Head Teacher User ID matches 'HDT-SXM-...' (${htData?.userId})`);

    // 6. ONE HEAD TEACHER PER SCHOOL RULE
    console.log('\n--- 6. Enforce ONE Head Teacher Per School Rule ---');
    const duplicateHeadTeacherRes = await request('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Sister Mary',
        email: 'sister.mary@stxavier.edu',
        mobile: '9876543213',
        role: 'HEAD_TEACHER'
      })
    });

    assert(duplicateHeadTeacherRes.status === 400, 'Duplicate Head Teacher creation rejected (HTTP 400)');
    if (!duplicateHeadTeacherRes.data.message?.includes('only ONE Head Teacher')) {
      console.log('    [DEBUG duplicateHeadTeacherRes]:', duplicateHeadTeacherRes);
    }
    assert(
      duplicateHeadTeacherRes.data.message?.includes('only ONE Head Teacher'),
      'Backend returned strict ONE Head Teacher error message'
    );

    // 7. Duplicate Email Validation
    console.log('\n--- 7. Duplicate Email Prevention Within Same School ---');
    const duplicateEmailRes = await request('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Another Teacher',
        email: 'anjali.teacher@stxavier.edu',
        mobile: '9876543299',
        role: 'TEACHER'
      })
    });

    assert(duplicateEmailRes.status === 400, 'Duplicate email registration rejected (HTTP 400)');
    if (!duplicateEmailRes.data.message?.includes('already exists in this school')) {
      console.log('    [DEBUG duplicateEmailRes]:', duplicateEmailRes);
    }
    assert(
      duplicateEmailRes.data.message?.includes('already exists in this school'),
      'Clear duplicate email error returned'
    );

    // 8. Edit User
    console.log('\n--- 8. Edit User (PUT /api/users/:id) ---');
    const editRes = await request(`/users/${teacherData.userId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Anjali R. Sharma',
        email: 'anjali.teacher@stxavier.edu',
        mobile: '9876543299',
        role: 'TEACHER'
      })
    });

    assert(editRes.status === 200, 'User updated successfully (HTTP 200)');
    const updatedEmployee = await Employee.findOne({ userId: teacherData.userId });
    assert(updatedEmployee.employeeName === 'Anjali R. Sharma', 'Employee record synchronized with updated name');
    assert(updatedEmployee.mobile === '9876543299', 'Employee mobile synchronized');

    // Attempt to change role to HEAD_TEACHER via Edit User when one already exists
    const invalidRoleEditRes = await request(`/users/${teacherData.userId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        role: 'HEAD_TEACHER'
      })
    });
    assert(invalidRoleEditRes.status === 400, 'Attempting to edit user role to a second HEAD_TEACHER rejected (HTTP 400)');

    // 9. User Status & Login Restriction
    console.log('\n--- 9. User Status (Activate/Deactivate & Access Restriction) ---');
    // Deactivate teacher
    const deactivateRes = await request(`/users/${teacherData.userId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ isActive: false })
    });
    assert(deactivateRes.status === 200, 'User deactivated (HTTP 200)');

    // Attempt to login as deactivated user
    const inactiveLoginRes = await request('/auth/user-login', {
      method: 'POST',
      headers: schoolCookieHeaders,
      body: JSON.stringify({
        schoolId: testSchoolId,
        userId: teacherData.userId,
        password: tempPassword,
        role: 'TEACHER'
      })
    });
    assert(inactiveLoginRes.status === 403, 'Inactive user rejected during login (HTTP 403)');

    // Attempt to deactivate primary admin (must be prevented)
    const deactAdminRes = await request(`/users/${adminUser.userId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ isActive: false })
    });
    assert(deactAdminRes.status === 400, 'Primary Admin deactivation prevented (HTTP 400)');

    // Reactivate teacher
    const reactivateRes = await request(`/users/${teacherData.userId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ isActive: true })
    });
    assert(reactivateRes.status === 200, 'User reactivated successfully');

    // 10. Change Password & First Login Flow
    console.log('\n--- 10. Change Password & First Login Flow ---');
    // Teacher logs in with temporary password
    const teacherLoginRes = await request('/auth/user-login', {
      method: 'POST',
      headers: schoolCookieHeaders,
      body: JSON.stringify({
        schoolId: testSchoolId,
        userId: teacherData.userId,
        password: tempPassword,
        role: 'TEACHER'
      })
    });
    assert(teacherLoginRes.status === 200, 'Teacher logged in with temporary password (HTTP 200)');
    assert(teacherLoginRes.data.data.mustChangePassword === true, 'Response flags mustChangePassword: true');

    const teacherToken = teacherLoginRes.data.data.token;
    const teacherHeaders = {
      Authorization: `Bearer ${teacherToken}`,
      Cookie: `dmms_school_token=${schoolToken}; dmms_user_token=${teacherToken}`
    };

    // Change password with wrong current password
    const wrongPassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify({
        currentPassword: 'WrongPassword123!',
        newPassword: 'MyNewSecurePassword#2026'
      })
    });
    assert(wrongPassRes.status === 400, 'Wrong current password rejected (HTTP 400)');

    // Change password with same password as current
    const samePassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify({
        currentPassword: tempPassword,
        newPassword: tempPassword
      })
    });
    assert(samePassRes.status === 400, 'Identical new password rejected (HTTP 400)');

    // Valid change password
    const validPassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: teacherHeaders,
      body: JSON.stringify({
        currentPassword: tempPassword,
        newPassword: 'MyNewSecurePassword#2026'
      })
    });
    assert(validPassRes.status === 200, 'Password updated successfully (HTTP 200)');

    const teacherAfterPass = await User.findOne({ userId: teacherData.userId });
    assert(teacherAfterPass.mustChangePassword === false, 'mustChangePassword flag updated to false');

    // Old temporary password fails
    const oldPassLoginRes = await request('/auth/user-login', {
      method: 'POST',
      headers: schoolCookieHeaders,
      body: JSON.stringify({
        schoolId: testSchoolId,
        userId: teacherData.userId,
        password: tempPassword,
        role: 'TEACHER'
      })
    });
    assert(oldPassLoginRes.status === 401, 'Old temporary password no longer valid (HTTP 401)');

    // New password succeeds
    const newPassLoginRes = await request('/auth/user-login', {
      method: 'POST',
      headers: schoolCookieHeaders,
      body: JSON.stringify({
        schoolId: testSchoolId,
        userId: teacherData.userId,
        password: 'MyNewSecurePassword#2026',
        role: 'TEACHER'
      })
    });
    assert(newPassLoginRes.status === 200, 'Login with new password succeeds (HTTP 200)');
    assert(newPassLoginRes.data.data.mustChangePassword === false, 'Account no longer forces password change');

    // 11. Profile Management
    console.log('\n--- 11. Profile Management (GET & PUT /api/profile) ---');
    const profileRes = await request('/profile', { headers: teacherHeaders });
    assert(profileRes.status === 200, 'User profile fetched (HTTP 200)');
    assert(profileRes.data.data.personal.userId === teacherData.userId, 'Profile returns correct personal User ID');
    assert(profileRes.data.data.school.schoolId === testSchoolId, 'Profile returns associated school details');
    assert(profileRes.data.data.employee.employeeName === 'Anjali R. Sharma', 'Profile returns associated employee details');

    // Edit Name in Profile
    const updateProfileRes = await request('/profile', {
      method: 'PUT',
      headers: teacherHeaders,
      body: JSON.stringify({ name: 'Anjali Sharma Verma' })
    });
    assert(updateProfileRes.status === 200, 'Profile name updated (HTTP 200)');
    assert(updateProfileRes.data.data.personal.name === 'Anjali Sharma Verma', 'User name updated in users_info');
    assert(updateProfileRes.data.data.employee.employeeName === 'Anjali Sharma Verma', 'Employee name updated in employees_info');

    // 12. Academic Years
    console.log('\n--- 12. Academic Years (GET /api/academic-years) ---');
    // Ensure at least one academic year exists for this school
    await AcademicYear.findOneAndUpdate(
      { schoolId: testSchoolId, yearName: '2025-2026' },
      { schoolId: testSchoolId, yearName: '2025-2026', isCurrent: true, status: 'Active' },
      { upsert: true, new: true }
    );

    const ayRes = await request('/academic-years', { headers: teacherHeaders });
    assert(ayRes.status === 200, 'Academic years fetched (HTTP 200)');
    assert(Array.isArray(ayRes.data.data) && ayRes.data.data.length > 0, 'Returns academic years list');
    assert(
      ayRes.data.data.every((y) => y.schoolId === testSchoolId),
      'Strict multi-school isolation: only academic years for authenticated school returned'
    );

    // 13. Notifications
    console.log('\n--- 13. Notifications (GET & PATCH /api/notifications) ---');
    // Create test notification
    const testNotification = await Notification.create({
      schoolId: testSchoolId,
      recipientUserId: teacherData.userId,
      title: 'Welcome to DMMS',
      message: 'Your teacher portal account is now active.',
      type: 'info',
      isRead: false
    });

    const notifRes = await request('/notifications', { headers: teacherHeaders });
    assert(notifRes.status === 200, 'Notifications fetched (HTTP 200)');
    assert(notifRes.data.data.unreadCount >= 1, `Unread count tracked correctly (${notifRes.data.data.unreadCount})`);

    // Mark single notification as read
    const markReadRes = await request(`/notifications/${testNotification._id}/read`, {
      method: 'PATCH',
      headers: teacherHeaders
    });
    assert(markReadRes.status === 200, 'Mark notification as read (HTTP 200)');

    // Mark all as read
    const markAllReadRes = await request('/notifications/read-all', {
      method: 'PATCH',
      headers: teacherHeaders
    });
    assert(markAllReadRes.status === 200, 'Mark all notifications as read (HTTP 200)');

    // 14. Dashboard Summary (Admin Only)
    console.log('\n--- 14. Dashboard Summary (GET /api/dashboard/summary) ---');
    const summaryRes = await request('/dashboard/summary', { headers: adminHeaders });
    assert(summaryRes.status === 200, 'Admin can fetch dashboard summary (HTTP 200)');
    assert(typeof summaryRes.data.data.totalUsers === 'number', 'Summary contains totalUsers count');
    assert(typeof summaryRes.data.data.activeUsers === 'number', 'Summary contains activeUsers count');
    assert(typeof summaryRes.data.data.inactiveUsers === 'number', 'Summary contains inactiveUsers count');
    assert(typeof summaryRes.data.data.totalAcademicYears === 'number', 'Summary contains totalAcademicYears count');

    // 15. Security & Role Authorization Tests
    console.log('\n--- 15. Security & Role-Based Access Control ---');
    // Teacher tries to access Admin user management
    const unauthorizedUserList = await request('/users', { headers: teacherHeaders });
    assert(unauthorizedUserList.status === 403, 'TEACHER blocked from Admin /api/users (HTTP 403)');

    // Teacher tries to access Admin dashboard summary
    const unauthorizedSummary = await request('/dashboard/summary', { headers: teacherHeaders });
    assert(unauthorizedSummary.status === 403, 'TEACHER blocked from Admin /api/dashboard/summary (HTTP 403)');

    // Unauthenticated request to /profile
    const unauthenticatedProfile = await request('/profile');
    assert(unauthenticatedProfile.status === 401, 'Unauthenticated request rejected with HTTP 401');

    console.log('\n============================================================');
    console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${totalTests})`);
    console.log('============================================================\n');

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

runTests();
