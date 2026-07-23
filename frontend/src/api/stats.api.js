import axiosClient from './axiosClient';

const statsApi = {
    getOverview: () => axiosClient.get('/stats/overview'),
    getRevenue: (days = 14) => axiosClient.get('/stats/revenue', { params: { days } }),
    getTopProducts: (limit = 5) => axiosClient.get('/stats/top-products', { params: { limit } }),
    getOrderStatus: () => axiosClient.get('/stats/order-status'),
};

export default statsApi;