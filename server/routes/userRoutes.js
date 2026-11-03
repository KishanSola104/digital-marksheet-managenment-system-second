const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyUserToken, requireRole } = require('../middlewares/authMiddleware');

// All user management routes require User session with ADMIN role
router.use(verifyUserToken, requireRole(['ADMIN']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;
