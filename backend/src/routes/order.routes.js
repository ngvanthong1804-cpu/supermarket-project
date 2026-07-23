const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Customer
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.put('/:id/cancel', verifyToken, orderController.cancelMyOrder);
router.get('/:id', verifyToken, orderController.getOrderById);
router.get('/:id/invoice', verifyToken, invoiceController.exportInvoice);

// Admin/Staff
router.get('/', verifyToken, checkRole('admin', 'staff'), orderController.getAllOrders);
router.put('/:id/status', verifyToken, checkRole('admin', 'staff'), orderController.updateOrderStatus);

module.exports = router;