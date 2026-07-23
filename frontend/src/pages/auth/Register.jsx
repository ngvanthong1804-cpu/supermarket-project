import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/auth.api';
import AddressSelector from '../../components/common/AddressSelector';
import { formatAddress, emptyAddress } from '../../utils/address';

export default function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
    const [address, setAddress] = useState(emptyAddress);
    const [showAddress, setShowAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form };
            if (address.province && address.district && address.ward && address.detail.trim()) {
                payload.address = formatAddress(address);
            }
            await authApi.register(payload);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
                    Đăng ký tài khoản
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Họ và tên</label>
                    <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowAddress((s) => !s)}
                        className="text-sm text-green-600 hover:underline mb-2"
                    >
                        {showAddress ? '− Ẩn địa chỉ giao hàng' : '+ Thêm địa chỉ giao hàng (tùy chọn)'}
                    </button>
                    {showAddress && <AddressSelector value={address} onChange={setAddress} />}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>

                <p className="text-center text-sm mt-4">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-green-600 font-medium">
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </div>
    );
}