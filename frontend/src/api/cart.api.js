import axiosClient from './axiosClient';

const cartApi = {
    get: () => axiosClient.get('/cart'),
    add: (data) => axiosClient.post('/cart', data),
    update: (itemId, data) => axiosClient.put(`/cart/${itemId}`, data),
    remove: (itemId) => axiosClient.delete(`/cart/${itemId}`),
};

export default cartApi;