export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 mt-10">
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-white font-bold text-lg mb-2">🛒 SuperMart</h3>
                    <p className="text-sm">Siêu thị trực tuyến — tươi ngon mỗi ngày, giao hàng tận nơi.</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-2">Liên hệ</h4>
                    <p className="text-sm">Hotline: 0363999939</p>
                    <p className="text-sm">Email: ngvanthong1804@gmail.com</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-2">Chính sách</h4>
                    <p className="text-sm">Đổi trả hàng</p>
                    <p className="text-sm">Vận chuyển</p>
                </div>
            </div>
            <div className="text-center text-xs py-4 border-t border-gray-700">
                © 2026 SuperMart. Đồ án tốt nghiệp.
            </div>
        </footer>
    );
}