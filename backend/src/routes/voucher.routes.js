const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Customer kiểm tra & áp mã (cần đăng nhập để checkout)
router.post('/check', verifyToken, voucherController.checkVoucher);

// Admin quản lý voucher
router.get('/', verifyToken, checkRole('admin'), voucherController.getAllVouchers);
router.post('/', verifyToken, checkRole('admin'), voucherController.createVoucher);
router.put('/:id/toggle-status', verifyToken, checkRole('admin'), voucherController.toggleVoucherStatus);
router.delete('/:id', verifyToken, checkRole('admin'), voucherController.deleteVoucher);

module.exports = router;