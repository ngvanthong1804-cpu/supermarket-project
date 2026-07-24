import axiosClient from './axiosClient';

const faceAttendanceApi = {
    getEmployees: () => axiosClient.get('/face-attendance/employees'),
    registerFace: (userId, descriptor) =>
        axiosClient.post('/face-attendance/register', { userId, descriptor }),
    deleteFace: (userId) => axiosClient.delete(`/face-attendance/register/${userId}`),
    checkIn: (descriptor) => axiosClient.post('/face-attendance/checkin', { descriptor }),
    getHistory: (params) => axiosClient.get('/face-attendance/history', { params }),
};

export default faceAttendanceApi;