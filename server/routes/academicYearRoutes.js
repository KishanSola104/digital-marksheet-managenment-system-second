const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

// All routes require authenticated user session
router.use(verifyUserToken);

// Read endpoints (accessible to all authenticated institutional roles for context/header)
router.get('/', academicYearController.getAcademicYears);
router.get('/:id', academicYearController.getAcademicYearById);

// Admin-only management endpoints
router.post('/', requireRole(['ADMIN']), academicYearController.createAcademicYear);
router.put('/:id', requireRole(['ADMIN']), academicYearController.updateAcademicYear);
router.patch('/:id/set-current', requireRole(['ADMIN']), academicYearController.setCurrentAcademicYear);

module.exports = router;
