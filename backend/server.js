const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Kiểm tra kết nối DB trước khi chạy server
db.query('SELECT 1')
    .then(() => {
        console.log('✅ Kết nối MySQL thành công!');
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
    });