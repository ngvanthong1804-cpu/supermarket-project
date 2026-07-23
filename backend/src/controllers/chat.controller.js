const db = require('../config/db');
const { createNotification } = require('./notification.controller');

// Customer lấy lịch sử chat của chính mình
exports.getMyChat = async (req, res) => {
    try {
        const customerId = req.user.id;
        const [rows] = await db.query(
            `SELECT cm.*, u.full_name AS sender_name
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.id
             WHERE cm.customer_id = ?
             ORDER BY cm.created_at ASC`,
            [customerId]
        );
        // Đánh dấu đã đọc các tin nhắn từ staff/admin gửi cho customer này
        await db.query(
            "UPDATE chat_messages SET is_read = 1 WHERE customer_id = ? AND sender_role != 'customer'",
            [customerId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Customer gửi tin nhắn
exports.sendMyMessage = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
        }

        const [result] = await db.query(
            'INSERT INTO chat_messages (customer_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)',
            [customerId, customerId, 'customer', message.trim()]
        );

        // Thông báo cho Admin có tin nhắn mới
        const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await createNotification(admin.id, 'Tin nhắn hỗ trợ mới', `Khách hàng vừa gửi 1 tin nhắn mới`);
        }

        res.status(201).json({ success: true, message: 'Đã gửi', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin/Staff: lấy danh sách các cuộc hội thoại (mỗi customer là 1 cuộc)
exports.getConversations = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                cm.customer_id,
                u.full_name AS customer_name,
                u.email AS customer_email,
                MAX(cm.created_at) AS last_message_at,
                (SELECT message FROM chat_messages WHERE customer_id = cm.customer_id ORDER BY created_at DESC LIMIT 1) AS last_message,
                SUM(CASE WHEN cm.sender_role = 'customer' AND cm.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
             FROM chat_messages cm
             JOIN users u ON cm.customer_id = u.id
             GROUP BY cm.customer_id
             ORDER BY last_message_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin/Staff: lấy tin nhắn của 1 cuộc hội thoại với customer cụ thể
exports.getConversationMessages = async (req, res) => {
    try {
        const { customerId } = req.params;
        const [rows] = await db.query(
            `SELECT cm.*, u.full_name AS sender_name
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.id
             WHERE cm.customer_id = ?
             ORDER BY cm.created_at ASC`,
            [customerId]
        );
        // Đánh dấu đã đọc các tin nhắn từ customer gửi
        await db.query(
            "UPDATE chat_messages SET is_read = 1 WHERE customer_id = ? AND sender_role = 'customer'",
            [customerId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin/Staff: gửi tin nhắn cho 1 customer
exports.sendStaffMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const senderRole = req.user.role;
        const { customerId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
        }

        const [result] = await db.query(
            'INSERT INTO chat_messages (customer_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)',
            [customerId, senderId, senderRole, message.trim()]
        );

        await createNotification(customerId, 'Tin nhắn hỗ trợ mới', 'Bạn có tin nhắn mới từ bộ phận hỗ trợ');

        res.status(201).json({ success: true, message: 'Đã gửi', data: { id: result.insertId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đếm tổng số tin nhắn chưa đọc (dùng cho badge trên icon chat)
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let count;
        if (role === 'customer') {
            const [rows] = await db.query(
                "SELECT COUNT(*) AS count FROM chat_messages WHERE customer_id = ? AND sender_role != 'customer' AND is_read = 0",
                [userId]
            );
            count = rows[0].count;
        } else {
            const [rows] = await db.query(
                "SELECT COUNT(*) AS count FROM chat_messages WHERE sender_role = 'customer' AND is_read = 0"
            );
            count = rows[0].count;
        }
        res.json({ success: true, data: { count } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};