const db = require('../config/db');

exports.getAllSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Thiếu tên nhà cung cấp' });
        }
        const [result] = await db.query(
            'INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)',
            [name, phone || null, email || null, address || null]
        );
        res.status(201).json({ success: true, message: 'Tạo nhà cung cấp thành công', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address } = req.body;
        const [result] = await db.query(
            'UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
            [name, phone, email, address, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        }
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        }
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};