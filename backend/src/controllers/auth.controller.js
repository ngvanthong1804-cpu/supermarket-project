const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/mailer');

// Đăng ký (mặc định role = customer)
exports.register = async (req, res) => {
    try {
        const { full_name, email, password, phone, address } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Kiểm tra email đã tồn tại chưa
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone || null, address || null, 'customer']
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: { id: result.insertId, full_name, email, role: 'customer' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = rows[0];

        if (user.status === 0) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Không trả password về client
        delete user.password;

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: { user, token }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy thông tin user hiện tại (dùng token)
exports.getMe = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, address, role, avatar, status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Bước 1: Gửi email chứa link đặt lại mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
        }

        const [users] = await db.query('SELECT id, full_name FROM users WHERE email = ?', [email]);

        // Luôn trả về thành công dù email có tồn tại hay không, tránh lộ thông tin email nào đã đăng ký (bảo mật)
        if (users.length === 0) {
            return res.json({ success: true, message: 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi' });
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 15 * 60 * 1000); // hết hạn sau 15 phút

        await db.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, expires, user.id]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"SuperMart" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Đặt lại mật khẩu - SuperMart',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Xin chào ${user.full_name},</h2>
                    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản SuperMart của mình.</p>
                    <p>Bấm vào nút bên dưới để đặt mật khẩu mới (liên kết có hiệu lực trong 15 phút):</p>
                    <a href="${resetLink}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
                        Đặt lại mật khẩu
                    </a>
                    <p style="color: #666; font-size: 13px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                </div>
            `,
        });

        res.json({ success: true, message: 'Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Bước 2: Xác nhận token + đặt mật khẩu mới
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên' });
        }

        const [users] = await db.query(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Liên kết đã hết hạn hoặc không hợp lệ' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};