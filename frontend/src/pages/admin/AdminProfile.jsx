import { useState } from 'react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import userApi from '../../api/user.api';
import { User } from 'lucide-react';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

export default function AdminProfile() {
    const { user, login, token } = useAuthStore();
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updateProfile(form);
            const updatedUser = { ...user, ...form };
            login(updatedUser, token);
            toast.success('Cập nhật thông tin thành công');
        } catch (err) {
            toast.error(err.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold">{user?.full_name}</h1>
                    <p className="text-gray-500 text-sm">
                        {user?.email} — {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên</label>
                    <input
                        name="full_name" value={form.full_name} onChange={handleChange} required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                        name="phone" value={form.phone} onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                    <input
                        name="address" value={form.address} onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <button
                    type="submit" disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>

            <div className="mt-6">
                <ChangePasswordForm />
            </div>
        </div>
    );
}