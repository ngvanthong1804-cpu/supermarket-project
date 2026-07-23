import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, ChevronDown, LayoutDashboard, Package, Home, Heart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const menuRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(keyword.trim() ? `/?keyword=${encodeURIComponent(keyword.trim())}` : '/');
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate('/login');
    };

    const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

    return (
        <header className="bg-primary text-canvas sticky top-0 z-50 border-b-2 border-primary-dark">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <Link to="/" className="shrink-0">
                    <span className="font-display italic text-2xl font-semibold tracking-tight">
                        Super<span className="text-accent not-italic">Mart</span>
                    </span>
                    <p className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-primary-light/70 -mt-0.5">
                        Tươi mỗi ngày
                    </p>
                </Link>

                <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm cà chua, sữa, bánh mì..."
                        className="w-full px-4 py-2 rounded-full bg-white/95 text-ink focus:outline-none focus:ring-2 focus:ring-accent text-sm placeholder:text-ink/40"
                    />
                    <button type="submit" className="absolute right-3.5 top-2.5 text-primary">
                        <Search size={18} />
                    </button>
                </form>

                <div className="flex items-center gap-4">
                    {user && <NotificationBell />}

                    <Link to="/cart" className="relative flex items-center gap-1 hover:opacity-80">
                        <ShoppingCart size={22} />
                        <span className="hidden sm:inline">Giỏ hàng</span>
                    </Link>

                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                className="flex items-center gap-1 hover:opacity-80"
                            >
                                <User size={18} />
                                <span className="hidden sm:inline">{user.full_name}</span>
                                <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg py-1 text-gray-700 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium truncate">{user.full_name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>

                                    {user.role === 'customer' && (
                                        <>
                                            <Link
                                                to="/profile"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <User size={16} /> Thông tin cá nhân
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <Package size={16} /> Đơn hàng của tôi
                                            </Link>
                                            <Link
                                                to="/wishlist"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <Heart size={16} /> Yêu thích
                                            </Link>
                                        </>
                                    )}

                                    {isAdminOrStaff && (
                                        <>
                                            <Link
                                                to="/admin"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <LayoutDashboard size={16} /> Trang quản trị
                                            </Link>
                                            <Link
                                                to="/admin/profile"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <User size={16} /> Thông tin cá nhân
                                            </Link>
                                        </>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                                    >
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="hover:opacity-80">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}