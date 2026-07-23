export default function PosReceipt({ order, items, customerInfo, staffName }) {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <div id="pos-receipt-print" className="hidden print:block p-4 text-black font-mono text-sm w-80">
            <div className="text-center mb-3">
                <p className="font-bold text-lg">SUPERMART</p>
                <p className="text-xs">Siêu thị trực tuyến</p>
                <p className="text-xs">Hóa đơn bán hàng tại quầy</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <p>Mã đơn: #{order?.order_id}</p>
            <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
            <p>Nhân viên bán hàng: {staffName || '-'}</p>
            <p>Khách hàng: {customerInfo || 'Khách vãng lai'}</p>
            <hr className="border-dashed border-black my-2" />
            {items.map((item) => (
                <div key={item.product_id} className="mb-1">
                    <p>{item.name}</p>
                    <div className="flex justify-between text-xs">
                        <span>{Number(item.price).toLocaleString('vi-VN')}đ x {item.quantity}</span>
                        <span>{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            ))}
            <hr className="border-dashed border-black my-2" />
            <div className="flex justify-between font-bold text-base">
                <span>TỔNG CỘNG</span>
                <span>{Number(total).toLocaleString('vi-VN')}đ</span>
            </div>
            <p className="text-center text-xs mt-3">Cảm ơn quý khách!</p>
        </div>
    );
}