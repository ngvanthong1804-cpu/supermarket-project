const db = require('../config/db');

// Lấy danh sách địa chỉ của user hiện tại
exports.getMyAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Thêm địa chỉ mới
exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            receiver_name, phone, address_detail,
            province_code, province_name, ward_code, ward_name, is_default,
        } = req.body;

        if (!receiver_name || !phone || !address_detail || !province_code || !ward_code) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });
        }

        // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác trước
        if (is_default) {
            await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        // Nếu đây là địa chỉ đầu tiên, tự động đặt làm mặc định
        const [existing] = await db.query('SELECT id FROM addresses WHERE user_id = ?', [userId]);
        const shouldBeDefault = is_default || existing.length === 0;

        const [result] = await db.query(
            `INSERT INTO addresses 
             (user_id, receiver_name, phone, address_detail, province_code, province_name, ward_code, ward_name, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, receiver_name, phone, address_detail, province_code, province_name, ward_code, ward_name, shouldBeDefault ? 1 : 0]
        );

        res.status(201).json({ success: true, message: 'Thêm địa chỉ thành công', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Sửa địa chỉ
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const {
            receiver_name, phone, address_detail,
            province_code, province_name, ward_code, ward_name, is_default,
        } = req.body;

        const [existing] = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        if (is_default) {
            await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        await db.query(
            `UPDATE addresses SET 
                receiver_name = ?, phone = ?, address_detail = ?, 
                province_code = ?, province_name = ?, ward_code = ?, ward_name = ?, is_default = ?
             WHERE id = ? AND user_id = ?`,
            [receiver_name, phone, address_detail, province_code, province_name, ward_code, ward_name, is_default ? 1 : 0, id, userId]
        );

        res.json({ success: true, message: 'Cập nhật địa chỉ thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đặt làm địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [existing] = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        await db.query('UPDATE addresses SET is_default = 1 WHERE id = ?', [id]);

        res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [existing] = await db.query('SELECT is_default FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);

        // Nếu vừa xóa địa chỉ mặc định, tự động gán mặc định cho địa chỉ khác (nếu còn)
        if (existing[0].is_default) {
            const [remaining] = await db.query('SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
            if (remaining.length > 0) {
                await db.query('UPDATE addresses SET is_default = 1 WHERE id = ?', [remaining[0].id]);
            }
        }

        res.json({ success: true, message: 'Đã xóa địa chỉ' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};