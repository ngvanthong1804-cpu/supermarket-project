import axiosClient from './axiosClient';

const productApi = {
    getAll: (params) => axiosClient.get('/products', { params }),
    getById: (id) => axiosClient.get(`/products/${id}`),
    addImage: (productId, image_url) => axiosClient.post(`/products/${productId}/images`, { image_url }),
    deleteImage: (imageId) => axiosClient.delete(`/products/images/${imageId}`),
    getByBarcode: (barcode) => axiosClient.get(`/products/barcode/${barcode}`),
    quickDiscount: (id, discount_percent) => axiosClient.put(`/products/${id}/quick-discount`, { discount_percent }),
    createFlashSale: (data) => axiosClient.post('/products/flash-sale', data),
    getFlashSaleList: () => axiosClient.get('/products/flash-sale/list'),
    endFlashSale: (id) => axiosClient.put(`/products/flash-sale/${id}/end`),
};

export default productApi;