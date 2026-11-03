const Subject = require('../models/Subject');

class SubjectService {
  /**
   * Get all subjects for a school with category filter, search, status, and pagination
   */
  async getSubjects(schoolId, query = {}) {
    const schoolIdUpper = schoolId.toUpperCase();
    const filter = { schoolId: schoolIdUpper };

    if (query.subjectType && query.subjectType.trim() && query.subjectType !== 'all') {
      filter.subjectType = query.subjectType.trim().toUpperCase();
    } else if (query.category && query.category.trim() && query.category !== 'all') {
      filter.subjectType = query.category.trim().toUpperCase();
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ subjectName: searchRegex }, { subjectCode: searchRegex }];
    }

    if (query.status !== undefined && query.status !== '') {
      filter.isActive = query.status === 'true' || query.status === true;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const totalRecords = await Subject.countDocuments(filter);

    let queryBuilder = Subject.find(filter).sort({ subjectType: 1, subjectName: 1, createdAt: 1 });
    if (limit > 0) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const subjects = await queryBuilder.lean();
    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

    return {
      subjects,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages,
        limit: limit > 0 ? limit : totalRecords
      }
    };
  }

  /**
   * Get single subject by ID
   */
  async getSubjectById(schoolId, subjectId) {
    const schoolIdUpper = schoolId.toUpperCase();
    const subject = await Subject.findOne({
      _id: subjectId,
      schoolId: schoolIdUpper
    }).lean();

    if (!subject) {
      const error = new Error('Subject not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    return subject;
  }

  /**
   * Create a new subject
   */
  async createSubject(schoolId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const subjectName = (data.subjectName || '').trim();
    const subjectCode = (data.subjectCode || '').trim().toUpperCase();
    const subjectType = (data.subjectType || data.category || '').trim().toUpperCase();

    if (!subjectName) {
      const error = new Error('Subject name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!subjectCode) {
      const error = new Error('Subject code is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!subjectType) {
      const error = new Error('Subject category is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!['ACADEMIC', 'CO_CURRICULAR'].includes(subjectType)) {
      const error = new Error("Invalid subject category. Allowed values are 'ACADEMIC' or 'CO_CURRICULAR'.");
      error.statusCode = 400;
      throw error;
    }

    // Check unique subjectCode within school
    const existingCode = await Subject.findOne({
      schoolId: schoolIdUpper,
      subjectCode
    });
    if (existingCode) {
      const error = new Error(`Subject code '${subjectCode}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique subjectName within school
    const existingName = await Subject.findOne({
      schoolId: schoolIdUpper,
      subjectName: new RegExp(`^${subjectName}$`, 'i')
    });
    if (existingName) {
      const error = new Error(`Subject '${subjectName}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    const newSubject = new Subject({
      schoolId: schoolIdUpper,
      subjectName,
      subjectCode,
      subjectType,
      isActive: true
    });

    await newSubject.save();

    return {
      subject: newSubject.toObject(),
      message: `Subject '${subjectName}' (${subjectType === 'ACADEMIC' ? 'Academic' : 'Co-Curricular'}) created successfully.`
    };
  }

  /**
   * Update an existing subject
   */
  async updateSubject(schoolId, subjectId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const subject = await Subject.findOne({
      _id: subjectId,
      schoolId: schoolIdUpper
    });

    if (!subject) {
      const error = new Error('Subject not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const subjectName = (data.subjectName || subject.subjectName).trim();
    const subjectCode = (data.subjectCode || subject.subjectCode).trim().toUpperCase();
    const subjectType = (data.subjectType || data.category || subject.subjectType).trim().toUpperCase();

    if (!subjectName) {
      const error = new Error('Subject name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    if (!subjectCode) {
      const error = new Error('Subject code cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    if (!['ACADEMIC', 'CO_CURRICULAR'].includes(subjectType)) {
      const error = new Error("Invalid subject category. Allowed values are 'ACADEMIC' or 'CO_CURRICULAR'.");
      error.statusCode = 400;
      throw error;
    }

    // Check unique code excluding this subject
    const duplicateCode = await Subject.findOne({
      _id: { $ne: subjectId },
      schoolId: schoolIdUpper,
      subjectCode
    });
    if (duplicateCode) {
      const error = new Error(`Subject code '${subjectCode}' is already used by another subject.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique name excluding this subject
    const duplicateName = await Subject.findOne({
      _id: { $ne: subjectId },
      schoolId: schoolIdUpper,
      subjectName: new RegExp(`^${subjectName}$`, 'i')
    });
    if (duplicateName) {
      const error = new Error(`Subject name '${subjectName}' is already used by another subject.`);
      error.statusCode = 400;
      throw error;
    }

    subject.subjectName = subjectName;
    subject.subjectCode = subjectCode;
    subject.subjectType = subjectType;

    await subject.save();

    return {
      subject: subject.toObject(),
      message: `Subject '${subjectName}' updated successfully.`
    };
  }

  /**
   * Activate or Deactivate subject
   */
  async updateSubjectStatus(schoolId, subjectId, isActive) {
    const schoolIdUpper = schoolId.toUpperCase();
    const subject = await Subject.findOne({
      _id: subjectId,
      schoolId: schoolIdUpper
    });

    if (!subject) {
      const error = new Error('Subject not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const targetStatus = isActive === true || isActive === 'true';
    subject.isActive = targetStatus;
    await subject.save();

    const action = targetStatus ? 'activated' : 'deactivated';
    return {
      subject: subject.toObject(),
      message: `Subject '${subject.subjectName}' has been ${action} successfully.`
    };
  }
}

module.exports = new SubjectService();
