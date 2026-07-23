import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login(form);
            login(res.data.user, res.data.token);
            toast.success('Đăng nhập thành công!');

            // Điều hướng theo role
            if (res.data.user.role === 'admin' || res.data.user.role === 'staff') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-line"
            >
                <h2 className="text-2xl font-display italic font-semibold mb-6 text-center text-primary">
                    Đăng nhập
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium">Mật khẩu</label>
                        <Link to="/forgot-password" className="text-xs text-green-600 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-canvas py-2.5 rounded-full font-medium hover:bg-primary-dark transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>

                <p className="text-center text-sm mt-4 text-ink/60">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-accent font-medium">
                        Đăng ký ngay
                    </Link>
                </p>
            </form>
        </div>
    );
}