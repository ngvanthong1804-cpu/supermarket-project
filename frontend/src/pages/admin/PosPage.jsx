import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import productApi from '../../api/product.api';
import posApi from '../../api/pos.api';
import PosReceipt from '../../components/admin/PosReceipt';
import BankQRCode from '../../components/common/BankQRCode';
import { Search, Plus, Minus, Trash2, User, X, Printer, Camera } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { ScanLine, Percent } from 'lucide-react';
import BarcodeScannerModal from '../../components/admin/BarcodeScannerModal';

export default function PosPage() {
    const { user } = useAuthStore();
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]); // [{product_id, name, price, basePrice, quantity, stock}]
    const [barcodeInput, setBarcodeInput] = useState('');
    const [scannerOpen, setScannerOpen] = useState(false);

    const [customerKeyword, setCustomerKeyword] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [walkinName, setWalkinName] = useState('');
    const [walkinPhone, setWalkinPhone] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [submitting, setSubmitting] = useState(false);
    const [lastOrder, setLastOrder] = useState(null); // dùng cho việc in hóa đơn sau khi tạo

    useEffect(() => {
        searchProducts();
    }, [keyword]);

    const searchProducts = async () => {
        const res = await productApi.getAll({ keyword, limit: 12 });
        setProducts(res.data);
    };

    const handleSearchCustomer = async (val) => {
        setCustomerKeyword(val);
        if (val.trim().length < 3) {
            setCustomerResults([]);
            return;
        }
        const res = await posApi.searchCustomer(val.trim());
        setCustomerResults(res.data);
    };

    const addToCart = (product) => {
        const price = product.discount_price || product.price;
        setCart((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error('Đã đạt số lượng tồn kho tối đa');
                    return prev;
                }
                return prev.map((i) =>
                    i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { product_id: product.id, name: product.name, price, basePrice: price, quantity: 1, stock: product.stock }];
        });
    };

    // Quét mã vạch (dùng được với máy quét USB - hoạt động như bàn phím gõ nhanh + Enter)
    const lookupBarcode = async (code) => {
        if (!code) return;
        try {
            const res = await productApi.getByBarcode(code);
            addToCart(res.data);
            toast.success(`Đã thêm: ${res.data.name}`);
        } catch (err) {
            toast.error(err.message || 'Không tìm thấy sản phẩm với mã vạch này');
        }
    };

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;
        setBarcodeInput('');
        await lookupBarcode(code);
    };

    const handleCameraScan = async (code) => {
        setScannerOpen(false);
        await lookupBarcode(code.trim());
    };

    // Sửa giá bán cho 1 dòng sản phẩm (giảm giá riêng ngay tại quầy, không vượt quá giá gốc)
    const updateItemPrice = (productId, newPrice) => {
        setCart((prev) =>
            prev.map((i) => {
                if (i.product_id !== productId) return i;
                const price = Math.max(0, Math.min(Number(newPrice) || 0, i.basePrice));
                return { ...i, price };
            })
        );
    };

    const updateQty = (productId, delta) => {
        setCart((prev) =>
            prev
                .map((i) => {
                    if (i.product_id !== productId) return i;
                    const newQty = i.quantity + delta;
                    if (newQty > i.stock) {
                        toast.error('Đã đạt số lượng tồn kho tối đa');
                        return i;
                    }
                    return { ...i, quantity: newQty };
                })
                .filter((i) => i.quantity > 0)
        );
    };

    const removeItem = (productId) => {
        setCart((prev) => prev.filter((i) => i.product_id !== productId));
    };

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Chưa có sản phẩm nào trong đơn');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity, custom_price: i.price })),
                payment_method: paymentMethod,
                customer_id: selectedCustomer?.id || null,
                walkin_name: selectedCustomer ? null : walkinName,
                walkin_phone: selectedCustomer ? null : walkinPhone,
            };
            const res = await posApi.createOrder(payload);
            toast.success('Thanh toán thành công!');
            setLastOrder({ order_id: res.data.order_id, items: cart });

            // Reset giỏ hàng cho đơn tiếp theo
            setCart([]);
            setSelectedCustomer(null);
            setWalkinName('');
            setWalkinPhone('');
            setCustomerKeyword('');
        } catch (err) {
            toast.error(err.message || 'Thanh toán thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Bán hàng tại quầy</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: tìm & chọn sản phẩm */}
                <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-3">
                        <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                            <input
                                autoFocus
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder="Quét mã vạch sản phẩm (hoặc gõ tay rồi Enter)..."
                                className="w-full border-2 border-primary/30 focus:border-primary rounded-md pl-9 pr-3 py-2.5 text-sm bg-primary-light/20"
                            />
                            <ScanLine size={16} className="absolute left-3 top-3 text-primary" />
                        </form>
                        <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            title="Quét bằng camera"
                            className="shrink-0 bg-primary text-white rounded-md px-3 flex items-center justify-center"
                        >
                            <Camera size={18} />
                        </button>
                    </div>

                    {scannerOpen && (
                        <BarcodeScannerModal
                            onScan={handleCameraScan}
                            onClose={() => setScannerOpen(false)}
                        />
                    )}

                    <div className="relative mb-4">
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Hoặc tìm sản phẩm theo tên..."
                            className="w-full border rounded-md pl-9 pr-3 py-2 text-sm"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {products.map((p) => {
                            const inCart = cart.find((i) => i.product_id === p.id)?.quantity || 0;
                            const remaining = p.stock - inCart;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    disabled={remaining <= 0}
                                    className="bg-white rounded-lg shadow p-3 text-left hover:shadow-md transition disabled:opacity-40"
                                >
                                    <img
                                        src={p.image || 'https://via.placeholder.com/150'}
                                        alt={p.name}
                                        className="w-full aspect-square object-cover rounded-md mb-2"
                                    />
                                    <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                                    <p className="text-sm font-bold text-green-600 mt-1">
                                        {Number(p.discount_price || p.price).toLocaleString('vi-VN')}đ
                                    </p>
                                    <p className={`text-[10px] ${remaining <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                        Còn {remaining}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cột phải: giỏ hàng tại quầy + thanh toán */}
                <div className="bg-white rounded-lg shadow p-4 h-fit sticky top-4">
                    <h2 className="font-bold mb-3">Đơn hàng hiện tại</h2>

                    {cart.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Chưa có sản phẩm nào</p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto mb-3">
                            {cart.map((item) => (
                                <div key={item.product_id} className="border-b pb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="flex-1">
                                            <p className="truncate">{item.name}</p>
                                            {item.price < item.basePrice && (
                                                <p className="text-[10px] text-gray-400 line-through">
                                                    {Number(item.basePrice).toLocaleString('vi-VN')}đ
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={() => updateQty(item.product_id, -1)} className="p-1 border rounded">
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.product_id, 1)} className="p-1 border rounded">
                                            <Plus size={12} />
                                        </button>
                                        <button onClick={() => removeItem(item.product_id)} className="text-red-500 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Percent size={11} className="text-accent shrink-0" />
                                        <input
                                            type="number"
                                            value={item.price}
                                            max={item.basePrice}
                                            min={0}
                                            onChange={(e) => updateItemPrice(item.product_id, e.target.value)}
                                            className="w-24 border rounded px-1.5 py-0.5 text-xs font-mono"
                                        />
                                        <span className="text-[10px] text-gray-400">
                                            đ/đơn giá (gốc {Number(item.basePrice).toLocaleString('vi-VN')}đ)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg border-t pt-3 mb-4">
                        <span>Tổng cộng</span>
                        <span className="text-green-600">{Number(total).toLocaleString('vi-VN')}đ</span>
                    </div>

                    {/* Tìm khách hàng có sẵn (tùy chọn) */}
                    <div className="mb-3">
                        <label className="text-xs font-medium flex items-center gap-1 mb-1">
                            <User size={12} /> Khách hàng (tùy chọn)
                        </label>
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-md px-2 py-1.5 text-xs">
                                <span>{selectedCustomer.full_name} - {selectedCustomer.phone}</span>
                                <button onClick={() => setSelectedCustomer(null)}><X size={14} /></button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    value={customerKeyword}
                                    onChange={(e) => handleSearchCustomer(e.target.value)}
                                    placeholder="Tìm theo SĐT hoặc email..."
                                    className="w-full border rounded-md px-2 py-1.5 text-xs"
                                />
                                {customerResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md shadow mt-1 max-h-32 overflow-y-auto">
                                        {customerResults.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setSelectedCustomer(c); setCustomerResults([]); }}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50"
                                            >
                                                {c.full_name} - {c.phone}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!selectedCustomer && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <input
                                value={walkinName}
                                onChange={(e) => setWalkinName(e.target.value)}
                                placeholder="Tên khách (tùy chọn)"
                                className="border rounded-md px-2 py-1.5 text-xs"
                            />
                            <input
                                value={walkinPhone}
                                onChange={(e) => setWalkinPhone(e.target.value)}
                                placeholder="SĐT (tùy chọn)"
                                className="border rounded-md px-2 py-1.5 text-xs"
                            />
                        </div>
                    )}

                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border rounded-md px-2 py-2 text-sm mb-3"
                    >
                        <option value="cod">Tiền mặt</option>
                        <option value="bank_transfer">Chuyển khoản</option>
                    </select>

                    {paymentMethod === 'bank_transfer' && cart.length > 0 && (
                        <div className="mb-3">
                            <BankQRCode amount={total} orderInfo={`Thanh toan tai quay ${Date.now()}`} />
                        </div>
                    )}

                    <button
                        onClick={handleCheckout}
                        disabled={submitting || cart.length === 0}
                        className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition disabled:opacity-50 mb-2"
                    >
                        {submitting ? 'Đang xử lý...' : 'Thanh toán'}
                    </button>

                    {lastOrder && (
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-1 border border-green-600 text-green-600 py-2 rounded-md hover:bg-green-50 transition text-sm"
                        >
                            <Printer size={16} /> In hóa đơn đơn #{lastOrder.order_id}
                        </button>
                    )}
                </div>
            </div>

            {/* Component chỉ hiện khi in (đã ẩn qua CSS print) */}
            {lastOrder && (
                <PosReceipt
                    order={lastOrder}
                    items={lastOrder.items}
                    customerInfo={selectedCustomer?.full_name || walkinName || 'Khách vãng lai'}
                    staffName={user?.full_name}
                />
            )}
        </div>
    );
}