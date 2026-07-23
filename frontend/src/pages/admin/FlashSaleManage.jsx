import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import productApi from '../../api/product.api';
import { Zap, Plus, X, Clock } from 'lucide-react';

function timeRemaining(endTime) {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Đã hết hạn';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)} ngày ${hours % 24} giờ`;
    return `${hours} giờ ${minutes} phút`;
}

export default function FlashSaleManage() {
    const [flashProducts, setFlashProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [discountPercent, setDiscountPercent] = useState(20);
    const [endTime, setEndTime] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        loadFlashSales();
        loadProducts();
        const interval = setInterval(loadFlashSales, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadFlashSales = async () => {
        const res = await productApi.getFlashSaleList();
        setFlashProducts(res.data);
    };

    const loadProducts = async () => {
        const res = await productApi.getAll({ limit: 200 });
        setAllProducts(res.data);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 sản phẩm');
            return;
        }
        if (!endTime) {
            toast.error('Vui lòng chọn thời gian kết thúc');
            return;
        }
        try {
            await productApi.createFlashSale({
                product_ids: selectedIds,
                discount_percent: discountPercent,
                end_time: endTime,
            });
            toast.success('Đã tạo Flash Sale thành công');
            setShowForm(false);
            setSelectedIds([]);
            setEndTime('');
            loadFlashSales();
        } catch (err) {
            toast.error(err.message || 'Tạo Flash Sale thất bại');
        }
    };

    const handleEnd = async (id) => {
        if (!confirm('Kết thúc sớm Flash Sale cho sản phẩm này?')) return;
        try {
            await productApi.endFlashSale(id);
            toast.success('Đã kết thúc Flash Sale');
            loadFlashSales();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const filteredProducts = allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="text-orange-500" size={24} /> Flash Sale
                </h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                >
                    <Plus size={18} /> Tạo Flash Sale
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3">Giá gốc</th>
                            <th className="p-3">Giá Flash Sale</th>
                            <th className="p-3">Còn lại</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flashProducts.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-3 flex items-center gap-2">
                                    <img src={p.image || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded object-cover" />
                                    {p.name}
                                </td>
                                <td className="p-3 text-gray-400 line-through">{Number(p.price).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 text-orange-600 font-medium">{Number(p.discount_price).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 flex items-center gap-1 text-gray-600">
                                    <Clock size={12} /> {timeRemaining(p.flash_sale_end)}
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleEnd(p.id)} className="text-red-600 hover:underline text-xs">
                                        Kết thúc sớm
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {flashProducts.length === 0 && (
                    <p className="text-center text-gray-400 py-10">Chưa có Flash Sale nào đang diễn ra.</p>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Tạo Flash Sale mới</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phần trăm giảm giá</label>
                                    <input
                                        type="number" min={1} max={90} required
                                        value={discountPercent}
                                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                        className="w-full border rounded-md px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kết thúc lúc</label>
                                    <input
                                        type="datetime-local" required
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Chọn sản phẩm ({selectedIds.length} đã chọn)
                                </label>
                                <input
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="Tìm sản phẩm..."
                                    className="w-full border rounded-md px-3 py-2 mb-2 text-sm"
                                />
                                <div className="border rounded-md max-h-56 overflow-y-auto">
                                    {filteredProducts.map((p) => (
                                        <label
                                            key={p.id}
                                            className="flex items-center gap-2 px-3 py-2 border-b hover:bg-gray-50 cursor-pointer text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                            <img src={p.image || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded object-cover" />
                                            <span className="flex-1">{p.name}</span>
                                            <span className="text-gray-400">{Number(p.price).toLocaleString('vi-VN')}đ</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600">
                                Kích hoạt Flash Sale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}