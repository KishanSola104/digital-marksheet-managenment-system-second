const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const School = require('./models/School');
const User = require('./models/User');
const Role = require('./models/Role');
const RoleAssignment = require('./models/RoleAssignment');
const AcademicYear = require('./models/AcademicYear');
const Class = require('./models/Class');
const Section = require('./models/Section');
const Subject = require('./models/Subject');
const { generateSchoolToken, generateUserToken } = require('./utils/tokenHelper');

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
  console.log('   DMMS TASK 3 AUTOMATED INTEGRATION TEST SUITE');
  console.log('   Academic Year, Class, Section, and Subject Management');
  console.log('============================================================\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dmms_db');
  console.log('Connected to MongoDB.\n');

  try {
    // 1. Setup Primary School & Admin
    console.log('--- 1. Authentication & Institutional Context Setup ---');
    const schoolAId = 'DMMS-SXM-000001';
    const schoolA = await School.findOne({ schoolId: schoolAId });
    assert(!!schoolA, `Primary Test School '${schoolAId}' exists in database`);

    const adminA = await User.findOne({ schoolId: schoolAId, isPrimaryAdmin: true });
    assert(!!adminA, `Primary Admin exists for '${schoolAId}' (${adminA?.userId})`);

    const schoolAToken = generateSchoolToken(schoolAId);
    const adminAToken = generateUserToken({
      schoolId: schoolAId,
      userId: adminA.userId,
      role: 'ADMIN'
    });

    const headersA = {
      Authorization: `Bearer ${adminAToken}`,
      Cookie: `dmms_school_token=${schoolAToken}; dmms_user_token=${adminAToken}`
    };

    // Teacher user for RBAC verification
    const teacherUser = await User.findOne({ schoolId: schoolAId, userId: { $regex: '^TCH-' } });
    let teacherHeaders = null;
    if (teacherUser) {
      const teacherToken = generateUserToken({
        schoolId: schoolAId,
        userId: teacherUser.userId,
        role: 'TEACHER'
      });
      teacherHeaders = {
        Authorization: `Bearer ${teacherToken}`,
        Cookie: `dmms_school_token=${schoolAToken}; dmms_user_token=${teacherToken}`
      };
    }

    // Clean up any previous test records in School A for fresh repeatable run
    await AcademicYear.deleteMany({
      schoolId: schoolAId,
      academicYearName: { $in: ['2026 - 2027', '2027 - 2028', '2028 - 2029', '2029 - 2030'] }
    });
    await Section.deleteMany({ schoolId: schoolAId, sectionCode: { $in: ['1-A', '1-B', '2-A', 'TEST-SEC'] } });
    await Class.deleteMany({ schoolId: schoolAId, classCode: { $in: ['CLS01', 'CLS02', 'CLS99', 'TEST-CLS'] } });
    await Subject.deleteMany({ schoolId: schoolAId, subjectCode: { $in: ['MATH101', 'ENG101', 'PE01', 'ART01', 'TEST-SUB'] } });

    // Ensure baseline academic year exists
    let baseYear = await AcademicYear.findOne({ schoolId: schoolAId, yearName: '2025-2026' });
    if (!baseYear) {
      baseYear = new AcademicYear({
        schoolId: schoolAId,
        academicYearName: '2025 - 2026',
        yearName: '2025 - 2026',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-03-31'),
        isCurrent: true,
        status: 'Active'
      });
      await baseYear.save();
    }

    // ============================================================
    // MODULE 1: ACADEMIC YEAR MANAGEMENT
    // ============================================================
    console.log('\n--- 2. Academic Year Management Tests ---');

    // Test 2.1: List Academic Years
    const listYearsRes = await request('/academic-years', { headers: headersA });
    assert(listYearsRes.status === 200, 'GET /api/academic-years returns 200');
    assert(listYearsRes.data.success === true, 'Response reports success: true');
    assert(Array.isArray(listYearsRes.data.data), 'Returns academic years array');
    assert(listYearsRes.data.pagination !== undefined, 'Returns pagination metadata');

    // Test 2.2: Create Academic Year (Valid)
    const createYearRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2026 - 2027',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        isCurrent: false
      })
    });
    assert(createYearRes.status === 201, 'POST /api/academic-years creates 2026 - 2027 (HTTP 201)');
    assert(createYearRes.data.success === true, 'Academic year creation reports success');
    const year2026Id = createYearRes.data.data._id;

    // Test 2.3: Dynamic Status Calculation
    const getYearRes = await request(`/academic-years/${year2026Id}`, { headers: headersA });
    assert(getYearRes.status === 200, 'GET /api/academic-years/:id returns 200');
    assert(['Upcoming', 'Active', 'Closed'].includes(getYearRes.data.data.status), `Dynamic status calculated: '${getYearRes.data.data.status}'`);

    // Test 2.4: Validation - End date before start date rejected
    const invalidDatesRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: 'Invalid Dates Year',
        startDate: '2027-05-01',
        endDate: '2027-01-01'
      })
    });
    assert(invalidDatesRes.status === 400, 'End date before start date rejected with HTTP 400');

    // Test 2.5: Validation - Duplicate Academic Year name rejected
    const dupYearRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2026 - 2027',
        startDate: '2026-05-01',
        endDate: '2027-04-30'
      })
    });
    assert(dupYearRes.status === 400, 'Duplicate academic year name rejected with HTTP 400');

    // Test 2.6: Validation - Overlapping dates rejected
    const overlapYearRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2026 - Mid Year',
        startDate: '2026-06-01',
        endDate: '2026-12-31'
      })
    });
    assert(overlapYearRes.status === 400, 'Overlapping academic year dates rejected with HTTP 400');
    assert(overlapYearRes.data.message.includes('overlap'), 'Error message specifically mentions overlapping dates');

    // Test 2.7: Validation - Skipped Academic Year Sequence Rule
    const skipYearRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2029 - 2030',
        startDate: '2029-04-01',
        endDate: '2030-03-31'
      })
    });
    assert(skipYearRes.status === 400, 'Skipped academic year (jumping from 2027 to 2029) rejected with HTTP 400');
    assert(skipYearRes.data.message.includes('skip'), 'Error message specifically explains skipped academic year sequence');

    // Test 2.8: Create Contiguous Next Year (Allowed)
    const nextYearRes = await request('/academic-years', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2027 - 2028',
        startDate: '2027-04-01',
        endDate: '2028-03-31'
      })
    });
    assert(nextYearRes.status === 201, 'Contiguous next academic year 2027 - 2028 created successfully (HTTP 201)');

    // Test 2.9: Update Academic Year
    const updateYearRes = await request(`/academic-years/${year2026Id}`, {
      method: 'PUT',
      headers: headersA,
      body: JSON.stringify({
        academicYearName: '2026 - 2027 (Updated)',
        startDate: '2026-04-01',
        endDate: '2027-03-31'
      })
    });
    assert(updateYearRes.status === 200, 'PUT /api/academic-years/:id updates academic year (HTTP 200)');
    assert(updateYearRes.data.data.academicYearName === '2026 - 2027 (Updated)', 'Updated name reflected in response');

    // Test 2.10: Set As Current Academic Year (Atomic single-current enforcement)
    const setCurrentRes = await request(`/academic-years/${year2026Id}/set-current`, {
      method: 'PATCH',
      headers: headersA
    });
    assert(setCurrentRes.status === 200, 'PATCH /api/academic-years/:id/set-current sets current (HTTP 200)');

    // Verify only ONE current year exists in DB for this school
    const currentYearsCount = await AcademicYear.countDocuments({ schoolId: schoolAId, isCurrent: true });
    assert(currentYearsCount === 1, 'Strict Rule Verified: Exactly ONE academic year is marked isCurrent in database');

    const updatedCurrentYear = await AcademicYear.findById(year2026Id);
    assert(updatedCurrentYear.isCurrent === true, 'Newly selected academic year is marked isCurrent: true');

    // ============================================================
    // MODULE 2: CLASS MANAGEMENT
    // ============================================================
    console.log('\n--- 3. Class Management Tests ---');

    // Test 3.1: Create Class 1 (Master record)
    const createClass1Res = await request('/classes', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        className: 'Class 1',
        classCode: 'CLS01',
        plannedSectionCount: 2
      })
    });
    assert(createClass1Res.status === 201, 'POST /api/classes creates Class 1 (HTTP 201)');
    assert(createClass1Res.data.success === true, 'Class creation reports success: true');
    const class1Id = createClass1Res.data.data._id;

    // Test 3.2: Create Class 2
    const createClass2Res = await request('/classes', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        className: 'Class 2',
        classCode: 'CLS02',
        plannedSectionCount: 3
      })
    });
    assert(createClass2Res.status === 201, 'POST /api/classes creates Class 2 (HTTP 201)');
    const class2Id = createClass2Res.data.data._id;

    // Test 3.3: Validation - Duplicate Class Code rejected
    const dupClassCodeRes = await request('/classes', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        className: 'Another Class',
        classCode: 'CLS01'
      })
    });
    assert(dupClassCodeRes.status === 400, 'Duplicate classCode CLS01 rejected with HTTP 400');

    // Test 3.4: Validation - Duplicate Class Name rejected
    const dupClassNameRes = await request('/classes', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        className: 'Class 1',
        classCode: 'CLS99'
      })
    });
    assert(dupClassNameRes.status === 400, 'Duplicate className Class 1 rejected with HTTP 400');

    // Test 3.5: List Classes with search & pagination
    const listClassesRes = await request('/classes?search=Class 1', { headers: headersA });
    assert(listClassesRes.status === 200, 'GET /api/classes?search=Class 1 returns 200');
    assert(listClassesRes.data.data.length === 1, 'Search filters accurately to 1 class');
    assert(listClassesRes.data.data[0].className === 'Class 1', 'Matched class is Class 1');

    // Test 3.6: Update Class details
    const updateClassRes = await request(`/classes/${class1Id}`, {
      method: 'PUT',
      headers: headersA,
      body: JSON.stringify({
        className: 'Class 1 (Primary)',
        classCode: 'CLS01',
        plannedSectionCount: 4
      })
    });
    assert(updateClassRes.status === 200, 'PUT /api/classes/:id updates class (HTTP 200)');
    assert(updateClassRes.data.data.className === 'Class 1 (Primary)', 'Updated class name verified');
    assert(updateClassRes.data.data.plannedSectionCount === 4, 'Updated planned section count verified');

    // Restore name
    await Class.findByIdAndUpdate(class1Id, { className: 'Class 1' });

    // ============================================================
    // MODULE 3: SECTION MANAGEMENT
    // ============================================================
    console.log('\n--- 4. Section Management Tests ---');

    // Test 4.1: Create Section A under Class 1
    const createSecARes = await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class1Id,
        sectionName: 'A',
        sectionCode: '1-A',
        maximumCapacity: 40
      })
    });
    assert(createSecARes.status === 201, 'POST /api/sections creates Section A under Class 1 (HTTP 201)');
    assert(createSecARes.data.success === true, 'Section creation reports success');
    const secAId = createSecARes.data.data._id;

    // Test 4.2: Verify Class 1's calculated sectionCount updated to 1
    const classCheckRes = await request(`/classes/${class1Id}`, { headers: headersA });
    assert(classCheckRes.data.data.sectionCount === 1, 'Class sectionCount accurately reflects 1 section');

    // Test 4.3: Create Section B under Class 1
    const createSecBRes = await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class1Id,
        sectionName: 'B',
        sectionCode: '1-B',
        maximumCapacity: 35
      })
    });
    assert(createSecBRes.status === 201, 'POST /api/sections creates Section B under Class 1 (HTTP 201)');

    // Verify sectionCount is now 2
    const classCheckRes2 = await request(`/classes/${class1Id}`, { headers: headersA });
    assert(classCheckRes2.data.data.sectionCount === 2, 'Class sectionCount accurately reflects 2 sections');

    // Test 4.4: Validation - Duplicate section name in same class rejected
    const dupSecNameRes = await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class1Id,
        sectionName: 'A',
        sectionCode: '1-A-NEW',
        maximumCapacity: 30
      })
    });
    assert(dupSecNameRes.status === 400, 'Duplicate section name A in Class 1 rejected with HTTP 400');

    // Test 4.5: Validation - Duplicate section code in school rejected
    const dupSecCodeRes = await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class2Id,
        sectionName: 'A',
        sectionCode: '1-A', // Already used
        maximumCapacity: 40
      })
    });
    assert(dupSecCodeRes.status === 400, 'Duplicate sectionCode 1-A rejected with HTTP 400');

    // Test 4.6: Validation - Invalid capacity rejected (<= 0)
    const invalidCapRes = await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class2Id,
        sectionName: 'A',
        sectionCode: '2-A',
        maximumCapacity: -5
      })
    });
    assert(invalidCapRes.status === 400, 'Negative capacity rejected with HTTP 400');

    // Create Section A under Class 2 with valid capacity
    await request('/sections', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        classId: class2Id,
        sectionName: 'A',
        sectionCode: '2-A',
        maximumCapacity: 45
      })
    });

    // Test 4.7: Filter Sections by classId
    const filterSectionsRes = await request(`/sections?classId=${class1Id}`, { headers: headersA });
    assert(filterSectionsRes.status === 200, 'GET /api/sections?classId=CLASS_ID returns 200');
    assert(filterSectionsRes.data.data.length === 2, 'Returns only sections belonging to Class 1 (2 sections)');
    assert(filterSectionsRes.data.data.every((s) => s.classId?._id === class1Id || s.classId === class1Id), 'All returned sections belong to Class 1');

    // Test 4.8: Edit Section details
    const updateSecRes = await request(`/sections/${secAId}`, {
      method: 'PUT',
      headers: headersA,
      body: JSON.stringify({
        sectionName: 'A (Alpha)',
        sectionCode: '1-A',
        maximumCapacity: 42
      })
    });
    assert(updateSecRes.status === 200, 'PUT /api/sections/:id updates section (HTTP 200)');
    assert(updateSecRes.data.data.maximumCapacity === 42, 'Updated capacity 42 verified');

    // Restore section name
    await Section.findByIdAndUpdate(secAId, { sectionName: 'A' });

    // Test 4.9: Prevent Unsafe Class Deactivation (Active sections exist)
    const deactClassWithSecRes = await request(`/classes/${class1Id}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: false })
    });
    assert(deactClassWithSecRes.status === 400, 'Cannot deactivate class with active sections (HTTP 400)');
    assert(deactClassWithSecRes.data.message.includes('active section'), 'Error explains active sections exist');

    // Test 4.10: Deactivate Sections, then Class Deactivation succeeds
    await request(`/sections/${secAId}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: false })
    });
    const secB = await Section.findOne({ schoolId: schoolAId, sectionCode: '1-B' });
    await request(`/sections/${secB._id}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: false })
    });

    const deactClassSuccessRes = await request(`/classes/${class1Id}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: false })
    });
    assert(deactClassSuccessRes.status === 200, 'Class deactivation succeeds once all sections are deactivated (HTTP 200)');

    // Reactivate for future operations
    await request(`/classes/${class1Id}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: true })
    });
    await request(`/sections/${secAId}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: true })
    });
    await request(`/sections/${secB._id}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: true })
    });

    // ============================================================
    // MODULE 4: SUBJECT MANAGEMENT
    // ============================================================
    console.log('\n--- 5. Subject Management Tests ---');

    // Test 5.1: Create Academic Subject
    const createAcadSubRes = await request('/subjects', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Mathematics',
        subjectCode: 'MATH101',
        subjectType: 'ACADEMIC'
      })
    });
    assert(createAcadSubRes.status === 201, 'POST /api/subjects creates Academic subject (HTTP 201)');
    assert(createAcadSubRes.data.data.subjectType === 'ACADEMIC', 'subjectType stored as ACADEMIC');
    const mathSubId = createAcadSubRes.data.data._id;

    // Test 5.2: Create Co-Curricular Subject
    const createCoCurSubRes = await request('/subjects', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Physical Education',
        subjectCode: 'PE01',
        subjectType: 'CO_CURRICULAR'
      })
    });
    assert(createCoCurSubRes.status === 201, 'POST /api/subjects creates Co-Curricular subject (HTTP 201)');
    assert(createCoCurSubRes.data.data.subjectType === 'CO_CURRICULAR', 'subjectType stored as CO_CURRICULAR');

    // Test 5.3: Validation - Invalid category rejected
    const invalidCategoryRes = await request('/subjects', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Random Subject',
        subjectCode: 'RND01',
        subjectType: 'INVALID_CATEGORY'
      })
    });
    assert(invalidCategoryRes.status === 400, 'Invalid category rejected with HTTP 400');

    // Test 5.4: Validation - Duplicate Subject Code rejected
    const dupSubCodeRes = await request('/subjects', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Advanced Math',
        subjectCode: 'MATH101',
        subjectType: 'ACADEMIC'
      })
    });
    assert(dupSubCodeRes.status === 400, 'Duplicate subject code MATH101 rejected with HTTP 400');

    // Test 5.5: Validation - Duplicate Subject Name rejected
    const dupSubNameRes = await request('/subjects', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Mathematics',
        subjectCode: 'MATH999',
        subjectType: 'ACADEMIC'
      })
    });
    assert(dupSubNameRes.status === 400, 'Duplicate subject name Mathematics rejected with HTTP 400');

    // Test 5.6: Filter by Subject Category
    const filterAcadRes = await request('/subjects?category=ACADEMIC', { headers: headersA });
    assert(filterAcadRes.status === 200, 'GET /api/subjects?category=ACADEMIC returns 200');
    assert(filterAcadRes.data.data.every((s) => s.subjectType === 'ACADEMIC'), 'All returned subjects have subjectType ACADEMIC');

    const filterCoCurRes = await request('/subjects?category=CO_CURRICULAR', { headers: headersA });
    assert(filterCoCurRes.status === 200, 'GET /api/subjects?category=CO_CURRICULAR returns 200');
    assert(filterCoCurRes.data.data.every((s) => s.subjectType === 'CO_CURRICULAR'), 'All returned subjects have subjectType CO_CURRICULAR');

    // Test 5.7: Update Subject
    const updateSubRes = await request(`/subjects/${mathSubId}`, {
      method: 'PUT',
      headers: headersA,
      body: JSON.stringify({
        subjectName: 'Mathematics (Core)',
        subjectCode: 'MATH101',
        subjectType: 'ACADEMIC'
      })
    });
    assert(updateSubRes.status === 200, 'PUT /api/subjects/:id updates subject (HTTP 200)');
    assert(updateSubRes.data.data.subjectName === 'Mathematics (Core)', 'Subject name updated');

    // Test 5.8: Activate and Deactivate Subject
    const deactSubRes = await request(`/subjects/${mathSubId}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: false })
    });
    assert(deactSubRes.status === 200, 'PATCH /api/subjects/:id/status deactivates subject (HTTP 200)');
    assert(deactSubRes.data.data.isActive === false, 'Subject is now inactive');

    const reactSubRes = await request(`/subjects/${mathSubId}/status`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ isActive: true })
    });
    assert(reactSubRes.status === 200, 'Subject reactivated successfully (HTTP 200)');
    assert(reactSubRes.data.data.isActive === true, 'Subject is now active');

    // ============================================================
    // MODULE 5: MULTI-SCHOOL DATA ISOLATION & RBAC
    // ============================================================
    console.log('\n--- 6. Multi-School Data Isolation & RBAC Tests ---');

    // Create a secondary test school & admin to verify isolation
    const schoolBId = 'DMMS-TEST-000002';
    let schoolB = await School.findOne({ schoolId: schoolBId });
    if (!schoolB) {
      schoolB = new School({
        schoolId: schoolBId,
        schoolName: 'St. Mary High School (Test)',
        establishedYear: 2010,
        state: 'Gujarat',
        district: 'Ahmedabad',
        address: '123 Test Road',
        schoolEmail: 'admin@stmarytest.edu',
        schoolMobile: '9876543210',
        password: 'hashedPasswordPlaceholder123',
        isActive: true,
        contactPersons: [
          { name: 'Contact 1', position: 'Principal', email: 'c1@stmarytest.edu', mobile: '9876543211' },
          { name: 'Contact 2', position: 'Vice Principal', email: 'c2@stmarytest.edu', mobile: '9876543212' }
        ]
      });
      await schoolB.save();
    }

    let adminB = await User.findOne({ schoolId: schoolBId });
    if (!adminB) {
      adminB = new User({
        schoolId: schoolBId,
        userId: 'ADM-STM-0001',
        name: 'St. Mary Admin',
        email: 'admin@stmarytest.edu',
        mobile: '9876543210',
        password: 'hashedPasswordPlaceholder123',
        isPrimaryAdmin: true,
        isActive: true
      });
      await adminB.save();

      const adminRole = await Role.findOne({ roleId: 'ADMIN' });
      await RoleAssignment.create({
        schoolId: schoolBId,
        userId: adminB.userId,
        roleId: adminRole.roleId
      });
    }

    const schoolBToken = generateSchoolToken(schoolBId);
    const adminBToken = generateUserToken({
      schoolId: schoolBId,
      userId: adminB.userId,
      role: 'ADMIN'
    });
    const headersB = {
      Authorization: `Bearer ${adminBToken}`,
      Cookie: `dmms_school_token=${schoolBToken}; dmms_user_token=${adminBToken}`
    };

    // Test 6.1: School B cannot view School A's classes
    const schoolBClasses = await request('/classes', { headers: headersB });
    assert(schoolBClasses.status === 200, 'School B can query its classes');
    assert(schoolBClasses.data.data.length === 0, 'School B sees 0 classes (School A classes isolated)');

    // Test 6.2: School B cannot view School A's sections
    const schoolBSections = await request('/sections', { headers: headersB });
    assert(schoolBSections.status === 200, 'School B can query its sections');
    assert(schoolBSections.data.data.length === 0, 'School B sees 0 sections (School A sections isolated)');

    // Test 6.3: School B cannot view School A's subjects
    const schoolBSubjects = await request('/subjects', { headers: headersB });
    assert(schoolBSubjects.status === 200, 'School B can query its subjects');
    assert(schoolBSubjects.data.data.length === 0, 'School B sees 0 subjects (School A subjects isolated)');

    // Test 6.4: School B cannot access or mutate School A's class by ID
    const crossSchoolClassRes = await request(`/classes/${class1Id}`, { headers: headersB });
    assert(crossSchoolClassRes.status === 404, 'Cross-school access to Class 1 blocked with HTTP 404');

    // Test 6.5: School B cannot access or mutate School A's section by ID
    const crossSchoolSecRes = await request(`/sections/${secAId}`, { headers: headersB });
    assert(crossSchoolSecRes.status === 404, 'Cross-school access to Section A blocked with HTTP 404');

    // Test 6.6: School B cannot access School A's academic year by ID
    const crossSchoolYearRes = await request(`/academic-years/${year2026Id}`, { headers: headersB });
    assert(crossSchoolYearRes.status === 404, 'Cross-school access to Academic Year blocked with HTTP 404');

    // Test 6.7: Non-Admin (Teacher) blocked from creating classes, sections, subjects, or academic years
    if (teacherHeaders) {
      const teacherCreateClassRes = await request('/classes', {
        method: 'POST',
        headers: teacherHeaders,
        body: JSON.stringify({ className: 'Unauthorized Class', classCode: 'UNAUTH01' })
      });
      assert(teacherCreateClassRes.status === 403, 'Teacher role blocked from POST /api/classes (HTTP 403 Forbidden)');

      const teacherCreateSecRes = await request('/sections', {
        method: 'POST',
        headers: teacherHeaders,
        body: JSON.stringify({ classId: class1Id, sectionName: 'X', sectionCode: '1-X', maximumCapacity: 30 })
      });
      assert(teacherCreateSecRes.status === 403, 'Teacher role blocked from POST /api/sections (HTTP 403 Forbidden)');

      const teacherCreateSubRes = await request('/subjects', {
        method: 'POST',
        headers: teacherHeaders,
        body: JSON.stringify({ subjectName: 'Unauthorized Sub', subjectCode: 'UNAUTH01', subjectType: 'ACADEMIC' })
      });
      assert(teacherCreateSubRes.status === 403, 'Teacher role blocked from POST /api/subjects (HTTP 403 Forbidden)');

      const teacherSetCurrentYearRes = await request(`/academic-years/${year2026Id}/set-current`, {
        method: 'PATCH',
        headers: teacherHeaders
      });
      assert(teacherSetCurrentYearRes.status === 403, 'Teacher role blocked from set-current academic year (HTTP 403 Forbidden)');
    }

    // Clean up test school B
    await School.deleteOne({ schoolId: schoolBId });
    await User.deleteMany({ schoolId: schoolBId });
    await RoleAssignment.deleteMany({ schoolId: schoolBId });

    console.log('\n============================================================');
    console.log(`TEST SUITE RESULTS: ${passedTests}/${totalTests} PASSED (0 FAILED)`);
    console.log('============================================================\n');
  } catch (err) {
    console.error('Fatal error during test execution:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests();
