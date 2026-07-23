import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderApi from '../../api/order.api';
import { CheckCircle, XCircle, Download } from 'lucide-react';

const statusLabels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const handleCancel = async () => {
        if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
        setCancelling(true);
        try {
            await orderApi.cancel(id);
            toast.success('Đã hủy đơn hàng thành công');
            loadOrder();
        } catch (err) {
            toast.error(err.message || 'Hủy đơn thất bại');
        } finally {
            setCancelling(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Tải hóa đơn thất bại');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hoa-don-${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Không thể tải hóa đơn');
        }
    };

    const loadOrder = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getById(id);
            setOrder(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center py-10 text-gray-500">Đang tải...</p>;
    if (!order) return <p className="text-center py-10 text-gray-500">Không tìm thấy đơn hàng</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={48} />
                <h2 className="text-xl font-bold">Đặt hàng thành công!</h2>
                <p className="text-gray-500">Mã đơn hàng: #{order.id}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-5 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Trạng thái</span>
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-green-600">
                            {statusLabels[order.order_status]}
                        </span>
                        {order.order_status === 'pending' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex items-center gap-1 text-red-600 text-sm hover:underline disabled:opacity-50"
                            >
                                <XCircle size={14} />
                                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Địa chỉ giao hàng</span>
                    <span className="font-medium text-right">{order.shipping_address}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Số điện thoại</span>
                    <span className="font-medium">{order.phone}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Phương thức thanh toán</span>
                    <span className="font-medium">
                        {order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5 mb-4">
                <h3 className="font-bold mb-3">Sản phẩm</h3>
                {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm mb-2">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span className="font-medium">
                            {Number(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                ))}
                <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                        {Number(order.total_amount).toLocaleString('vi-VN')}đ
                    </span>
                </div>
            </div>

            <button
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 py-2.5 rounded-md hover:bg-green-50 transition mb-3"
            >
                <Download size={18} /> Tải hóa đơn PDF
            </button>

            <Link
                to="/"
                className="block text-center bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition"
            >
                Tiếp tục mua sắm
            </Link>
        </div>
    );
}