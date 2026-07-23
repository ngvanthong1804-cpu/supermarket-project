const express = require('express');
const router = express.Router();
const stockImportController = require('../controllers/stockImport.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Admin/Staff đều được nhập kho — đúng nghiệp vụ thực tế (staff nhận hàng, admin giám sát)
router.get('/', verifyToken, checkRole('admin', 'staff'), stockImportController.getAllImports);
router.get('/:id', verifyToken, checkRole('admin', 'staff'), stockImportController.getImportById);
router.post('/', verifyToken, checkRole('admin', 'staff'), stockImportController.createImport);

module.exports = router;