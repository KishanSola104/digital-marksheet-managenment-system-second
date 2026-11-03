const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.get('/', verifyUserToken, userController.getRoles);

module.exports = router;
