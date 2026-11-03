const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

// All routes require authenticated user session
router.use(verifyUserToken);

// Read endpoints
router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);

// Admin-only management endpoints
router.post('/', requireRole(['ADMIN']), subjectController.createSubject);
router.put('/:id', requireRole(['ADMIN']), subjectController.updateSubject);
router.patch('/:id/status', requireRole(['ADMIN']), subjectController.updateSubjectStatus);

module.exports = router;
