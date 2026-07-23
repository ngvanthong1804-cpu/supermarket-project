const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', verifyToken, checkRole('admin'), categoryController.createCategory);
router.put('/:id', verifyToken, checkRole('admin'), categoryController.updateCategory);
router.delete('/:id', verifyToken, checkRole('admin'), categoryController.deleteCategory);

module.exports = router;