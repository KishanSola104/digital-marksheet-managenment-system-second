const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.use(verifyUserToken);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
