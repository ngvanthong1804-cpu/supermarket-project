import axiosClient from './axiosClient';

const authApi = {
    register: (data) => axiosClient.post('/auth/register', data),
    login: (data) => axiosClient.post('/auth/login', data),
    getMe: () => axiosClient.get('/auth/me'),
    forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
    resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
};

export default authApi;