// Script test nhanh - chỉ in ra dữ liệu thô của 1 tỉnh để xem đúng cấu trúc JSON
// Cách chạy: cd backend && node scripts/testAddress.js

async function main() {
    console.log('Đang gọi API...');
    const res = await fetch('https://provinces.open-api.vn/api/v2/p/');
    const provinces = await res.json();
    console.log('Tổng số tỉnh:', provinces.length);
    console.log('Tỉnh đầu tiên:', JSON.stringify(provinces[0]));

    const firstCode = provinces[0].code;
    console.log('\nGọi chi tiết tỉnh code =', firstCode);

    const res2 = await fetch(`https://provinces.open-api.vn/api/v2/p/${firstCode}?depth=2`);
    console.log('Status:', res2.status);
    const detail = await res2.json();
    console.log('\nTOÀN BỘ JSON TRẢ VỀ:');
    console.log(JSON.stringify(detail, null, 2));
}

main().catch((err) => console.error('LỖI:', err.message));