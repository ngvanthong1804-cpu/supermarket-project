const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, checkRole('admin', 'staff'), supplierController.getAllSuppliers);
router.post('/', verifyToken, checkRole('admin'), supplierController.createSupplier);
router.put('/:id', verifyToken, checkRole('admin'), supplierController.updateSupplier);
router.delete('/:id', verifyToken, checkRole('admin'), supplierController.deleteSupplier);

module.exports = router;