const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.use(verifyUserToken);

router.get('/', academicYearController.getAcademicYears);

module.exports = router;
