const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const uploadController = require('../controllers/upload.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Chỉ Admin/Staff được upload ảnh (dùng cho sản phẩm, danh mục)
router.post('/', verifyToken, checkRole('admin', 'staff'), upload.single('image'), uploadController.uploadImage);

module.exports = router;