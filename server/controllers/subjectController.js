const subjectService = require('../services/subjectService');

class SubjectController {
  async getSubjects(req, res, next) {
    try {
      const result = await subjectService.getSubjects(req.schoolId, req.query);
      return res.status(200).json({
        success: true,
        data: result.subjects,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubjectById(req, res, next) {
    try {
      const subject = await subjectService.getSubjectById(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req, res, next) {
    try {
      const result = await subjectService.createSubject(req.schoolId, req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.subject
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const result = await subjectService.updateSubject(req.schoolId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.subject
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubjectStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await subjectService.updateSubjectStatus(req.schoolId, req.params.id, isActive);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.subject
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubjectController();
