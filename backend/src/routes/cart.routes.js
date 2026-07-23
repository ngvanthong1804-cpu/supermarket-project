const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Tất cả route giỏ hàng đều yêu cầu đăng nhập (Customer)
router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.put('/:itemId', verifyToken, cartController.updateCartItem);
router.delete('/:itemId', verifyToken, cartController.removeCartItem);

module.exports = router;