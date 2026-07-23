import { create } from 'zustand';
import wishlistApi from '../api/wishlist.api';
import { toast } from 'react-toastify';

const useWishlistStore = create((set, get) => ({
    items: [], // danh sách sản phẩm đầy đủ (dùng cho trang Wishlist)
    ids: new Set(), // tập hợp product_id đã yêu thích (dùng để tô màu icon nhanh)
    loading: false,

    fetchWishlist: async () => {
        set({ loading: true });
        try {
            const res = await wishlistApi.getAll();
            const ids = new Set(res.data.map((p) => p.id));
            set({ items: res.data, ids });
        } catch (err) {
            console.error(err);
        } finally {
            set({ loading: false });
        }
    },

    toggleWishlist: async (productId) => {
        const { ids } = get();
        const isWishlisted = ids.has(productId);
        try {
            if (isWishlisted) {
                await wishlistApi.remove(productId);
                toast.success('Đã xóa khỏi yêu thích');
            } else {
                await wishlistApi.add(productId);
                toast.success('Đã thêm vào yêu thích');
            }
            get().fetchWishlist();
        } catch (err) {
            toast.error(err.message || 'Vui lòng đăng nhập để dùng chức năng này');
        }
    },
}));

export default useWishlistStore;