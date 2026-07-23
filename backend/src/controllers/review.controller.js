const db = require('../config/db');

// Lấy đánh giá của 1 sản phẩm (public - Guest xem được)
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const [reviews] = await db.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
             FROM reviews r JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );

        const [avgResult] = await db.query(
            'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ?',
            [productId]
        );

        res.json({
            success: true,
            data: {
                reviews,
                avg_rating: avgResult[0].avg_rating ? Number(avgResult[0].avg_rating).toFixed(1) : 0,
                total: avgResult[0].total,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo đánh giá (Customer - phải đã mua sản phẩm mới được đánh giá)
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating phải từ 1-5' });
        }

        // Kiểm tra user đã từng mua sản phẩm này chưa (đơn completed)
        const [purchased] = await db.query(
            `SELECT oi.id FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = ? AND oi.product_id = ? AND o.order_status = 'completed'
             LIMIT 1`,
            [userId, product_id]
        );
        if (purchased.length === 0) {
            return res.status(403).json({ success: false, message: 'Bạn cần mua và nhận sản phẩm trước khi đánh giá' });
        }

        // Kiểm tra đã đánh giá sản phẩm này chưa
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [product_id, userId, rating, comment || null]
        );

        res.status(201).json({ success: true, message: 'Đánh giá thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};