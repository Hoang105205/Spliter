
import { create } from 'zustand';
import api from '../axios/api';



// This hook is used to manage group membership for a SINGLE user
export const useGroupMember = create((set, get) => ({
  groups: [],
  loading: false,
  error: null,
  pendingInvites: [],
  trigger: 0, // ✅ Thêm biến trigger

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


  refreshGroups: () => set((state) => ({ trigger: state.trigger + 1 })),

  // Fetch danh sách lời mời nhóm đang chờ (pending invites)
  fetchPendingInvites: async (userId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/group-members/${userId}/pending-invites`);
      const realInvites = res.data.map(item => item.group); // chỉ lấy phần group
      set({ pendingInvites: realInvites, loading: false });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    }
  },

  // Accept a group invite
  acceptInvite: async (groupId, userId) => {
    if (!groupId || !userId) return;
    set({ loading: true, error: null });
    try {
      await api.put('/api/group-members/accept', {
        groupId,
        userId,
      });
      // Làm mới danh sách pending invites sau khi chấp nhận
      await get().fetchPendingInvites(userId);
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  // Decline a group invite
  declineInvite: async (groupId, userId) => {
    if (!groupId || !userId) return;
    set({ loading: true, error: null });
    try {
      await api.put('/api/group-members/reject', {
        groupId,
        userId,
      });
      // Làm mới danh sách pending invites sau khi từ chối
      await get().fetchPendingInvites(userId);
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },


  // Remove a member from a group
  removeMember: async (groupId, userId) => {
    if (!groupId || !userId) return;
      set({ loading: true, error: null });
    try {
      await api.delete(`/api/group-members/remove-member`, { 
        data: { groupId, userId }
      });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },


  clearGroups: () => {
    set({ groups: [],  pendingInvites: []});
  }
}));
