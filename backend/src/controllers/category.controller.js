const db = require('../config/db');

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy 1 danh mục theo id
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo danh mục (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, image } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ success: false, message: 'Thiếu tên hoặc slug' });
        }
        const [result] = await db.query(
            'INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)',
            [name, slug, image || null]
        );
        res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: { id: result.insertId, name, slug, image } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật danh mục (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, image } = req.body;
        const [result] = await db.query(
            'UPDATE categories SET name = ?, slug = ?, image = ? WHERE id = ?',
            [name, slug, image, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa danh mục (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};