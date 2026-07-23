import axiosClient from './axiosClient';

const voucherApi = {
    check: (data) => axiosClient.post('/vouchers/check', data),
    getAll: () => axiosClient.get('/vouchers'),
    create: (data) => axiosClient.post('/vouchers', data),
    toggleStatus: (id) => axiosClient.put(`/vouchers/${id}/toggle-status`),
    delete: (id) => axiosClient.delete(`/vouchers/${id}`),
};

export default voucherApi;