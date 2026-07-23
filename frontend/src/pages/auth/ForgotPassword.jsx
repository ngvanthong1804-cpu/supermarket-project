import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/auth.api';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            setSent(true);
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                {sent ? (
                    <div className="text-center">
                        <CheckCircle className="mx-auto text-green-600 mb-3" size={48} />
                        <h2 className="text-xl font-bold mb-2">Đã gửi email!</h2>
                        <p className="text-gray-500 text-sm">
                            Nếu email <span className="font-medium">{email}</span> tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới. Vui lòng kiểm tra hộp thư (kể cả mục Spam).
                        </p>
                        <Link to="/login" className="text-green-600 font-medium hover:underline mt-4 inline-block">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <Mail className="mx-auto text-green-600 mb-2" size={40} />
                            <h2 className="text-xl font-bold">Quên mật khẩu?</h2>
                            <p className="text-gray-500 text-sm mt-1">Nhập email để nhận liên kết đặt lại mật khẩu</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                            </button>
                        </form>
                        <p className="text-center text-sm mt-4">
                            <Link to="/login" className="text-green-600 font-medium">Quay lại đăng nhập</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}