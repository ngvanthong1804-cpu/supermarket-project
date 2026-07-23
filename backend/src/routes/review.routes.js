const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Guest, Customer, ai cũng xem được đánh giá
router.get('/product/:productId', reviewController.getProductReviews);

// Chỉ Customer đã đăng nhập mới được đánh giá
router.post('/', verifyToken, checkRole('customer'), reviewController.createReview);

module.exports = router;