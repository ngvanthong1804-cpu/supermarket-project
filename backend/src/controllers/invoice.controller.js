const db = require('../config/db');
const PDFDocument = require('pdfkit');
const path = require('path');

const FONT_REGULAR = path.join(__dirname, '../../node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, '../../node_modules/dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf');

const statusLabels = {
    pending: 'Cho xac nhan', confirmed: 'Da xac nhan',
    shipping: 'Dang giao hang', completed: 'Hoan thanh', cancelled: 'Da huy',
};

// Xuất hóa đơn PDF cho 1 đơn hàng
exports.exportInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        let query = `
            SELECT o.*, u.full_name, u.email, s.full_name AS staff_name
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            LEFT JOIN users s ON o.staff_id = s.id
            WHERE o.id = ?
        `;
        const params = [id];
        if (role === 'customer') {
            query += ' AND o.user_id = ?';
            params.push(userId);
        }

        const [orders] = await db.query(query, params);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        const order = orders[0];
        // Đơn bán tại quầy (khách vãng lai) không có tài khoản -> lấy tên/thông tin từ walkin_*
        if (!order.full_name) {
            order.full_name = order.walkin_name || 'Khách vãng lai';
            order.email = order.email || '-';
        }

        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

        // Tạo PDF
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        // Đăng ký font hỗ trợ tiếng Việt có dấu
        doc.registerFont('Regular', FONT_REGULAR);
        doc.registerFont('Bold', FONT_BOLD);
        doc.font('Regular');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=hoa-don-${id}.pdf`);
        doc.pipe(res);

        // Header
        doc.font('Bold').fontSize(20).fillColor('#16a34a').text('SUPERMART', { align: 'left' });
        doc.font('Regular').fontSize(10).fillColor('#666').text('Siêu thị trực tuyến - Tươi ngon mỗi ngày', { align: 'left' });
        doc.moveDown(1.5);

        doc.font('Bold').fontSize(16).fillColor('#000').text(`HÓA ĐƠN #${order.id}`, { align: 'center' });
        doc.moveDown();

        // Thông tin khách hàng
        doc.font('Regular').fontSize(11).fillColor('#000');
        doc.text(`Ngày đặt: ${new Date(order.created_at).toLocaleDateString('vi-VN')}`);
        doc.text(`Khách hàng: ${order.full_name}`);
        doc.text(`Email: ${order.email}`);
        doc.text(`SĐT: ${order.phone}`);
        doc.text(`Địa chỉ giao hàng: ${order.shipping_address}`);
        doc.text(`Trạng thái: ${statusLabels[order.order_status] || order.order_status}`);
        doc.text(`Phương thức thanh toán: ${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản'}`);
        if (order.staff_name) {
            doc.text(`Nhân viên xử lý: ${order.staff_name}`);
        }
        doc.moveDown();

        // Bảng sản phẩm
        const tableTop = doc.y;
        const col1 = 40, col2 = 280, col3 = 360, col4 = 440;

        doc.font('Bold').fontSize(10).fillColor('#fff');
        doc.rect(col1, tableTop, 515, 20).fill('#16a34a');
        doc.fillColor('#fff');
        doc.text('Sản phẩm', col1 + 5, tableTop + 5);
        doc.text('Đơn giá', col2, tableTop + 5);
        doc.text('SL', col3, tableTop + 5);
        doc.text('Thành tiền', col4, tableTop + 5);

        let y = tableTop + 25;
        doc.font('Regular').fillColor('#000').fontSize(10);

        items.forEach((item, idx) => {
            const rowColor = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
            doc.rect(col1, y - 3, 515, 20).fill(rowColor);
            doc.fillColor('#000');
            doc.text(item.product_name, col1 + 5, y, { width: 230 });
            doc.text(`${Number(item.price).toLocaleString('vi-VN')}đ`, col2, y);
            doc.text(`${item.quantity}`, col3, y);
            doc.text(`${Number(item.price * item.quantity).toLocaleString('vi-VN')}đ`, col4, y);
            y += 22;
        });

        doc.moveTo(col1, y).lineTo(555, y).strokeColor('#ddd').stroke();
        y += 15;

        doc.font('Bold').fontSize(12).fillColor('#16a34a');
        doc.text(`TỔNG CỘNG: ${Number(order.total_amount).toLocaleString('vi-VN')}đ`, col1, y, { align: 'right', width: 515 });

        doc.moveDown(3);
        doc.font('Regular').fontSize(9).fillColor('#999').text('Cảm ơn quý khách đã mua hàng tại SuperMart!', { align: 'center' });

        doc.end();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};