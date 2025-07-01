import { create } from 'zustand';
import api from '../axios/api';

export const useActivity = create((set) => ({
  activities: [],
  loading: false,
  error: null,

  // Lấy tất cả activities
  fetchActivities: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/activities/${userId}`);
      set({ activities: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    }
  },

  clearActivityData: () => {
    set({ activities: [] });
  },
}));