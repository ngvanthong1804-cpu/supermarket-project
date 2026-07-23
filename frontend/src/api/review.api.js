import axiosClient from './axiosClient';

const reviewApi = {
    getByProduct: (productId) => axiosClient.get(`/reviews/product/${productId}`),
    create: (data) => axiosClient.post('/reviews', data),
};

export default reviewApi;