import { create } from 'zustand';
import api from '../axios/api';




export const useFriend = create((set) => ({
  friends: [],
  requests: [],
  loading: false,
  error: null,

  // Lấy danh sách bạn bè đã chấp nhận
  fetchFriends: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/friends/${userId}`);
      set({ friends: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    }
  },

  // Lấy danh sách lời mời kết bạn đến
  fetchPendingRequests: async (userId) => {
    set({ loading: true, error: null });
    try {
    const res = await api.get(`/api/friends/${userId}/pending`);
      set({ requests: res.data, loading: false });
    } catch (err) {
      set({
        error: err.response ? err.response.data.message : err.message,
        loading: false,
      });
    }
  },

  // Gửi lời mời kết bạn
  sendFriendRequest: async (requesterId, addresseeId) => {
    try {
      const res = await api.post(`/api/friends/add-friend`, { requesterId, addresseeId });
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest: async (requestId) => {
    try {
      const res = await api.put(`/api/friends/${requestId}/accept`);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  // Từ chối lời mời kết bạn
  denyFriendRequest: async (requestId) => {
    try {
      const res = await api.put(`/api/friends/${requestId}/deny`);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  // Xóa bạn
  deleteFriend: async (relationshipId) => {
    try {
      const res = await api.delete(`/api/friends/${relationshipId}`);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  clearFriendData: () => {
    set({ friends: [], requests: [] });
  },
}));
