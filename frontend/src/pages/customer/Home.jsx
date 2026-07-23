import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../api/product.api';
import categoryApi from '../../api/category.api';
import ProductCard from '../../components/customer/ProductCard';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import bannerApi from '../../api/banner.api';
import FlashSaleSection from '../../components/customer/FlashSaleSection';
import { SlidersHorizontal, X } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

export default function Home() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sort, setSort] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
    const { user } = useAuthStore();

    useEffect(() => {
        loadCategories();
        loadBanners();
        if (user?.role === 'customer') fetchWishlist();
    }, []);

    const loadBanners = async () => {
        try {
            const res = await bannerApi.getActive();
            setBanners(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setCurrentPage(1); // reset về trang 1 khi đổi bộ lọc
    }, [selectedCategory, sort, keyword]);

    useEffect(() => {
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory, sort, keyword, currentPage]);

    const loadCategories = async () => {
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 20, sort };
            if (selectedCategory) params.category_id = selectedCategory;
            if (keyword) params.keyword = keyword;
            if (priceRange.min) params.min_price = priceRange.min;
            if (priceRange.max) params.max_price = priceRange.max;
            const res = await productApi.getAll(params);
            setProducts(res.data);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPriceFilter = () => {
        loadProducts();
        setShowFilter(false);
    };

    const handleClearPriceFilter = () => {
        setPriceRange({ min: '', max: '' });
        setShowFilter(false);
        setTimeout(loadProducts, 0);
    };

    return (
        <div>
            {/* Banner động từ Admin, nếu chưa có thì hiện banner mặc định */}
            {banners.length > 0 ? (
                <div className="mb-6 overflow-x-auto flex gap-4 snap-x snap-mandatory">
                    {banners.map((b) => {
                        const content = (
                            <img
                                src={b.image}
                                alt={b.title || 'Banner'}
                                className="w-full h-40 sm:h-56 object-cover rounded-lg shrink-0 snap-center"
                                style={{ minWidth: '100%' }}
                            />
                        );
                        return b.link ? (
                            <a key={b.id} href={b.link} className="shrink-0 w-full">
                                {content}
                            </a>
                        ) : (
                            <div key={b.id} className="shrink-0 w-full">{content}</div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-primary rounded-2xl p-10 mb-6 text-center relative overflow-hidden">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-2">Chợ hôm nay</p>
                    <h1 className="text-3xl sm:text-4xl font-display italic font-semibold text-canvas">
                        Tươi từ vườn, về đến bếp
                    </h1>
                    <p className="text-primary-light mt-2 text-sm sm:text-base">
                        Thực phẩm sạch, giá tốt mỗi ngày — giao trong 2 giờ
                    </p>
                </div>
            )}

            <FlashSaleSection />

            {/* Hiển thị từ khóa đang tìm kiếm */}
            {keyword && (
                <p className="text-sm text-gray-600 mb-3">
                    Kết quả tìm kiếm cho: <span className="font-medium">"{keyword}"</span>
                </p>
            )}

            {/* Thanh sắp xếp + lọc giá */}
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="relative">
                    <button
                        onClick={() => setShowFilter((s) => !s)}
                        className="flex items-center gap-1 border rounded-md px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                    >
                        <SlidersHorizontal size={14} /> Lọc theo giá
                        {(priceRange.min || priceRange.max) && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                    </button>

                    {showFilter && (
                        <div className="absolute left-0 mt-2 bg-white border rounded-md shadow-lg p-4 w-64 z-20">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium">Khoảng giá</span>
                                <button onClick={() => setShowFilter(false)}><X size={16} className="text-gray-400" /></button>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="number"
                                    placeholder="Từ"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-full border rounded-md px-2 py-1.5 text-sm"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-full border rounded-md px-2 py-1.5 text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleClearPriceFilter} className="flex-1 border rounded-md py-1.5 text-sm hover:bg-gray-50">
                                    Xóa lọc
                                </button>
                                <button onClick={handleApplyPriceFilter} className="flex-1 bg-green-600 text-white rounded-md py-1.5 text-sm hover:bg-green-700">
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border rounded-md px-3 py-1.5 text-sm bg-white"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="best_selling">Bán chạy nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                    <option value="name_asc">Tên A-Z</option>
                </select>
            </div>

            {/* Bộ lọc danh mục */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition ${
                        !selectedCategory
                            ? 'bg-primary text-canvas border-primary'
                            : 'bg-white text-ink/70 border-line hover:border-primary'
                    }`}
                >
                    Tất cả
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition ${
                            selectedCategory === cat.id
                                ? 'bg-primary text-canvas border-primary'
                                : 'bg-white text-ink/70 border-line hover:border-primary'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Danh sách sản phẩm */}
            {loading ? (
                <p className="text-center py-10 text-gray-500">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Chưa có sản phẩm nào.</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
}