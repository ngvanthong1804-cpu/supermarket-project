import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productApi from '../../api/product.api';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import ProductReviews from '../../components/customer/ProductReviews';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);
    const addToCart = useCartStore((state) => state.addToCart);
    const { ids, toggleWishlist, fetchWishlist } = useWishlistStore();
    const { user } = useAuthStore();
    const isWishlisted = ids.has(Number(id));

    useEffect(() => {
        loadProduct();
        if (user?.role === 'customer') fetchWishlist();
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const res = await productApi.getById(id);
            setProduct(res.data);
            setActiveImage(res.data.image);
            setQuantity(1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center py-10 text-gray-500">Đang tải...</p>;
    if (!product) return <p className="text-center py-10 text-gray-500">Không tìm thấy sản phẩm</p>;

    const finalPrice = product.discount_price || product.price;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={activeImage || 'https://via.placeholder.com/500x500?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {product.images && product.images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                        <button
                            onClick={() => setActiveImage(product.image)}
                            className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 ${
                                activeImage === product.image ? 'border-green-600' : 'border-transparent'
                            }`}
                        >
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </button>
                        {product.images.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => setActiveImage(img.image_url)}
                                className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 ${
                                    activeImage === img.image_url ? 'border-green-600' : 'border-transparent'
                                }`}
                            >
                                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                <p className="text-gray-500 mt-1">Danh mục: {product.category_name || 'Chưa phân loại'}</p>

                <div className="flex items-center gap-3 mt-4">
                    <span className="text-3xl font-bold text-green-600">
                        {Number(finalPrice).toLocaleString('vi-VN')}đ
                    </span>
                    {product.discount_price && (
                        <span className="text-lg text-gray-400 line-through">
                            {Number(product.price).toLocaleString('vi-VN')}đ
                        </span>
                    )}
                    <span className="text-gray-500">/ {product.unit}</span>
                </div>

                {/* Tổng tiền tạm tính theo số lượng đang chọn */}
                <div className="mt-2 text-sm text-gray-600">
                    Tạm tính:{' '}
                    <span className="font-semibold text-gray-800">
                        {Number(finalPrice * quantity).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-gray-400"> ({quantity} {product.unit})</span>
                </div>

                <p className="text-gray-600 mt-4 leading-relaxed">
                    {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                    Còn lại: <span className="font-medium">{Math.max(0, product.stock - quantity)}</span> {product.unit}
                </p>

                <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center border rounded-md">
                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="p-2 hover:bg-gray-100"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-10 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                            className="p-2 hover:bg-gray-100"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => addToCart(product.id, quantity)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        <ShoppingCart size={18} />
                        {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>

                    {user?.role === 'customer' && (
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-2.5 border rounded-md hover:bg-gray-50 transition"
                            title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        >
                            <Heart
                                size={20}
                                className={isWishlisted ? 'text-red-500' : 'text-gray-400'}
                                fill={isWishlisted ? 'currentColor' : 'none'}
                            />
                        </button>
                    )}
                </div>

                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}