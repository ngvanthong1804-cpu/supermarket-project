const db = require('../config/db');

// Lấy giỏ hàng của user hiện tại (tự tạo cart nếu chưa có)
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        let cartId;

        if (carts.length === 0) {
            const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].id;
        }

        const [items] = await db.query(
            `SELECT ci.id, ci.product_id, ci.quantity, 
                    p.name, p.price, p.discount_price, p.image, p.unit, p.stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        const total = items.reduce((sum, item) => {
            const price = item.discount_price || item.price;
            return sum + price * item.quantity;
        }, 0);

        res.json({ success: true, data: { cart_id: cartId, items, total } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Thêm sản phẩm vào giỏ
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ success: false, message: 'Thiếu product_id' });
        }

        // Kiểm tra sản phẩm tồn tại
        const [products] = await db.query('SELECT id, stock FROM products WHERE id = ? AND status = 1', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        // Lấy hoặc tạo cart
        let [carts] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        let cartId;
        if (carts.length === 0) {
            const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].id;
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const [existing] = await db.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, product_id]
        );

        if (existing.length > 0) {
            const newQty = existing[0].quantity + Number(quantity);
            await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
        } else {
            await db.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                [cartId, product_id, quantity]
            );
        }

        res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật số lượng
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
        }

        const [result] = await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
        }
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa sản phẩm khỏi giỏ
exports.removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const [result] = await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
        }
        res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};