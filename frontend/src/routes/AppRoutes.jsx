import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/customer/Home';
import ProductDetail from '../pages/customer/ProductDetail';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderDetail from '../pages/customer/OrderDetail';
import Profile from '../pages/customer/Profile';
import MyOrders from '../pages/customer/MyOrders';
import Wishlist from '../pages/customer/Wishlist';
import BannerManage from '../pages/admin/BannerManage';
import ChatManage from '../pages/admin/ChatManage';
import PosPage from '../pages/admin/PosPage';
import FlashSaleManage from '../pages/admin/FlashSaleManage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/admin/Dashboard';
import ProductManage from '../pages/admin/ProductManage';
import CategoryManage from '../pages/admin/CategoryManage';
import OrderManage from '../pages/admin/OrderManage';
import UserManage from '../pages/admin/UserManage';
import VoucherManage from '../pages/admin/VoucherManage';
import SupplierManage from '../pages/admin/SupplierManage';
import StockImportManage from '../pages/admin/StockImportManage';
import FaceRegister from '../pages/admin/FaceRegister';
import FaceAttendance from '../pages/admin/FaceAttendance';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={['customer']}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute allowedRoles={['customer']}>
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute allowedRoles={['customer']}>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/pos" element={<PosPage />} />
                    <Route path="/admin/profile" element={<Profile />} />
                    <Route path="/admin/products" element={<ProductManage />} />
                    <Route
                        path="/admin/categories"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <CategoryManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/admin/orders" element={<OrderManage />} />
                    <Route path="/admin/chat" element={<ChatManage />} />
                    <Route
                        path="/admin/suppliers"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <SupplierManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/admin/stock-imports" element={<StockImportManage />} />
                    <Route
                        path="/admin/face-register"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <FaceRegister />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/face-attendance"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <FaceAttendance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/flash-sale"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <FlashSaleManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/vouchers"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <VoucherManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/banners"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <BannerManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/banners"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <BannerManage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <UserManage />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}