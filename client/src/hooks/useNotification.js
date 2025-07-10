import { create } from 'zustand';
import api from '../axios/api';

export const useNotification = create((set) => ({
    notifications: [],
    loading: false,
    error: null,
    notificationTrigger: 0, // ✅ Thêm biến trigger

    // ✅ Trigger tăng để báo UI cập nhật
    incrementNotificationTrigger: () => {
        set((state) => ({
            notificationTrigger: state.notificationTrigger + 1,
        }));
    },

    // Fetch notifications for the logged-in user
    fetchNotifications: async (userId) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/api/notifications/${userId}`);
            set({ notifications: res.data, loading: false });
            console.log("📥 Updated notifications in Zustand:", res.data); // ✅ LOG TẠI ĐÂY
        } catch (err) {
            set({
                error: err.response ? err.response.data.message : err.message,
                loading: false,
            });
        }
    },

    // Mark a notification as read
    markAsRead: async (notificationId) => {
        try {
            const res = await api.put(`/api/notifications/${notificationId}/mark-as-read`);
            set((state) => ({
                notifications: state.notifications.map((notification) =>
                    notification.id === notificationId ? { ...notification, isRead: true } : notification
                )
            }));
            return res.data;
        } catch (err) {
            throw err.response ? err.response.data : err;
        }
    },

    clearNotifications: () => set({ notifications: [], error: null, loading: false })
}));