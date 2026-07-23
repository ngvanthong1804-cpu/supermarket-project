const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Public — Guest và ai cũng xem được
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Chỉ Admin và Staff được thêm/sửa, chỉ Admin được xóa
router.post('/', verifyToken, checkRole('admin', 'staff'), productController.createProduct);
router.put('/:id', verifyToken, checkRole('admin', 'staff'), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('admin'), productController.deleteProduct);

// Ảnh phụ (gallery)
router.post('/:id/images', verifyToken, checkRole('admin', 'staff'), productController.addProductImage);
router.delete('/images/:imageId', verifyToken, checkRole('admin', 'staff'), productController.deleteProductImage);
router.get('/barcode/:barcode', verifyToken, checkRole('admin', 'staff'), productController.getProductByBarcode);

// Giảm giá & Flash Sale (chỉ Admin quản lý)
router.put('/:id/quick-discount', verifyToken, checkRole('admin'), productController.quickDiscount);
router.post('/flash-sale', verifyToken, checkRole('admin'), productController.createFlashSale);
router.get('/flash-sale/list', verifyToken, checkRole('admin'), productController.getFlashSaleProducts);
router.put('/flash-sale/:id/end', verifyToken, checkRole('admin'), productController.endFlashSale);

module.exports = router;