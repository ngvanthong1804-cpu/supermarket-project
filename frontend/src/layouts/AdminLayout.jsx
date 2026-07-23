import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Package, ListTree, ShoppingBag, LogOut, Users, Tag, Truck, PackagePlus, Home, Image, MessageCircle, Menu, X, ShoppingBasket, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/common/NotificationBell';

const menuItems = [
    { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true, roles: ['admin', 'staff'] },
    { path: '/admin/pos', label: 'Bán tại quầy', icon: ShoppingBasket, roles: ['admin', 'staff'] },
    { path: '/admin/products', label: 'Sản phẩm', icon: Package, roles: ['admin', 'staff'] },
    { path: '/admin/categories', label: 'Danh mục', icon: ListTree, roles: ['admin'] },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag, roles: ['admin', 'staff'] },
    { path: '/admin/chat', label: 'Hỗ trợ KH', icon: MessageCircle, roles: ['admin', 'staff'] },
    { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: Truck, roles: ['admin'] },
    { path: '/admin/stock-imports', label: 'Nhập kho', icon: PackagePlus, roles: ['admin', 'staff'] },
    { path: '/admin/flash-sale', label: 'Flash Sale', icon: Zap, roles: ['admin'] },
    { path: '/admin/vouchers', label: 'Voucher', icon: Tag, roles: ['admin'] },
    { path: '/admin/banners', label: 'Banner', icon: Image, roles: ['admin'] },
    { path: '/admin/users', label: 'Người dùng', icon: Users, roles: ['admin'] },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Overlay tối khi mở sidebar trên mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`w-60 bg-gray-900 text-white flex flex-col fixed md:static inset-y-0 left-0 z-50 transform transition-transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}>
                <div className="p-4 border-b border-gray-700">
                    <p className="text-lg font-bold mb-2">🛒 SuperMart Admin</p>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition w-fit"
                    >
                        <Home size={14} /> Về trang chủ
                    </Link>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.filter((item) => item.roles.includes(user?.role)).map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                                    isActive ? 'bg-green-600' : 'hover:bg-gray-800'
                                }`}
                            >
                                <Icon size={18} /> {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-gray-700">
                    <Link to="/admin/profile" className="text-xs text-gray-400 mb-2 hover:text-white block">
                        {user?.full_name} ({user?.role})
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-x-auto w-full">
                <div className="flex justify-between items-center p-4 border-b bg-white">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
                        <Menu size={22} />
                    </button>
                    <div className="md:ml-auto">
                        <NotificationBell />
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}