import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/auth.api';
import { KeyRound } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [form, setForm] = useState({ new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Liên kết không hợp lệ');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            toast.error('Mật khẩu nhập lại không khớp');
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword({ token, new_password: form.new_password });
            toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Liên kết đã hết hạn hoặc không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                    <p className="text-red-600 font-medium">Liên kết không hợp lệ hoặc thiếu token.</p>
                    <Link to="/forgot-password" className="text-green-600 font-medium hover:underline mt-4 inline-block">
                        Yêu cầu liên kết mới
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <KeyRound className="mx-auto text-green-600 mb-2" size={40} />
                    <h2 className="text-xl font-bold">Đặt lại mật khẩu</h2>
                    <p className="text-gray-500 text-sm mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={form.new_password}
                            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                            required
                            minLength={6}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            value={form.confirm_password}
                            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                            required
                            minLength={6}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}