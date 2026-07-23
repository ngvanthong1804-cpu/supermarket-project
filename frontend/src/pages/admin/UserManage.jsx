import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import userApi from '../../api/user.api';
import { Plus, Lock, Unlock, X } from 'lucide-react';

const roleLabels = { admin: 'Admin', staff: 'Nhân viên', customer: 'Khách hàng' };
const roleColors = {
    admin: 'bg-red-100 text-red-700',
    staff: 'bg-blue-100 text-blue-700',
    customer: 'bg-gray-100 text-gray-700',
};

export default function UserManage() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'staff' });

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const loadUsers = async () => {
        const res = await userApi.getAll(filter ? { role: filter } : {});
        setUsers(res.data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await userApi.create(form);
            toast.success('Tạo tài khoản thành công');
            setShowForm(false);
            setForm({ full_name: '', email: '', password: '', phone: '', role: 'staff' });
            loadUsers();
        } catch (err) {
            toast.error(err.message || 'Tạo tài khoản thất bại');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await userApi.toggleStatus(id);
            loadUsers();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                <div className="flex gap-3">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                        <option value="">Tất cả quyền</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Nhân viên</option>
                        <option value="customer">Khách hàng</option>
                    </select>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        <Plus size={18} /> Thêm nhân viên
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Họ tên</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">SĐT</th>
                            <th className="p-3">Quyền</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t">
                                <td className="p-3 font-medium">{u.full_name}</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3">{u.phone || '—'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${roleColors[u.role]}`}>
                                        {roleLabels[u.role]}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {u.status ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    {u.role !== 'admin' && (
                                        <button
                                            onClick={() => handleToggleStatus(u.id)}
                                            className={`inline-flex items-center gap-1 hover:underline ${u.status ? 'text-red-600' : 'text-green-600'}`}
                                        >
                                            {u.status ? <><Lock size={14} /> Khóa</> : <><Unlock size={14} /> Mở khóa</>}
                                        </button>
                                    )}
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
                        <h2 className="text-lg font-bold mb-4">Thêm tài khoản nhân viên</h2>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quyền</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-md px-3 py-2">
                                    <option value="staff">Nhân viên</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                Tạo tài khoản
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}