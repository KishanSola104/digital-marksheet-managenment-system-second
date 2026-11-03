const userService = require('../services/userService');

class UserController {
  async getUsers(req, res, next) {
    try {
      const { search, status, role } = req.query;
      const users = await userService.getUsers(req.schoolId, { search, status, role });
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.schoolId, req.params.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const result = await userService.createUser(req.schoolId, req.body);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const result = await userService.updateUser(req.schoolId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await userService.updateUserStatus(req.schoolId, req.params.id, isActive);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const roles = await userService.getRoles();
      return res.status(200).json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
