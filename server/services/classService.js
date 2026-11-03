const Class = require('../models/Class');
const Section = require('../models/Section');

class ClassService {
  /**
   * Get all classes for a school with search, status filter, section count, and pagination
   */
  async getClasses(schoolId, query = {}) {
    const schoolIdUpper = schoolId.toUpperCase();
    const filter = { schoolId: schoolIdUpper };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ className: searchRegex }, { classCode: searchRegex }];
    }

    if (query.status !== undefined && query.status !== '') {
      filter.isActive = query.status === 'true' || query.status === true;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const totalRecords = await Class.countDocuments(filter);

    let queryBuilder = Class.find(filter).sort({ className: 1, createdAt: 1 });
    if (limit > 0) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const rawClasses = await queryBuilder.lean();

    // Calculate actual section counts using aggregation
    const sectionCounts = await Section.aggregate([
      { $match: { schoolId: schoolIdUpper } },
      { $group: { _id: '$classId', count: { $sum: 1 }, activeCount: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ]);

    const countMap = {};
    const activeCountMap = {};
    for (const sc of sectionCounts) {
      countMap[sc._id.toString()] = sc.count;
      activeCountMap[sc._id.toString()] = sc.activeCount;
    }

    const classes = rawClasses.map((cls) => ({
      ...cls,
      sectionCount: countMap[cls._id.toString()] || 0,
      activeSectionCount: activeCountMap[cls._id.toString()] || 0
    }));

    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

    return {
      classes,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages,
        limit: limit > 0 ? limit : totalRecords
      }
    };
  }

  /**
   * Get single class by ID with section count
   */
  async getClassById(schoolId, classId) {
    const schoolIdUpper = schoolId.toUpperCase();
    const cls = await Class.findOne({
      _id: classId,
      schoolId: schoolIdUpper
    }).lean();

    if (!cls) {
      const error = new Error('Class not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const sectionCount = await Section.countDocuments({
      schoolId: schoolIdUpper,
      classId
    });

    return {
      ...cls,
      sectionCount
    };
  }

  /**
   * Create a new class
   */
  async createClass(schoolId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const className = (data.className || '').trim();
    const classCode = (data.classCode || '').trim().toUpperCase();
    const plannedSectionCount = parseInt(data.plannedSectionCount, 10) || 0;

    if (!className) {
      const error = new Error('Class name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!classCode) {
      const error = new Error('Class code is required.');
      error.statusCode = 400;
      throw error;
    }

    if (plannedSectionCount < 0) {
      const error = new Error('Planned section count must be a non-negative integer.');
      error.statusCode = 400;
      throw error;
    }

    // Check unique classCode within school
    const existingCode = await Class.findOne({
      schoolId: schoolIdUpper,
      classCode
    });
    if (existingCode) {
      const error = new Error(`Class code '${classCode}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    // Check unique className within school
    const existingName = await Class.findOne({
      schoolId: schoolIdUpper,
      className: new RegExp(`^${className}$`, 'i')
    });
    if (existingName) {
      const error = new Error(`Class '${className}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    const newClass = new Class({
      schoolId: schoolIdUpper,
      className,
      classCode,
      plannedSectionCount,
      isActive: true
    });

    await newClass.save();

    return {
      class: {
        ...newClass.toObject(),
        sectionCount: 0
      },
      message: `Class '${className}' created successfully.`
    };
  }

  /**
   * Update an existing class
   */
  async updateClass(schoolId, classId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const cls = await Class.findOne({
      _id: classId,
      schoolId: schoolIdUpper
    });

    if (!cls) {
      const error = new Error('Class not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const className = (data.className || cls.className).trim();
    const classCode = (data.classCode || cls.classCode).trim().toUpperCase();
    const plannedSectionCount =
      data.plannedSectionCount !== undefined
        ? parseInt(data.plannedSectionCount, 10) || 0
        : cls.plannedSectionCount;

    if (!className) {
      const error = new Error('Class name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!classCode) {
      const error = new Error('Class code is required.');
      error.statusCode = 400;
      throw error;
    }

    if (plannedSectionCount < 0) {
      const error = new Error('Planned section count must be a non-negative integer.');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate code
    const duplicateCode = await Class.findOne({
      _id: { $ne: classId },
      schoolId: schoolIdUpper,
      classCode
    });
    if (duplicateCode) {
      const error = new Error(`Class code '${classCode}' is already used by another class.`);
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate name
    const duplicateName = await Class.findOne({
      _id: { $ne: classId },
      schoolId: schoolIdUpper,
      className: new RegExp(`^${className}$`, 'i')
    });
    if (duplicateName) {
      const error = new Error(`Class name '${className}' is already used by another class.`);
      error.statusCode = 400;
      throw error;
    }

    cls.className = className;
    cls.classCode = classCode;
    cls.plannedSectionCount = plannedSectionCount;

    await cls.save();

    const sectionCount = await Section.countDocuments({
      schoolId: schoolIdUpper,
      classId
    });

    return {
      class: {
        ...cls.toObject(),
        sectionCount
      },
      message: `Class '${className}' updated successfully.`
    };
  }

  /**
   * Activate or Deactivate class
   */
  async updateClassStatus(schoolId, classId, isActive) {
    const schoolIdUpper = schoolId.toUpperCase();
    const cls = await Class.findOne({
      _id: classId,
      schoolId: schoolIdUpper
    });

    if (!cls) {
      const error = new Error('Class not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const targetStatus = isActive === true || isActive === 'true';

    // Prevent unsafe deactivation when active dependent sections exist
    if (!targetStatus) {
      const activeSections = await Section.countDocuments({
        schoolId: schoolIdUpper,
        classId,
        isActive: true
      });

      if (activeSections > 0) {
        const error = new Error(
          `Cannot deactivate class '${cls.className}'. There are ${activeSections} active section(s) under this class. Please deactivate the sections first.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    cls.isActive = targetStatus;
    await cls.save();

    const action = targetStatus ? 'activated' : 'deactivated';
    return {
      class: cls.toObject(),
      message: `Class '${cls.className}' has been ${action} successfully.`
    };
  }
}

module.exports = new ClassService();
