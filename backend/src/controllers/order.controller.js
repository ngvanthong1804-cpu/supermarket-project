const db = require('../config/db');
const { createNotification } = require('./notification.controller');

// Tạo đơn hàng từ giỏ hàng hiện tại (Customer)
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.id;
        const { shipping_address, phone, payment_method, note, voucher_id, discount_amount } = req.body;

        if (!shipping_address || !phone) {
            return res.status(400).json({ success: false, message: 'Thiếu địa chỉ hoặc số điện thoại' });
        }

        await connection.beginTransaction();

        // Lấy giỏ hàng
        const [carts] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (carts.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }
        const cartId = carts[0].id;

        const [cartItems] = await connection.query(
            `SELECT ci.product_id, ci.quantity, p.name, p.price, p.discount_price, p.stock
             FROM cart_items ci JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        // Kiểm tra tồn kho
        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${item.name}" không đủ hàng (còn ${item.stock})`
                });
            }
        }

        // Tính tổng tiền
        let totalAmount = cartItems.reduce((sum, item) => {
            const price = item.discount_price || item.price;
            return sum + price * item.quantity;
        }, 0);

        // Áp giảm giá voucher (nếu có, giá trị đã được xác nhận từ FE qua /vouchers/check)
        const appliedDiscount = discount_amount ? Number(discount_amount) : 0;
        totalAmount = Math.max(0, totalAmount - appliedDiscount);

        // Tạo order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address, phone, payment_method, note)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, totalAmount, shipping_address, phone, payment_method || 'cod', note || null]
        );
        const orderId = orderResult.insertId;

        // Ghi nhận voucher đã dùng cho đơn này + trừ lượt
        if (voucher_id) {
            await connection.query(
                'INSERT INTO order_vouchers (order_id, voucher_id, discount_applied) VALUES (?, ?, ?)',
                [orderId, voucher_id, appliedDiscount]
            );
            await connection.query('UPDATE vouchers SET quantity = quantity - 1 WHERE id = ?', [voucher_id]);
        }

        // Tạo order_items + trừ tồn kho
        for (const item of cartItems) {
            const price = item.discount_price || item.price;
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.name, price, item.quantity]
            );
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Xóa giỏ hàng sau khi đặt
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

        await connection.commit();

        // Thông báo cho tất cả Admin về đơn hàng mới
        const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await createNotification(
                admin.id,
                'Đơn hàng mới',
                `Có đơn hàng mới #${orderId} trị giá ${Number(totalAmount).toLocaleString('vi-VN')}đ`
            );
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: { order_id: orderId, total_amount: totalAmount }
        });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// Lấy danh sách đơn hàng của user hiện tại
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        let query = 'SELECT * FROM orders WHERE id = ?';
        const params = [id];

        // Customer chỉ xem được đơn của chính mình
        if (role === 'customer') {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const [orders] = await db.query(query, params);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

        res.json({ success: true, data: { ...orders[0], items } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===== Dành cho Admin/Staff =====

// Lấy tất cả đơn hàng (Admin/Staff)
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT o.*, u.full_name, u.email 
            FROM orders o JOIN users u ON o.user_id = u.id
        `;
        const params = [];
        if (status) {
            query += ' WHERE o.order_status = ?';
            params.push(status);
        }
        query += ' ORDER BY o.created_at DESC';

        const [orders] = await db.query(query, params);
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật trạng thái đơn hàng (Admin/Staff)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status } = req.body;
        const staffId = req.user.id;

        const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(order_status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }

        const [orders] = await db.query('SELECT user_id FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const [result] = await db.query(
            'UPDATE orders SET order_status = ?, staff_id = ? WHERE id = ?',
            [order_status, staffId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Tạo thông báo cho khách hàng
        const statusLabels = {
            pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
            shipping: 'Đang giao hàng', completed: 'Hoàn thành', cancelled: 'Đã hủy',
        };
        await createNotification(
            orders[0].user_id,
            `Đơn hàng #${id} cập nhật trạng thái`,
            `Đơn hàng của bạn đã chuyển sang trạng thái: ${statusLabels[order_status]}`
        );

        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Customer tự hủy đơn hàng của chính mình (chỉ khi đơn còn "pending")
exports.cancelMyOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await connection.beginTransaction();

        const [orders] = await connection.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (orders[0].order_status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể hủy đơn khi đang ở trạng thái "Chờ xác nhận"'
            });
        }

        // Hoàn lại tồn kho cho các sản phẩm trong đơn
        const [items] = await connection.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [id]
        );
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.query(
            "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
            [id]
        );

        await connection.commit();
        res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};