import axiosClient from './axiosClient';

const posApi = {
    searchCustomer: (keyword) => axiosClient.get('/pos/customers', { params: { keyword } }),
    createOrder: (data) => axiosClient.post('/pos/orders', data),
};

export default posApi;