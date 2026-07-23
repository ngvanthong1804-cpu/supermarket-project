import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import orderApi from '../../api/order.api';
import voucherApi from '../../api/voucher.api';
import { Tag } from 'lucide-react';
import AddressSelector from '../../components/common/AddressSelector';
import { formatAddress, emptyAddress } from '../../utils/address';
import BankQRCode from '../../components/common/BankQRCode';
import userAddressApi from '../../api/userAddress.api';
import { MapPin, Plus } from 'lucide-react';

export default function Checkout() {
    const { items, total, fetchCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: user?.phone || '',
        payment_method: 'cod',
        note: '',
    });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [address, setAddress] = useState(emptyAddress);

    useEffect(() => {
        loadSavedAddresses();
    }, []);

    const loadSavedAddresses = async () => {
        try {
            const res = await userAddressApi.getAll();
            setSavedAddresses(res.data);
            const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else {
                setUseNewAddress(true); // chưa có địa chỉ nào -> bắt buộc nhập mới
            }
        } catch (err) {
            console.error(err);
        }
    };
    const [loading, setLoading] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherApplied, setVoucherApplied] = useState(null); // { voucher_id, code, discount }
    const [voucherLoading, setVoucherLoading] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        // Nếu giỏ hàng trống thì đá về trang chủ
        if (items.length === 0 && !loading) {
            const timer = setTimeout(() => {
                if (items.length === 0) navigate('/cart');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [items]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        try {
            const res = await voucherApi.check({ code: voucherCode.trim(), order_value: total });
            setVoucherApplied(res.data);
            toast.success(`Áp dụng mã "${res.data.code}" thành công!`);
        } catch (err) {
            setVoucherApplied(null);
            toast.error(err.message || 'Mã voucher không hợp lệ');
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let shippingAddressText = '';
        let finalPhone = form.phone;

        if (useNewAddress) {
            if (!address.province || !address.ward || !address.detail.trim()) {
                toast.error('Vui lòng chọn đầy đủ địa chỉ giao hàng');
                return;
            }
            shippingAddressText = formatAddress(address);
        } else {
            const chosen = savedAddresses.find((a) => a.id === selectedAddressId);
            if (!chosen) {
                toast.error('Vui lòng chọn 1 địa chỉ giao hàng');
                return;
            }
            shippingAddressText = `${chosen.address_detail}, ${chosen.ward_name}, ${chosen.province_name}`;
            finalPhone = chosen.phone;
        }

        setLoading(true);
        try {
            const payload = { ...form, phone: finalPhone, shipping_address: shippingAddressText };
            if (voucherApplied) {
                payload.voucher_id = voucherApplied.voucher_id;
                payload.discount_amount = voucherApplied.discount;
            }
            const res = await orderApi.create(payload);
            toast.success('Đặt hàng thành công!');
            navigate(`/orders/${res.data.order_id}`);
        } catch (err) {
            toast.error(err.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-xl font-bold mb-2">Thông tin giao hàng</h2>

                <div>
                    <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng</label>

                    {savedAddresses.length > 0 && !useNewAddress && (
                        <div className="space-y-2 mb-3">
                            {savedAddresses.map((a) => (
                                <label
                                    key={a.id}
                                    className={`flex items-start gap-2 border rounded-md p-3 cursor-pointer ${
                                        selectedAddressId === a.id ? 'border-green-600 bg-green-50' : ''
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="saved_address"
                                        checked={selectedAddressId === a.id}
                                        onChange={() => setSelectedAddressId(a.id)}
                                        className="mt-1"
                                    />
                                    <div className="text-sm">
                                        <p className="font-medium flex items-center gap-2">
                                            <MapPin size={14} /> {a.receiver_name} - {a.phone}
                                            {a.is_default === 1 && (
                                                <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Mặc định</span>
                                            )}
                                        </p>
                                        <p className="text-gray-500 mt-0.5">
                                            {a.address_detail}, {a.ward_name}, {a.province_name}
                                        </p>
                                    </div>
                                </label>
                            ))}
                            <button
                                type="button"
                                onClick={() => setUseNewAddress(true)}
                                className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                            >
                                <Plus size={14} /> Dùng địa chỉ khác
                            </button>
                        </div>
                    )}

                    {(useNewAddress || savedAddresses.length === 0) && (
                        <div>
                            <AddressSelector value={address} onChange={setAddress} />
                            {savedAddresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setUseNewAddress(false)}
                                    className="text-sm text-gray-500 hover:underline mt-2"
                                >
                                    ← Chọn lại từ sổ địa chỉ
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
                    <select
                        name="payment_method"
                        value={form.payment_method}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                        <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                    </select>

                    {form.payment_method === 'bank_transfer' && (
                        <div className="mt-3">
                            <BankQRCode
                                amount={total - (voucherApplied?.discount || 0)}
                                orderInfo={`Thanh toan don hang ${Date.now()}`}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú (tùy chọn)</label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ví dụ: Giao giờ hành chính..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </button>
            </form>

            <div className="bg-white rounded-lg shadow p-5 h-fit">
                <h3 className="font-bold text-lg mb-4">Đơn hàng của bạn</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                        const price = item.discount_price || item.price;
                        return (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {item.name} x{item.quantity}
                                </span>
                                <span className="font-medium">
                                    {Number(price * item.quantity).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Ô nhập mã voucher */}
                <div className="border-t pt-3 mt-3">
                    <label className="text-sm font-medium flex items-center gap-1 mb-2">
                        <Tag size={14} /> Mã giảm giá
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã voucher"
                            className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            type="button"
                            onClick={handleApplyVoucher}
                            disabled={voucherLoading}
                            className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-900 disabled:opacity-50"
                        >
                            {voucherLoading ? '...' : 'Áp dụng'}
                        </button>
                    </div>
                    {voucherApplied && (
                        <p className="text-xs text-green-600 mt-1">
                            ✓ Đã giảm {Number(voucherApplied.discount).toLocaleString('vi-VN')}đ
                        </p>
                    )}
                </div>

                <div className="flex justify-between text-gray-600 mt-3">
                    <span>Tạm tính</span>
                    <span>{Number(total).toLocaleString('vi-VN')}đ</span>
                </div>
                {voucherApplied && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{Number(voucherApplied.discount).toLocaleString('vi-VN')}đ</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                        {Number(total - (voucherApplied?.discount || 0)).toLocaleString('vi-VN')}đ
                    </span>
                </div>
            </div>
        </div>
    );
}