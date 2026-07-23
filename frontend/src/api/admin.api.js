import axiosClient from './axiosClient';

const adminApi = {
    // Product
    createProduct: (data) => axiosClient.post('/products', data),
    updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
    deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

    // Category
    createCategory: (data) => axiosClient.post('/categories', data),
    updateCategory: (id, data) => axiosClient.put(`/categories/${id}`, data),
    deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),

    // Order
    getAllOrders: (params) => axiosClient.get('/orders', { params }),
    updateOrderStatus: (id, order_status) => axiosClient.put(`/orders/${id}/status`, { order_status }),
};

export default adminApi;