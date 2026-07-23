import axios from 'axios';

console.log('🔍 API URL:', import.meta.env.VITE_API_URL);

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động gắn token vào mỗi request nếu đã đăng nhập
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi chung (VD: token hết hạn -> tự logout)
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default axiosClient;