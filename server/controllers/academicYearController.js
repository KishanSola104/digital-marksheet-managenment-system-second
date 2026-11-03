const academicYearService = require('../services/academicYearService');

class AcademicYearController {
  async getAcademicYears(req, res, next) {
    try {
      const academicYears = await academicYearService.getAcademicYears(req.schoolId);
      return res.status(200).json({
        success: true,
        data: academicYears
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AcademicYearController();
