const db = require('../config/db');

// Doanh thu theo ngày trong N ngày gần nhất (mặc định 14 ngày, chỉ tính đơn completed)
exports.getRevenueByDate = async (req, res) => {
    try {
        const { days = 14 } = req.query;
        const [rows] = await db.query(
            `SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS orders
             FROM orders
             WHERE order_status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC`,
            [Number(days)]
        );

        // Điền đủ các ngày không có đơn hàng để biểu đồ không bị đứt quãng
        const result = [];
        const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r]));
        for (let i = Number(days) - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = map.get(key);
            result.push({
                date: key,
                revenue: found ? Number(found.revenue) : 0,
                orders: found ? found.orders : 0,
            });
        }

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Top sản phẩm bán chạy
exports.getTopProducts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const [rows] = await db.query(
            `SELECT p.id, p.name, p.image, SUM(oi.quantity) AS total_sold, SUM(oi.price * oi.quantity) AS total_revenue
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.order_status = 'completed'
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT ?`,
            [Number(limit)]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Thống kê số đơn theo trạng thái (dùng cho biểu đồ tròn)
exports.getOrderStatusSummary = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT order_status, COUNT(*) AS count
             FROM orders
             GROUP BY order_status`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tổng quan nhanh (dùng lại cho Dashboard hiện tại, gộp về 1 API duy nhất cho gọn)
exports.getOverview = async (req, res) => {
    try {
        const [[productCount]] = await db.query('SELECT COUNT(*) AS total FROM products WHERE status = 1');
        const [[orderCount]] = await db.query('SELECT COUNT(*) AS total FROM orders');
        const [[revenue]] = await db.query(
            "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status = 'completed'"
        );
        const [[pending]] = await db.query("SELECT COUNT(*) AS total FROM orders WHERE order_status = 'pending'");
        const [[customerCount]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");

        res.json({
            success: true,
            data: {
                totalProducts: productCount.total,
                totalOrders: orderCount.total,
                totalRevenue: Number(revenue.total),
                pendingOrders: pending.total,
                totalCustomers: customerCount.total,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};