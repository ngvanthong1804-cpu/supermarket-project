import axiosClient from './axiosClient';

const stockImportApi = {
    getAll: () => axiosClient.get('/stock-imports'),
    getById: (id) => axiosClient.get(`/stock-imports/${id}`),
    create: (data) => axiosClient.post('/stock-imports', data),
};

export default stockImportApi;