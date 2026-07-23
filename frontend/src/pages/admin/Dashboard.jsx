import { useEffect, useState } from 'react';
import statsApi from '../../api/stats.api';
import { Package, ShoppingBag, DollarSign, Clock, Users } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const statusLabels = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const statusColors = {
    pending: '#facc15', confirmed: '#60a5fa',
    shipping: '#a78bfa', completed: '#4ade80', cancelled: '#f87171',
};

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [days, setDays] = useState(14);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAll();
    }, [days]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [overviewRes, revenueRes, topRes, statusRes] = await Promise.all([
                statsApi.getOverview(),
                statsApi.getRevenue(days),
                statsApi.getTopProducts(5),
                statsApi.getOrderStatus(),
            ]);
            setOverview(overviewRes.data);
            setRevenue(revenueRes.data);
            setTopProducts(topRes.data);
            setOrderStatus(statusRes.data.map((s) => ({ ...s, name: statusLabels[s.order_status] })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !overview) return <p className="text-gray-500">Đang tải...</p>;

    const cards = [
        { label: 'Tổng sản phẩm', value: overview.totalProducts, icon: Package, color: 'bg-blue-500' },
        { label: 'Tổng đơn hàng', value: overview.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
        { label: 'Doanh thu (hoàn thành)', value: `${Number(overview.totalRevenue).toLocaleString('vi-VN')}đ`, icon: DollarSign, color: 'bg-yellow-500' },
        { label: 'Đơn chờ xử lý', value: overview.pendingOrders, icon: Clock, color: 'bg-red-500' },
        { label: 'Khách hàng', value: overview.totalCustomers, icon: Users, color: 'bg-purple-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
                            <div className={`${card.color} text-white p-3 rounded-full`}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-xl font-bold text-gray-800">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Biểu đồ doanh thu */}
            <div className="bg-white rounded-lg shadow p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">Doanh thu theo ngày</h2>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="border rounded-md px-3 py-1.5 text-sm"
                    >
                        <option value={7}>7 ngày qua</option>
                        <option value={14}>14 ngày qua</option>
                        <option value={30}>30 ngày qua</option>
                    </select>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(d) => d.slice(5)} // hiện MM-DD
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={(v) => `${(v / 1000).toLocaleString('vi-VN')}k`}
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                            labelFormatter={(label) => `Ngày ${label}`}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top sản phẩm bán chạy */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h2 className="font-bold mb-4">Top 5 sản phẩm bán chạy</h2>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm">Chưa có dữ liệu (cần có đơn hàng ở trạng thái "Hoàn thành")</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                                <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Đã bán']} />
                                <Bar dataKey="total_sold" fill="#16a34a" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Tỉ lệ trạng thái đơn hàng */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h2 className="font-bold mb-4">Tỉ lệ trạng thái đơn hàng</h2>
                    {orderStatus.length === 0 ? (
                        <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={orderStatus}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.name}: ${entry.count}`}
                                >
                                    {orderStatus.map((entry) => (
                                        <Cell key={entry.order_status} fill={statusColors[entry.order_status]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}