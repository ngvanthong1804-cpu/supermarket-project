// Chạy 1 lần duy nhất để tải dữ liệu Tỉnh/Phường-Xã về MySQL, không cần chạy lại khi demo.
// Cách chạy: cd backend && node scripts/seedAddress.js
//
// Lưu ý: Từ giữa 2025, Việt Nam đã bỏ cấp Quận/Huyện (sáp nhập hành chính),
// nên API provinces.open-api.vn hiện chỉ còn 2 cấp: Tỉnh/Thành phố -> Phường/Xã.

require('dotenv').config();
const mysql = require('mysql2/promise');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log('Đang tải danh sách tỉnh/thành...');
    const provincesRes = await fetch('https://provinces.open-api.vn/api/v2/p/');
    if (!provincesRes.ok) throw new Error('Không tải được danh sách tỉnh/thành');
    const provinces = await provincesRes.json();
    console.log(`Tải thành công ${provinces.length} tỉnh/thành.`);

    for (const p of provinces) {
        await connection.query(
            'INSERT INTO provinces (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
            [p.code, p.name]
        );

        const detailRes = await fetch(`https://provinces.open-api.vn/api/v2/p/${p.code}?depth=2`);
        if (!detailRes.ok) {
            console.error(`  ⚠ Lỗi khi tải phường/xã của "${p.name}", bỏ qua.`);
            continue;
        }
        const detail = await detailRes.json();
        const wards = detail.wards || [];

        for (const w of wards) {
            await connection.query(
                'INSERT INTO wards (code, name, province_code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
                [w.code, w.name, p.code]
            );
        }

        console.log(`✓ Đã lưu: ${p.name} (${wards.length} phường/xã)`);
        await sleep(50);
    }

    console.log('✅ Hoàn tất! Dữ liệu địa chỉ đã sẵn sàng dùng offline.');
    await connection.end();
}

main().catch((err) => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});