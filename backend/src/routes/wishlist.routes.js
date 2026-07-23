const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Chỉ Customer đã đăng nhập mới dùng wishlist
router.get('/', verifyToken, checkRole('customer'), wishlistController.getWishlist);
router.post('/', verifyToken, checkRole('customer'), wishlistController.addToWishlist);
router.delete('/:productId', verifyToken, checkRole('customer'), wishlistController.removeFromWishlist);
router.get('/check/:productId', verifyToken, checkRole('customer'), wishlistController.checkWishlist);

module.exports = router;