import { create } from 'zustand';
<<<<<<< HEAD
import { persist } from 'zustand/middleware';
import api from '../axios/api';
import { acceptFriendRequest } from '../../../server/controllers/FriendsController';

export const useFriend = create(
    persist(
        (set, get) => ({
            // friends state
            error: null,
            friends: [],
            friendRequests: [],
            sentRequests: [],
            
            setFriends: (newFriends) => set({ friends: newFriends }),
            setFriendRequests: (newRequests) => set({ friendRequests: newRequests }),
            setSentRequests: (newRequests) => set({ sentRequests: newRequests }),
            
            addFriend: async (requesterId, addresseeId) => {
                try {
                    await api.post('/api/friends/add-friend', { requesterId, addresseeId });
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            removeFriend: async (friendshipId) => {
                try {
                    await api.delete(`/api/friends/${friendshipId}`);
                    set((state) => ({
                        friends: state.friends.filter(friend => friend.id !== friendshipId)
                    }));
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            getFriends: async (userId) => {
                try {
                    const response = await api.get(`/api/friends/${userId}`);
                    set({ friends: response.data });
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            getFriendRequests: async (userId) => {
                try {
                    const response = await api.get(`/api/friends/${userId}/pending`);
                    set({ friendRequests: response.data });
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            getSentRequests: async (userId) => {
                try {
                    const response = await api.get(`/api/friends/${userId}/sent-requests`);
                    set({ sentRequests: response.data });
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            acceptFriendRequest: async (requestId) => {
                try {
                    const response = await api.put(`/api/friends/${requestId}/accept`);
                    set((state) => ({
                        friendRequests: state.friendRequests.filter(request => request.id !== requestId),
                        friends: [...state.friends, response.data]
                    }));
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },

            denyFriendRequest: async (requestId) => {
                try {
                    await api.put(`/api/friends/${requestId}/deny`);
                    set((state) => ({
                        friendRequests: state.friendRequests.filter(request => request.id !== requestId)
                    }));
                } catch (error) {
                    set({ error: error.response ? error.response.data : error.message });
                    throw error; // Re-throw the error to handle it in the component
                }
            },
            
            clearFriendData: async () => {
                new Promise((resolve) => {
                    set({
                        friends: [],
                        friendRequests: [],
                        sentRequests: [],
                    });
                    localStorage.removeItem('friend-storage'); // Clear Zustand persisted storage
                    resolve();
                });
            }
        }),
        {
            name: 'friend-storage', // Unique name for the storage
            getStorage: () => localStorage, // Use localStorage as the storage
            partialize: (state) => ({
                friends: state.friends,
                friendRequests: state.friendRequests,
                sentRequests: state.sentRequests,
            }) // Persist only specific parts of the state
        }
    )
);
=======
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
  deleteFriend: async (friendId) => {
    try {
      const res = await api.delete(`/api/friends/${friendId}`);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  clearFriendData: () => {
    set({ friends: [], requests: [] });
  },
}));
>>>>>>> master
