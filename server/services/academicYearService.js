const AcademicYear = require('../models/AcademicYear');

class AcademicYearService {
  /**
   * Get all academic years belonging to the authenticated school
   */
  async getAcademicYears(schoolId) {
    return await AcademicYear.find({ schoolId: schoolId.toUpperCase() })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Validate that a specific academic year belongs to the school
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
