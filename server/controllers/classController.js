const classService = require('../services/classService');

class ClassController {
  async getClasses(req, res, next) {
    try {
      const result = await classService.getClasses(req.schoolId, req.query);
      return res.status(200).json({
        success: true,
        data: result.classes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getClassById(req, res, next) {
    try {
      const classRecord = await classService.getClassById(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        data: classRecord
      });
    } catch (error) {
      next(error);
    }
  }

  async createClass(req, res, next) {
    try {
      const result = await classService.createClass(req.schoolId, req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.class
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req, res, next) {
    try {
      const result = await classService.updateClass(req.schoolId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.class
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClassStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await classService.updateClassStatus(req.schoolId, req.params.id, isActive);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.class
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassController();
