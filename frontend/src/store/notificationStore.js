import { create } from 'zustand';
import notificationApi from '../api/notification.api';

const useNotificationStore = create((set, get) => ({
    items: [],
    unread: 0,

    fetchNotifications: async () => {
        try {
            const res = await notificationApi.getAll();
            set({ items: res.data, unread: res.unread });
        } catch (err) {
            console.error(err);
        }
    },

    markAsRead: async (id) => {
        try {
            await notificationApi.markAsRead(id);
            get().fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();
            get().fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    },
}));

export default useNotificationStore;