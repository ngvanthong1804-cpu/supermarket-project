import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock } from 'lucide-react';
import productApi from '../../api/product.api';
import ProductCard from './ProductCard';

function CountdownBadge({ endTime }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const update = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Đã kết thúc');
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-xs font-mono font-semibold">
            <Clock size={12} /> {timeLeft}
        </span>
    );
}

export default function FlashSaleSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFlashSale();
    }, []);

    const loadFlashSale = async () => {
        try {
            // Trang chủ dùng chung API lấy sản phẩm, lọc theo sản phẩm có discount_price + flash_sale_end
            const res = await productApi.getAll({ limit: 100 });
            const flashItems = res.data.filter((p) => p.flash_sale_end);
            setProducts(flashItems);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || products.length === 0) return null;

    // Lấy thời gian kết thúc gần nhất để hiện đồng hồ đếm ngược chung cho cả khu vực
    const nearestEndTime = products.reduce((min, p) =>
        new Date(p.flash_sale_end) < new Date(min) ? p.flash_sale_end : min
    , products[0].flash_sale_end);

    return (
        <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-t-xl px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Zap size={20} fill="currentColor" />
                    <span className="font-bold text-lg">Flash Sale</span>
                </div>
                <CountdownBadge endTime={nearestEndTime} />
            </div>

            <div className="bg-orange-50 rounded-b-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}