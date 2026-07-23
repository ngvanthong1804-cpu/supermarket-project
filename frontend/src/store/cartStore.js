import { create } from 'zustand';
import cartApi from '../api/cart.api';
import { toast } from 'react-toastify';

const useCartStore = create((set, get) => ({
    items: [],
    total: 0,
    loading: false,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const res = await cartApi.get();
            set({ items: res.data.items, total: res.data.total });
        } catch (err) {
            console.error(err);
        } finally {
            set({ loading: false });
        }
    },

    addToCart: async (productId, quantity = 1) => {
        try {
            await cartApi.add({ product_id: productId, quantity });
            toast.success('Đã thêm vào giỏ hàng!');
            get().fetchCart();
        } catch (err) {
            toast.error(err.message || 'Vui lòng đăng nhập để mua hàng');
        }
    },

    updateQuantity: async (itemId, quantity) => {
        try {
            await cartApi.update(itemId, { quantity });
            get().fetchCart();
        } catch (err) {
            toast.error(err.message || 'Lỗi cập nhật giỏ hàng');
        }
    },

    removeItem: async (itemId) => {
        try {
            await cartApi.remove(itemId);
            toast.success('Đã xóa sản phẩm khỏi giỏ');
            get().fetchCart();
        } catch (err) {
            toast.error(err.message || 'Lỗi xóa sản phẩm');
        }
    },
}));

export default useCartStore;