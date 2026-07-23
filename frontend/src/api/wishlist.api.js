import axiosClient from './axiosClient';

const wishlistApi = {
    getAll: () => axiosClient.get('/wishlist'),
    add: (product_id) => axiosClient.post('/wishlist', { product_id }),
    remove: (productId) => axiosClient.delete(`/wishlist/${productId}`),
    check: (productId) => axiosClient.get(`/wishlist/check/${productId}`),
};

export default wishlistApi;