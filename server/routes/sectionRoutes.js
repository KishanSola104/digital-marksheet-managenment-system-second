const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

// All routes require authenticated user session
router.use(verifyUserToken);

// Read endpoints
router.get('/', sectionController.getSections);
router.get('/:id', sectionController.getSectionById);

// Admin-only management endpoints
router.post('/', requireRole(['ADMIN']), sectionController.createSection);
router.put('/:id', requireRole(['ADMIN']), sectionController.updateSection);
router.patch('/:id/status', requireRole(['ADMIN']), sectionController.updateSectionStatus);

module.exports = router;
