const db = require('../config/db');

// Tìm khách hàng có sẵn theo SĐT hoặc email (để gắn đơn POS vào tài khoản họ, nếu có)
exports.searchCustomer = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.json({ success: true, data: [] });
        }
        const [rows] = await db.query(
            `SELECT id, full_name, phone, email FROM users 
             WHERE role = 'customer' AND (phone LIKE ? OR email LIKE ?) LIMIT 5`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo đơn bán tại quầy — thanh toán ngay, hoàn tất ngay, trừ kho ngay
exports.createPosOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const staffId = req.user.id;
        const { items, customer_id, walkin_name, walkin_phone, payment_method } = req.body;
        // items: [{ product_id, quantity }]

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
        }

        await connection.beginTransaction();

        // Lấy thông tin giá + tồn kho hiện tại của từng sản phẩm
        const productIds = items.map((i) => i.product_id);
        const [products] = await connection.query(
            `SELECT id, name, price, discount_price, stock FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`,
            productIds
        );
        const productMap = new Map(products.map((p) => [p.id, p]));

        let totalAmount = 0;
        for (const item of items) {
            const product = productMap.get(item.product_id);
            if (!product) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: `Sản phẩm ID ${item.product_id} không tồn tại` });
            }
            if (item.quantity > product.stock) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.name}" không đủ hàng (còn ${product.stock})`
                });
            }
            // Ưu tiên giá đã được Staff chỉnh giảm tại quầy (nếu có), nếu không dùng giá khuyến mãi/giá gốc trong kho
            const basePrice = product.discount_price || product.price;
            const finalPrice = item.custom_price != null ? Number(item.custom_price) : basePrice;
            if (finalPrice < 0 || finalPrice > basePrice) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Giá bán cho "${product.name}" không hợp lệ`
                });
            }
            totalAmount += finalPrice * item.quantity;
        }

        const [orderResult] = await connection.query(
            `INSERT INTO orders 
             (user_id, staff_id, total_amount, shipping_address, phone, payment_method, payment_status, order_status, order_type, walkin_name, walkin_phone)
             VALUES (?, ?, ?, ?, ?, ?, 'paid', 'completed', 'pos', ?, ?)`,
            [
                customer_id || null,
                staffId,
                totalAmount,
                'Mua tại quầy',
                walkin_phone || '',
                payment_method || 'cod',
                customer_id ? null : (walkin_name || 'Khách vãng lai'),
                customer_id ? null : (walkin_phone || null),
            ]
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            const product = productMap.get(item.product_id);
            const basePrice = product.discount_price || product.price;
            const finalPrice = item.custom_price != null ? Number(item.custom_price) : basePrice;

            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, product.name, finalPrice, item.quantity]
            );
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Tạo đơn bán tại quầy thành công',
            data: { order_id: orderId, total_amount: totalAmount },
        });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};