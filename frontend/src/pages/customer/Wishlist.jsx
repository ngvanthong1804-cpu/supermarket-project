import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../../store/wishlistStore';
import ProductCard from '../../components/customer/ProductCard';

export default function Wishlist() {
    const { items, loading, fetchWishlist } = useWishlistStore();

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Sản phẩm yêu thích</h1>

            {loading ? (
                <p className="text-gray-500">Đang tải...</p>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-3">Bạn chưa có sản phẩm yêu thích nào.</p>
                    <Link to="/" className="text-green-600 font-medium hover:underline">Khám phá sản phẩm</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}