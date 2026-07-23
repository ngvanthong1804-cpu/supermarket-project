const db = require('../config/db');

// Lấy danh sách thông báo của user hiện tại
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
            [userId]
        );
        const [unreadResult] = await db.query(
            'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        res.json({ success: true, data: rows, unread: unreadResult[0].unread });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đánh dấu 1 thông báo đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Hàm nội bộ dùng chung: tạo thông báo cho 1 user (gọi từ các controller khác, không phải route)
exports.createNotification = async (userId, title, content) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
            [userId, title, content]
        );
    } catch (err) {
        console.error('Lỗi tạo thông báo:', err.message);
    }
};