import axiosClient from './axiosClient';

const orderApi = {
    create: (data) => axiosClient.post('/orders', data),
    getMyOrders: () => axiosClient.get('/orders/my-orders'),
    getById: (id) => axiosClient.get(`/orders/${id}`),
    cancel: (id) => axiosClient.put(`/orders/${id}/cancel`),
};

export default orderApi;