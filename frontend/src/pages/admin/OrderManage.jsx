import { useEffect, useState } from 'react';
import adminApi from '../../api/admin.api';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';

const statusLabels = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function OrderManage() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadOrders();
    }, [filter]);

    const loadOrders = async () => {
        const res = await adminApi.getAllOrders(filter ? { status: filter } : {});
        setOrders(res.data);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminApi.updateOrderStatus(id, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            loadOrders();
        } catch (err) {
            toast.error(err.message || 'Cập nhật thất bại');
        }
    };

    const handleDownloadInvoice = async (id) => {
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                    <option value="">Tất cả trạng thái</option>
                    {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Mã đơn</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Tổng tiền</th>
                            <th className="p-3">Ngày đặt</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3 text-right">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id} className="border-t">
                                <td className="p-3 font-medium">#{o.id}</td>
                                <td className="p-3">{o.full_name}<br /><span className="text-gray-400 text-xs">{o.email}</span></td>
                                <td className="p-3">{Number(o.total_amount).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 text-gray-500">{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.order_status]}`}>
                                        {statusLabels[o.order_status]}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <select
                                            value={o.order_status}
                                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                            className="border rounded-md px-2 py-1 text-xs"
                                        >
                                            {Object.entries(statusLabels).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDownloadInvoice(o.id)}
                                            title="Tải hóa đơn PDF"
                                            className="text-gray-500 hover:text-green-600"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}