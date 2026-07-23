import axiosClient from './axiosClient';

const chatApi = {
    getMyChat: () => axiosClient.get('/chat/my-chat'),
    sendMyMessage: (message) => axiosClient.post('/chat/my-chat', { message }),
    getConversations: () => axiosClient.get('/chat/conversations'),
    getConversationMessages: (customerId) => axiosClient.get(`/chat/conversations/${customerId}`),
    sendStaffMessage: (customerId, message) => axiosClient.post(`/chat/conversations/${customerId}`, { message }),
    getUnreadCount: () => axiosClient.get('/chat/unread-count'),
};

export default chatApi;