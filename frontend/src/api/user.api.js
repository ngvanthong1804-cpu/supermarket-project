import axiosClient from './axiosClient';

const userApi = {
    getAll: (params) => axiosClient.get('/users', { params }),
    create: (data) => axiosClient.post('/users', data),
    toggleStatus: (id) => axiosClient.put(`/users/${id}/toggle-status`),
    updateProfile: (data) => axiosClient.put('/users/profile', data),
    changePassword: (data) => axiosClient.put('/users/change-password', data),
};

export default userApi;