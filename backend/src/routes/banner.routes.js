const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Public — Guest cũng xem được banner trên trang chủ
router.get('/active', bannerController.getActiveBanners);

// Admin quản lý
router.get('/', verifyToken, checkRole('admin'), bannerController.getAllBanners);
router.post('/', verifyToken, checkRole('admin'), bannerController.createBanner);
router.put('/:id/toggle-status', verifyToken, checkRole('admin'), bannerController.toggleBannerStatus);
router.delete('/:id', verifyToken, checkRole('admin'), bannerController.deleteBanner);

module.exports = router;