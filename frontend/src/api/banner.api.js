import axiosClient from './axiosClient';

const bannerApi = {
    getActive: () => axiosClient.get('/banners/active'),
    getAll: () => axiosClient.get('/banners'),
    create: (data) => axiosClient.post('/banners', data),
    toggleStatus: (id) => axiosClient.put(`/banners/${id}/toggle-status`),
    delete: (id) => axiosClient.delete(`/banners/${id}`),
};

export default bannerApi;