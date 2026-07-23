import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';

export default function ProductCard({ product }) {
    const finalPrice = product.discount_price || product.price;
    const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
        : 0;

    const addToCart = useCartStore((state) => state.addToCart);
    const { ids, toggleWishlist } = useWishlistStore();
    const { user } = useAuthStore();
    const isWishlisted = ids.has(product.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product.id, 1);
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        toggleWishlist(product.id);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all p-3 flex flex-col relative group">
            {hasDiscount && (
                <div className="absolute top-3 -right-1 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-l-md shadow-sm">
                    -{discountPercent}%
                </div>
            )}

            {user?.role === 'customer' && (
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 left-3 z-10 bg-white/90 p-1.5 rounded-full shadow hover:scale-110 transition"
                >
                    <Heart
                        size={14}
                        className={isWishlisted ? 'text-red-500' : 'text-gray-300'}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                </button>
            )}

            <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
                    <img
                        src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
                    {product.name}
                </h3>
            </Link>

            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-green-600 font-bold text-base">
                    {Number(finalPrice).toLocaleString('vi-VN')}đ
                </span>
                {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                        {Number(product.price).toLocaleString('vi-VN')}đ
                    </span>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-0.5">/ {product.unit || 'sản phẩm'}</p>

            <button
                onClick={handleAddToCart}
                className="mt-3 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-full hover:bg-green-700 transition flex items-center justify-center gap-1.5"
            >
                <ShoppingCart size={15} /> Thêm vào giỏ
            </button>
        </div>
    );
}