import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import voucherApi from '../../api/voucher.api';
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

const emptyForm = {
    code: '', discount_percent: '', discount_amount: '',
    min_order_value: '', quantity: '', expired_at: '',
};

export default function VoucherManage() {
    const [vouchers, setVouchers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        const res = await voucherApi.getAll();
        setVouchers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await voucherApi.create({
                ...form,
                discount_percent: form.discount_percent || null,
                discount_amount: form.discount_amount || null,
                expired_at: form.expired_at || null,
            });
            toast.success('Tạo voucher thành công');
            setShowForm(false);
            setForm(emptyForm);
            loadVouchers();
        } catch (err) {
            toast.error(err.message || 'Tạo voucher thất bại');
        }
    };

    const handleToggle = async (id) => {
        try {
            await voucherApi.toggleStatus(id);
            loadVouchers();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa voucher này?')) return;
        try {
            await voucherApi.delete(id);
            toast.success('Đã xóa voucher');
            loadVouchers();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý voucher</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <Plus size={18} /> Thêm voucher
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Mã</th>
                            <th className="p-3">Giảm giá</th>
                            <th className="p-3">Đơn tối thiểu</th>
                            <th className="p-3">Số lượng còn</th>
                            <th className="p-3">Hạn dùng</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((v) => (
                            <tr key={v.id} className="border-t">
                                <td className="p-3 font-mono font-medium">{v.code}</td>
                                <td className="p-3">
                                    {v.discount_percent ? `${v.discount_percent}%` : `${Number(v.discount_amount).toLocaleString('vi-VN')}đ`}
                                </td>
                                <td className="p-3">{Number(v.min_order_value).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3">{v.quantity}</td>
                                <td className="p-3 text-gray-500">
                                    {v.expired_at ? new Date(v.expired_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                                </td>
                                <td className="p-3">
                                    <button onClick={() => handleToggle(v.id)} className="flex items-center gap-1">
                                        {v.status ? (
                                            <ToggleRight className="text-green-600" size={22} />
                                        ) : (
                                            <ToggleLeft className="text-gray-400" size={22} />
                                        )}
                                    </button>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline inline-flex items-center gap-1">
                                        <Trash2 size={14} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Thêm voucher</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã voucher</label>
                                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-md px-3 py-2" placeholder="SALE50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giảm % (hoặc để trống)</label>
                                    <input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value, discount_amount: '' })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giảm tiền (hoặc để trống)</label>
                                    <input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value, discount_percent: '' })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu</label>
                                <input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số lượng mã</label>
                                <input type="number" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày hết hạn (tùy chọn)</label>
                                <input type="date" value={form.expired_at} onChange={(e) => setForm({ ...form, expired_at: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                Tạo voucher
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}