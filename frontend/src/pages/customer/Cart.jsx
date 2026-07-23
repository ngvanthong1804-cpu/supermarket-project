import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { Trash2, Minus, Plus } from 'lucide-react';

export default function Cart() {
    const { items, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    if (loading) return <p className="text-center py-10 text-gray-500">Đang tải giỏ hàng...</p>;

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
                <Link to="/" className="text-green-600 font-medium hover:underline">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
                {items.map((item) => {
                    const price = item.discount_price || item.price;
                    return (
                        <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                            <img
                                src={item.image || 'https://via.placeholder.com/80'}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800">{item.name}</h3>
                                <p className="text-green-600 font-bold mt-1">
                                    {Number(price).toLocaleString('vi-VN')}đ / {item.unit}
                                </p>
                            </div>

                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-lg shadow p-5 h-fit">
                <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
                <div className="flex justify-between text-gray-600 mb-2">
                    <span>Tạm tính</span>
                    <span>{Number(total).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{Number(total).toLocaleString('vi-VN')}đ</span>
                </div>
                <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition mt-5"
                >
                    Tiến hành thanh toán
                </button>
            </div>
        </div>
    );
}