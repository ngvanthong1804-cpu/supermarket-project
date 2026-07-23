const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/customers', verifyToken, checkRole('admin', 'staff'), posController.searchCustomer);
router.post('/orders', verifyToken, checkRole('admin', 'staff'), posController.createPosOrder);

module.exports = router;