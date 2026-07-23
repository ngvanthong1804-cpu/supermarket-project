const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách user (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = 'SELECT id, full_name, email, phone, address, role, status, created_at FROM users';
        const params = [];
        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo tài khoản Staff/Admin (Admin)
exports.createUser = async (req, res) => {
    try {
        const { full_name, email, password, phone, role } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }
        if (!['admin', 'staff', 'customer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone || null, role]
        );

        res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Khóa / Mở khóa tài khoản (Admin)
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query('SELECT status, role FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }
        if (users[0].role === 'admin') {
            return res.status(403).json({ success: false, message: 'Không thể khóa tài khoản Admin' });
        }

        const newStatus = users[0].status ? 0 : 1;
        await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, message: newStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật thông tin cá nhân (chính user đó tự sửa)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, address, address_province_code, address_ward_code, address_detail } = req.body;

        await db.query(
            `UPDATE users SET full_name = ?, phone = ?, address = ?, 
             address_province_code = ?, address_ward_code = ?, address_detail = ? WHERE id = ?`,
            [full_name, phone, address, address_province_code || null, address_ward_code || null, address_detail || null, userId]
        );
        res.json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Đổi mật khẩu (chính user đó tự đổi)
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mật khẩu' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên' });
        }

        const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const isMatch = await bcrypt.compare(current_password, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
