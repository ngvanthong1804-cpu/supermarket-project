import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import supplierApi from '../../api/supplier.api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', address: '' };

export default function SupplierManage() {
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        const res = await supplierApi.getAll();
        setSuppliers(res.data);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '' });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await supplierApi.update(editing.id, form);
                toast.success('Cập nhật thành công');
            } else {
                await supplierApi.create(form);
                toast.success('Tạo nhà cung cấp thành công');
            }
            setShowForm(false);
            loadSuppliers();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa nhà cung cấp này?')) return;
        try {
            await supplierApi.delete(id);
            toast.success('Đã xóa');
            loadSuppliers();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý nhà cung cấp</h1>
                <button onClick={openCreate} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <Plus size={18} /> Thêm nhà cung cấp
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[650px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Tên</th>
                            <th className="p-3">SĐT</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Địa chỉ</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((s) => (
                            <tr key={s.id} className="border-t">
                                <td className="p-3 font-medium">{s.name}</td>
                                <td className="p-3">{s.phone || '—'}</td>
                                <td className="p-3">{s.email || '—'}</td>
                                <td className="p-3 text-gray-500">{s.address || '—'}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                        <Pencil size={14} /> Sửa
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline inline-flex items-center gap-1">
                                        <Trash2 size={14} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên nhà cung cấp</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                {editing ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}