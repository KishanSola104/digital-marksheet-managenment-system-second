const sectionService = require('../services/sectionService');

class SectionController {
  async getSections(req, res, next) {
    try {
      const result = await sectionService.getSections(req.schoolId, req.query);
      return res.status(200).json({
        success: true,
        data: result.sections,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getSectionById(req, res, next) {
    try {
      const section = await sectionService.getSectionById(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  async createSection(req, res, next) {
    try {
      const result = await sectionService.createSection(req.schoolId, req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.section
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSection(req, res, next) {
    try {
      const result = await sectionService.updateSection(req.schoolId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.section
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSectionStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await sectionService.updateSectionStatus(req.schoolId, req.params.id, isActive);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.section
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SectionController();
