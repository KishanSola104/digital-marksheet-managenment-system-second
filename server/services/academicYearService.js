const AcademicYear = require('../models/AcademicYear');

class AcademicYearService {
  /**
   * Helper to calculate dynamic status from dates
   */
  calculateStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'Active';
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
      return 'Upcoming';
    } else if (now > end) {
      return 'Closed';
    } else {
      return 'Active';
    }
  }

  /**
   * Get all academic years belonging to the authenticated school
   * Supports search, status filter, and pagination
   */
  async getAcademicYears(schoolId, query = {}) {
    const filter = { schoolId: schoolId.toUpperCase() };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { academicYearName: searchRegex },
        { yearName: searchRegex }
      ];
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 0; // 0 = no pagination limit
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const totalRecords = await AcademicYear.countDocuments(filter);

    let queryBuilder = AcademicYear.find(filter).sort({ startDate: -1, createdAt: -1 });

    if (limit > 0) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const rawYears = await queryBuilder.lean();

    // Map through and ensure dynamic status & both name properties
    const academicYears = rawYears.map((y) => {
      const dynamicStatus = this.calculateStatus(y.startDate, y.endDate);
      return {
        ...y,
        academicYearName: y.academicYearName || y.yearName,
        yearName: y.yearName || y.academicYearName,
        status: dynamicStatus
      };
    });

    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

    return {
      academicYears,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages,
        limit: limit > 0 ? limit : totalRecords
      }
    };
  }

  /**
   * Get single academic year by ID
   */
  async getAcademicYearById(schoolId, academicYearId) {
    const year = await AcademicYear.findOne({
      _id: academicYearId,
      schoolId: schoolId.toUpperCase()
    }).lean();

    if (!year) {
      const error = new Error('Academic year not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    year.academicYearName = year.academicYearName || year.yearName;
    year.yearName = year.yearName || year.academicYearName;
    year.status = this.calculateStatus(year.startDate, year.endDate);

    return year;
  }

  /**
   * Create a new academic year
   */
  async createAcademicYear(schoolId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const name = (data.academicYearName || data.yearName || '').trim();
    if (!name) {
      const error = new Error('Academic year name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!data.startDate || !data.endDate) {
      const error = new Error('Both start date and end date are required.');
      error.statusCode = 400;
      throw error;
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const error = new Error('Invalid start date or end date format.');
      error.statusCode = 400;
      throw error;
    }

    if (end <= start) {
      const error = new Error('End date must be after start date.');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate name within school
    const existingName = await AcademicYear.findOne({
      schoolId: schoolIdUpper,
      $or: [{ academicYearName: name }, { yearName: name }]
    });

    if (existingName) {
      const error = new Error(`Academic year '${name}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    // Retrieve all existing academic years of this school for overlap and sequence validation
    const existingYears = await AcademicYear.find({ schoolId: schoolIdUpper }).sort({ startDate: 1 });

    // Validate non-overlapping dates
    for (const yr of existingYears) {
      if (yr.startDate && yr.endDate) {
        const yrStart = new Date(yr.startDate);
        const yrEnd = new Date(yr.endDate);
        if (start <= yrEnd && end >= yrStart) {
          const formattedYrStart = yrStart.toLocaleDateString('en-GB');
          const formattedYrEnd = yrEnd.toLocaleDateString('en-GB');
          const error = new Error(
            `Academic year dates overlap with existing academic year '${yr.academicYearName || yr.yearName}' (${formattedYrStart} to ${formattedYrEnd}).`
          );
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // Validate chronological sequence (prevent skipping academic years)
    if (existingYears.length > 0) {
      const latestYear = existingYears[existingYears.length - 1];
      if (latestYear.endDate) {
        const latestEnd = new Date(latestYear.endDate);
        // If creating a future academic year after the latest year
        if (start > latestEnd) {
          const startYear = start.getFullYear();
          const latestEndYear = latestEnd.getFullYear();
          // If starting year is more than 1 calendar year ahead of latest year's end year
          if (startYear - latestEndYear > 1) {
            const error = new Error(
              `Cannot skip academic years. Academic year must follow the latest configured academic year '${latestYear.academicYearName || latestYear.yearName}'. Please create the intervening academic year first.`
            );
            error.statusCode = 400;
            throw error;
          }
        }
      }

      const earliestYear = existingYears[0];
      if (earliestYear.startDate) {
        const earliestStart = new Date(earliestYear.startDate);
        // If creating a prior academic year before the earliest year
        if (end < earliestStart) {
          const endYear = end.getFullYear();
          const earliestStartYear = earliestStart.getFullYear();
          if (earliestStartYear - endYear > 1) {
            const error = new Error(
              `Cannot skip academic years. Prior academic year must immediately precede '${earliestYear.academicYearName || earliestYear.yearName}'.`
            );
            error.statusCode = 400;
            throw error;
          }
        }
      }
    }

    // Check if this will be the first academic year or if isCurrent was requested
    const count = existingYears.length;
    let willBeCurrent = count === 0; // If first year, make it current by default

    if (data.isCurrent === true) {
      willBeCurrent = true;
    }

    if (willBeCurrent) {
      await AcademicYear.updateMany({ schoolId: schoolIdUpper }, { $set: { isCurrent: false } });
    }

    const calculatedStatus = this.calculateStatus(start, end);

    const newYear = new AcademicYear({
      schoolId: schoolIdUpper,
      academicYearName: name,
      yearName: name,
      startDate: start,
      endDate: end,
      isCurrent: willBeCurrent,
      status: calculatedStatus
    });

    await newYear.save();

    return {
      academicYear: {
        ...newYear.toObject(),
        status: calculatedStatus
      },
      message: `Academic year '${name}' created successfully.`
    };
  }

  /**
   * Update an existing academic year
   */
  async updateAcademicYear(schoolId, academicYearId, data) {
    const schoolIdUpper = schoolId.toUpperCase();
    const year = await AcademicYear.findOne({
      _id: academicYearId,
      schoolId: schoolIdUpper
    });

    if (!year) {
      const error = new Error('Academic year not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    const name = (data.academicYearName || data.yearName || year.academicYearName || year.yearName).trim();
    if (!name) {
      const error = new Error('Academic year name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const start = data.startDate ? new Date(data.startDate) : year.startDate;
    const end = data.endDate ? new Date(data.endDate) : year.endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const error = new Error('Invalid start date or end date.');
      error.statusCode = 400;
      throw error;
    }

    if (end <= start) {
      const error = new Error('End date must be after start date.');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate name excluding this ID
    const duplicate = await AcademicYear.findOne({
      _id: { $ne: academicYearId },
      schoolId: schoolIdUpper,
      $or: [{ academicYearName: name }, { yearName: name }]
    });

    if (duplicate) {
      const error = new Error(`Another academic year named '${name}' already exists in this school.`);
      error.statusCode = 400;
      throw error;
    }

    // Overlap validation with all other years of the school
    const otherYears = await AcademicYear.find({
      _id: { $ne: academicYearId },
      schoolId: schoolIdUpper
    });

    for (const yr of otherYears) {
      if (yr.startDate && yr.endDate) {
        const yrStart = new Date(yr.startDate);
        const yrEnd = new Date(yr.endDate);
        if (start <= yrEnd && end >= yrStart) {
          const formattedYrStart = yrStart.toLocaleDateString('en-GB');
          const formattedYrEnd = yrEnd.toLocaleDateString('en-GB');
          const error = new Error(
            `Updated dates overlap with existing academic year '${yr.academicYearName || yr.yearName}' (${formattedYrStart} to ${formattedYrEnd}).`
          );
          error.statusCode = 400;
          throw error;
        }
      }
    }

    year.academicYearName = name;
    year.yearName = name;
    year.startDate = start;
    year.endDate = end;
    year.status = this.calculateStatus(start, end);

    await year.save();

    return {
      academicYear: {
        ...year.toObject(),
        status: year.status
      },
      message: `Academic year '${name}' updated successfully.`
    };
  }

  /**
   * Set an academic year as Current (atomic operation)
   */
  async setCurrentAcademicYear(schoolId, academicYearId) {
    const schoolIdUpper = schoolId.toUpperCase();
    const year = await AcademicYear.findOne({
      _id: academicYearId,
      schoolId: schoolIdUpper
    });

    if (!year) {
      const error = new Error('Academic year not found in this school.');
      error.statusCode = 404;
      throw error;
    }

    // Atomically reset all other years to isCurrent: false, and set this one to true
    await AcademicYear.updateMany(
      { schoolId: schoolIdUpper },
      { $set: { isCurrent: false } }
    );

    year.isCurrent = true;
    await year.save();

    return {
      academicYear: {
        ...year.toObject(),
        status: this.calculateStatus(year.startDate, year.endDate)
      },
      message: `Academic year '${year.academicYearName || year.yearName}' is now set as the Current Academic Year.`
    };
  }

  /**
   * Validate that an academic year ID belongs to the school
   */
  async validateYearBelongsToSchool(schoolId, academicYearId) {
    const year = await AcademicYear.findOne({
      _id: academicYearId,
      schoolId: schoolId.toUpperCase()
    });
    return !!year;
  }
}

module.exports = new AcademicYearService();
