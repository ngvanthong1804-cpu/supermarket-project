const db = require('../config/db');

// Lấy danh sách voucher (Admin quản lý)
exports.getAllVouchers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vouchers ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Kiểm tra & áp dụng voucher (Customer nhập mã lúc checkout)
exports.checkVoucher = async (req, res) => {
    try {
        const { code, order_value } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });
        }

        const [rows] = await db.query(
            'SELECT * FROM vouchers WHERE code = ? AND status = 1',
            [code]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Mã voucher không tồn tại hoặc đã bị vô hiệu hóa' });
        }

        const voucher = rows[0];

        if (voucher.expired_at && new Date(voucher.expired_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'Mã voucher đã hết hạn' });
        }
        if (voucher.quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Mã voucher đã hết lượt sử dụng' });
        }
        if (order_value < voucher.min_order_value) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${Number(voucher.min_order_value).toLocaleString('vi-VN')}đ để dùng mã này`
            });
        }

        let discount = 0;
        if (voucher.discount_percent) {
            discount = (order_value * voucher.discount_percent) / 100;
        } else if (voucher.discount_amount) {
            discount = Number(voucher.discount_amount);
        }
        discount = Math.min(discount, order_value); // không giảm quá tổng tiền

        res.json({
            success: true,
            data: { voucher_id: voucher.id, code: voucher.code, discount }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo voucher (Admin)
exports.createVoucher = async (req, res) => {
    try {
        const { code, discount_percent, discount_amount, min_order_value, quantity, expired_at } = req.body;

        if (!code || (!discount_percent && !discount_amount)) {
            return res.status(400).json({ success: false, message: 'Thiếu mã hoặc giá trị giảm giá' });
        }

        const [existing] = await db.query('SELECT id FROM vouchers WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại' });
        }

        const [result] = await db.query(
            `INSERT INTO vouchers (code, discount_percent, discount_amount, min_order_value, quantity, expired_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [code, discount_percent || null, discount_amount || null, min_order_value || 0, quantity || 0, expired_at || null]
        );

        res.status(201).json({ success: true, message: 'Tạo voucher thành công', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Bật/tắt voucher (Admin)
exports.toggleVoucherStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT status FROM vouchers WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
        }
        const newStatus = rows[0].status ? 0 : 1;
        await db.query('UPDATE vouchers SET status = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa voucher (Admin)
exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM vouchers WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
        }
        res.json({ success: true, message: 'Xóa voucher thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};