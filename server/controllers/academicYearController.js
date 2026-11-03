const academicYearService = require('../services/academicYearService');

class AcademicYearController {
  async getAcademicYears(req, res, next) {
    try {
      const result = await academicYearService.getAcademicYears(req.schoolId, req.query);
      return res.status(200).json({
        success: true,
        data: result.academicYears,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getAcademicYearById(req, res, next) {
    try {
      const academicYear = await academicYearService.getAcademicYearById(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        data: academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  async createAcademicYear(req, res, next) {
    try {
      const result = await academicYearService.createAcademicYear(req.schoolId, req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAcademicYear(req, res, next) {
    try {
      const result = await academicYearService.updateAcademicYear(req.schoolId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  async setCurrentAcademicYear(req, res, next) {
    try {
      const result = await academicYearService.setCurrentAcademicYear(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.academicYear
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AcademicYearController();
