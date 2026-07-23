const db = require('../config/db');

// Lấy banner đang hiển thị (public - dùng cho trang chủ)
exports.getActiveBanners = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM banners WHERE status = 1 ORDER BY id DESC'
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy tất cả banner (Admin quản lý, bao gồm cả ẩn)
exports.getAllBanners = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo banner (Admin)
exports.createBanner = async (req, res) => {
    try {
        const { title, image, link } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, message: 'Thiếu ảnh banner' });
        }
        const [result] = await db.query(
            'INSERT INTO banners (title, image, link) VALUES (?, ?, ?)',
            [title || null, image, link || null]
        );
        res.status(201).json({ success: true, message: 'Tạo banner thành công', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Bật/tắt hiển thị banner (Admin)
exports.toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT status FROM banners WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
        }
        const newStatus = rows[0].status ? 0 : 1;
        await db.query('UPDATE banners SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa banner (Admin)
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
        }
        res.json({ success: true, message: 'Xóa banner thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};