import axiosClient from './axiosClient';

const userAddressApi = {
    getAll: () => axiosClient.get('/my-addresses'),
    create: (data) => axiosClient.post('/my-addresses', data),
    update: (id, data) => axiosClient.put(`/my-addresses/${id}`, data),
    setDefault: (id) => axiosClient.put(`/my-addresses/${id}/set-default`),
    delete: (id) => axiosClient.delete(`/my-addresses/${id}`),
};

export default userAddressApi;