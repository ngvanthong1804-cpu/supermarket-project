const db = require('../config/db');

// Lấy danh sách wishlist của user hiện tại
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            `SELECT w.id AS wishlist_id, p.*
             FROM wishlists w
             JOIN products p ON w.product_id = p.id
             WHERE w.user_id = ? AND p.status = 1
             ORDER BY w.created_at DESC`,
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Thêm sản phẩm vào wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ success: false, message: 'Thiếu product_id' });
        }

        const [existing] = await db.query(
            'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' });
        }

        await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
        res.status(201).json({ success: true, message: 'Đã thêm vào yêu thích' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa khỏi wishlist theo product_id
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const [result] = await db.query(
            'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy trong danh sách yêu thích' });
        }
        res.json({ success: true, message: 'Đã xóa khỏi yêu thích' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Kiểm tra 1 sản phẩm đã được yêu thích chưa (dùng để tô màu icon trái tim)
exports.checkWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const [rows] = await db.query(
            'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        res.json({ success: true, data: { isWishlisted: rows.length > 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};