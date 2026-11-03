const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyUserToken, requireRole(['ADMIN']));

router.get('/summary', dashboardController.getSummary);

module.exports = router;
