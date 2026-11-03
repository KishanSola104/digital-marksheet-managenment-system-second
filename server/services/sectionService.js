const Section = require('../models/Section');
const Class = require('../models/Class');

class SectionService {
  /**
   * Get all sections for a school with class filter, search, status, and pagination
   */
  async getSections(schoolId, query = {}) {
    const schoolIdUpper = schoolId.toUpperCase();
    const filter = { schoolId: schoolIdUpper };

    if (query.classId && query.classId.trim() && query.classId !== 'all') {
      filter.classId = query.classId.trim();
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ sectionName: searchRegex }, { sectionCode: searchRegex }];
    }

    if (query.status !== undefined && query.status !== '') {
      filter.isActive = query.status === 'true' || query.status === true;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const totalRecords = await Section.countDocuments(filter);

    let queryBuilder = Section.find(filter)
      .populate('classId', 'className classCode isActive')
      .sort({ classId: 1, sectionName: 1, createdAt: 1 });

    if (limit > 0) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const rawSections = await queryBuilder.lean();

    const sections = rawSections.map((sec) => ({
      ...sec,
      className: sec.classId?.className || 'N/A',
      classCode: sec.classId?.classCode || 'N/A'
    }));

    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

    return {
      sections,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages,
        limit: limit > 0 ? limit : totalRecords
      }
    };
  }

  /**
   * Get single section by ID
   */
  async getSectionById(schoolId, sectionId) {
    const schoolIdUpper = schoolId.toUpperCase();
    const section = await Section.findOne({
      _id: sectionId,
      schoolId: schoolIdUpper
    })
      .populate('classId', 'className classCode isActive')
      .lean();

    if (!section) {
      const error = new Error('Section not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...section,
      className: section.classId?.className || 'N/A',
      classCode: section.classId?.classCode || 'N/A'
    };
  }

  /**
   * Create a new section
   */
  async createSection(schoolId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const classId = data.classId;
    const sectionName = (data.sectionName || '').trim();
    const sectionCode = (data.sectionCode || '').trim().toUpperCase();
    const maximumCapacity = parseInt(data.maximumCapacity, 10);

    if (!classId) {
      const error = new Error('Parent Class is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!sectionName) {
      const error = new Error('Section name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!sectionCode) {
      const error = new Error('Section code is required.');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(maximumCapacity) || maximumCapacity < 1) {
      const error = new Error('Maximum capacity must be a positive integer (at least 1).');
      error.statusCode = 400;
      throw error;
    }

    // Validate that parent class belongs to this school
    const parentClass = await Class.findOne({
      _id: classId,
      schoolId: schoolIdUpper
    });

    if (!parentClass) {
      const error = new Error('Referenced Class not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    // Validate that parent class is active
    if (!parentClass.isActive) {
      const error = new Error(`Cannot add sections to an inactive class ('${parentClass.className}'). Please activate the class first.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique sectionCode within school
    const existingCode = await Section.findOne({
      schoolId: schoolIdUpper,
      sectionCode
    });
    if (existingCode) {
      const error = new Error(`Section code '${sectionCode}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique sectionName within the same class
    const existingNameInClass = await Section.findOne({
      schoolId: schoolIdUpper,
      classId,
      sectionName: new RegExp(`^${sectionName}$`, 'i')
    });
    if (existingNameInClass) {
      const error = new Error(`Section '${sectionName}' already exists under class '${parentClass.className}'.`);
      error.statusCode = 400;
      throw error;
    }

    const newSection = new Section({
      schoolId: schoolIdUpper,
      classId,
      sectionName,
      sectionCode,
      maximumCapacity,
      isActive: true
    });

    await newSection.save();

    return {
      section: {
        ...newSection.toObject(),
        className: parentClass.className,
        classCode: parentClass.classCode
      },
      message: `Section '${sectionName}' for class '${parentClass.className}' created successfully.`
    };
  }

  /**
   * Update an existing section
   */
  async updateSection(schoolId, sectionId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const section = await Section.findOne({
      _id: sectionId,
      schoolId: schoolIdUpper
    });

    if (!section) {
      const error = new Error('Section not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const sectionName = (data.sectionName || section.sectionName).trim();
    const sectionCode = (data.sectionCode || section.sectionCode).trim().toUpperCase();
    const maximumCapacity =
      data.maximumCapacity !== undefined
        ? parseInt(data.maximumCapacity, 10)
        : section.maximumCapacity;

    if (!sectionName) {
      const error = new Error('Section name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    if (!sectionCode) {
      const error = new Error('Section code cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(maximumCapacity) || maximumCapacity < 1) {
      const error = new Error('Maximum capacity must be a positive integer (at least 1).');
      error.statusCode = 400;
      throw error;
    }

    // Check unique code excluding this section
    const duplicateCode = await Section.findOne({
      _id: { $ne: sectionId },
      schoolId: schoolIdUpper,
      sectionCode
    });
    if (duplicateCode) {
      const error = new Error(`Section code '${sectionCode}' is already used by another section.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique name in class excluding this section
    const duplicateName = await Section.findOne({
      _id: { $ne: sectionId },
      schoolId: schoolIdUpper,
      classId: section.classId,
      sectionName: new RegExp(`^${sectionName}$`, 'i')
    });
    if (duplicateName) {
      const error = new Error(`Section name '${sectionName}' already exists under this class.`);
      error.statusCode = 400;
      throw error;
    }

    section.sectionName = sectionName;
    section.sectionCode = sectionCode;
    section.maximumCapacity = maximumCapacity;

    await section.save();

    const parentClass = await Class.findById(section.classId).lean();

    return {
      section: {
        ...section.toObject(),
        className: parentClass?.className || 'N/A',
        classCode: parentClass?.classCode || 'N/A'
      },
      message: `Section '${sectionName}' updated successfully.`
    };
  }

  /**
   * Activate or Deactivate section
   */
  async updateSectionStatus(schoolId, sectionId, isActive) {
    const schoolIdUpper = schoolId.toUpperCase();
    const section = await Section.findOne({
      _id: sectionId,
      schoolId: schoolIdUpper
    });

    if (!section) {
      const error = new Error('Section not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const targetStatus = isActive === true || isActive === 'true';

    // If activating, verify that parent class is active
    if (targetStatus) {
      const parentClass = await Class.findOne({
        _id: section.classId,
        schoolId: schoolIdUpper
      });
      if (parentClass && !parentClass.isActive) {
        const error = new Error(`Cannot activate section under inactive class '${parentClass.className}'. Activate the class first.`);
        error.statusCode = 400;
        throw error;
      }
    }

    section.isActive = targetStatus;
    await section.save();

    const action = targetStatus ? 'activated' : 'deactivated';
    return {
      section: section.toObject(),
      message: `Section '${section.sectionName}' has been ${action} successfully.`
    };
  }
}

module.exports = new SectionService();
