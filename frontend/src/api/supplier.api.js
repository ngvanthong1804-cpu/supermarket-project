import axiosClient from './axiosClient';

const supplierApi = {
    getAll: () => axiosClient.get('/suppliers'),
    create: (data) => axiosClient.post('/suppliers', data),
    update: (id, data) => axiosClient.put(`/suppliers/${id}`, data),
    delete: (id) => axiosClient.delete(`/suppliers/${id}`),
};

export default supplierApi;