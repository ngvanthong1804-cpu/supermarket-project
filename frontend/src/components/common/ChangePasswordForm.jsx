import { useState } from 'react';
import { toast } from 'react-toastify';
import userApi from '../../api/user.api';
import { KeyRound } from 'lucide-react';

export default function ChangePasswordForm() {
    const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.new_password !== form.confirm_password) {
            toast.error('Mật khẩu mới nhập lại không khớp');
            return;
        }
        setLoading(true);
        try {
            await userApi.changePassword({
                current_password: form.current_password,
                new_password: form.new_password,
            });
            toast.success('Đổi mật khẩu thành công');
            setForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            toast.error(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="font-bold flex items-center gap-2">
                <KeyRound size={18} /> Đổi mật khẩu
            </h2>
            <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
                <input
                    type="password" name="current_password" value={form.current_password}
                    onChange={handleChange} required
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                <input
                    type="password" name="new_password" value={form.new_password}
                    onChange={handleChange} required minLength={6}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu mới</label>
                <input
                    type="password" name="confirm_password" value={form.confirm_password}
                    onChange={handleChange} required minLength={6}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <button
                type="submit" disabled={loading}
                className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition disabled:opacity-50"
            >
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
        </form>
    );
}