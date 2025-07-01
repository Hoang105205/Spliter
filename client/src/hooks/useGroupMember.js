
import { create } from 'zustand';
import api from '../axios/api';

export const useGroupMember = create((set, get) => ({
  groups: [],
  loading: false,
  error: null,

  // Fetch danh sách group mà user đã tham gia
  fetchGroups: async (userId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/group-members/${userId}`);
      const realGroups = res.data.map(item => item.group); // chỉ lấy phần group
      set({ groups: realGroups, loading: false });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    }
  },

  clearGroups: () => {
    set({ groups: [] });
  }
}));
