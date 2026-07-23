const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/overview', verifyToken, checkRole('admin', 'staff'), statsController.getOverview);
router.get('/revenue', verifyToken, checkRole('admin', 'staff'), statsController.getRevenueByDate);
router.get('/top-products', verifyToken, checkRole('admin', 'staff'), statsController.getTopProducts);
router.get('/order-status', verifyToken, checkRole('admin', 'staff'), statsController.getOrderStatusSummary);

module.exports = router;