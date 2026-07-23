const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Chỉ Admin quản lý user (Staff KHÔNG được vào đây)
router.get('/', verifyToken, checkRole('admin'), userController.getAllUsers);
router.post('/', verifyToken, checkRole('admin'), userController.createUser);
router.put('/:id/toggle-status', verifyToken, checkRole('admin'), userController.toggleUserStatus);

// Mọi user đã đăng nhập đều tự sửa được profile của mình
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/change-password', verifyToken, userController.changePassword);

module.exports = router;