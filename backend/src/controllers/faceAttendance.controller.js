const db = require('../config/db');

const MATCH_THRESHOLD = 0.5;

function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

exports.getEmployeesWithFaceStatus = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.full_name, u.email, u.role, u.avatar,
                   ef.id IS NOT NULL AS has_face,
                   ef.updated_at AS face_registered_at
            FROM users u
            LEFT JOIN employee_faces ef ON ef.user_id = u.id
            WHERE u.role IN ('admin', 'staff')
            ORDER BY u.full_name
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.registerFace = async (req, res) => {
    try {
        const { userId, descriptor } = req.body;

        if (!userId || !Array.isArray(descriptor) || descriptor.length === 0) {
            return res.status(400).json({ success: false, message: 'Thiếu userId hoặc dữ liệu khuôn mặt không hợp lệ' });
        }

        const [users] = await db.query('SELECT id, role FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        }
        if (!['admin', 'staff'].includes(users[0].role)) {
            return res.status(400).json({ success: false, message: 'Chỉ đăng ký khuôn mặt cho admin hoặc nhân viên (staff)' });
        }

        const descriptorJson = JSON.stringify(descriptor);

        await db.query(
            `INSERT INTO employee_faces (user_id, face_descriptor)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE face_descriptor = VALUES(face_descriptor), updated_at = CURRENT_TIMESTAMP`,
            [userId, descriptorJson]
        );

        res.json({ success: true, message: 'Đăng ký khuôn mặt thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFace = async (req, res) => {
    try {
        const { userId } = req.params;
        await db.query('DELETE FROM employee_faces WHERE user_id = ?', [userId]);
        res.json({ success: true, message: 'Đã xóa dữ liệu khuôn mặt' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!Array.isArray(descriptor) || descriptor.length === 0) {
            return res.status(400).json({ success: false, message: 'Dữ liệu khuôn mặt không hợp lệ' });
        }

        const [faces] = await db.query(`
            SELECT ef.user_id, ef.face_descriptor, u.full_name, u.avatar, u.role
            FROM employee_faces ef
            JOIN users u ON u.id = ef.user_id
        `);

        let bestMatch = null;
        let bestDistance = Infinity;

        for (const row of faces) {
            const storedDescriptor = JSON.parse(row.face_descriptor);
            const distance = euclideanDistance(descriptor, storedDescriptor);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = row;
            }
        }

        if (!bestMatch || bestDistance > MATCH_THRESHOLD) {
            return res.status(404).json({
                success: false,
                message: 'Không nhận diện được khuôn mặt trùng khớp trong hệ thống',
                distance: bestDistance === Infinity ? null : bestDistance
            });
        }

        const [recent] = await db.query(
            `SELECT id FROM attendance_logs
             WHERE user_id = ? AND check_in_time > (NOW() - INTERVAL 1 MINUTE)
             ORDER BY check_in_time DESC LIMIT 1`,
            [bestMatch.user_id]
        );

        if (recent.length > 0) {
            return res.json({
                success: true,
                duplicate: true,
                message: `${bestMatch.full_name} vừa điểm danh rồi, không ghi nhận thêm`,
                data: { full_name: bestMatch.full_name, avatar: bestMatch.avatar, role: bestMatch.role }
            });
        }

        await db.query(
            'INSERT INTO attendance_logs (user_id, match_distance) VALUES (?, ?)',
            [bestMatch.user_id, bestDistance]
        );

        res.json({
            success: true,
            duplicate: false,
            message: `Điểm danh thành công: ${bestMatch.full_name}`,
            data: {
                user_id: bestMatch.user_id,
                full_name: bestMatch.full_name,
                avatar: bestMatch.avatar,
                role: bestMatch.role,
                distance: bestDistance,
                time: new Date()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAttendanceHistory = async (req, res) => {
    try {
        const { userId, fromDate, toDate } = req.query;

        let query = `
            SELECT a.id, a.user_id, a.check_in_time, a.match_distance,
                   u.full_name, u.role, u.avatar
            FROM attendance_logs a
            JOIN users u ON u.id = a.user_id
            WHERE 1 = 1
        `;
        const params = [];

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }
        if (fromDate) {
            query += ' AND a.check_in_time >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            query += ' AND a.check_in_time <= ?';
            params.push(toDate);
        }

        query += ' ORDER BY a.check_in_time DESC LIMIT 500';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};