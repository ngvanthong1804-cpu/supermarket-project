const jwt = require('jsonwebtoken');

// Middleware kiểm tra đã đăng nhập chưa (áp dụng cho Customer, Staff, Admin)
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // dạng: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Middleware kiểm tra quyền — dùng chung được cho mọi role
// Cách dùng: checkRole('admin') hoặc checkRole('admin', 'staff')
exports.checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này' });
        }
        next();
    };
};