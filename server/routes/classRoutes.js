const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

// All routes require authenticated user session
router.use(verifyUserToken);

// Read endpoints
router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);

// Admin-only management endpoints
router.post('/', requireRole(['ADMIN']), classController.createClass);
router.put('/:id', requireRole(['ADMIN']), classController.updateClass);
router.patch('/:id/status', requireRole(['ADMIN']), classController.updateClassStatus);

module.exports = router;
