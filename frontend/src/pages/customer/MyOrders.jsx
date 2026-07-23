import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderApi from '../../api/order.api';
import { User, Package, XCircle } from 'lucide-react';

const statusLabels = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await orderApi.getMyOrders();
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (e, orderId) => {
        e.preventDefault(); // tránh bị điều hướng do đang nằm trong Link
        e.stopPropagation();
        if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
        try {
            await orderApi.cancel(orderId);
            toast.success('Đã hủy đơn hàng thành công');
            loadOrders();
        } catch (err) {
            toast.error(err.message || 'Hủy đơn thất bại');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 mb-6">
                <Link to="/profile" className="px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50 flex items-center gap-1">
                    <User size={16} /> Thông tin cá nhân
                </Link>
                <Link to="/orders" className="px-4 py-2 rounded-md bg-green-600 text-white text-sm flex items-center gap-1">
                    <Package size={16} /> Đơn hàng của tôi
                </Link>
            </div>

            <h1 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h1>

            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-3">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/" className="text-green-600 font-medium hover:underline">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((o) => (
                        <Link
                            key={o.id}
                            to={`/orders/${o.id}`}
                            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Đơn hàng #{o.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.order_status]}`}>
                                    {statusLabels[o.order_status]}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>{new Date(o.created_at).toLocaleDateString('vi-VN')}</span>
                                <span className="font-bold text-green-600">
                                    {Number(o.total_amount).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                            {o.order_status === 'pending' && (
                                <button
                                    onClick={(e) => handleCancel(e, o.id)}
                                    className="mt-2 flex items-center gap-1 text-red-600 text-xs hover:underline"
                                >
                                    <XCircle size={12} /> Hủy đơn
                                </button>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}