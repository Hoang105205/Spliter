import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../axios/api';



export const useUser = create(
  persist(
    (set, get) => ({
      // users state
      error: null,

      userData: {
        id: '',
        username: '',
        email: '',
        role: 'user', // Default role
        createdAt: '',
        updatedAt: '',
        bio: '',
        phone_number: '',
        avatarURL: '',
        bankAccountNumber: '',
        bankAccountName: '',
        bankName: '',
        status: '',
      },

      setUserData: (newUserData) => set({ userData: newUserData }),

      addUser: async (userData) => {
        try {
          const response = await api.post('/api/users', userData);
          set({ userData: response.data });
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      findAllUsers: async () => {
        try {
          const response = await api.get('/api/users');
          return response.data;
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      findUser: async (username) => {
        try {
          const response = await api.get(`/api/users/${username}`);
          return response.data;
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },
      
      clearUserData: async () => {
        return new Promise((resolve) => {
          set({
            userData: {
              id: '',
              username: '',
              email: '',
              role: '',
              createdAt: '',
              updatedAt: '',
              bio: '',
              phone_number: '',
              avatarURL: '',
              bankAccountNumber: '',
              bankAccountName: '',
              bankName: '',
              status: '',
            }
          });
          localStorage.removeItem('user-storage'); // Clear Zustand persisted storage
          localStorage.removeItem('token')
          resolve();
        });
      },

      updateUser: async (updateData) => {
        try {
          const response = await api.put(`/api/users/${updateData.id}`, updateData);
          set({ userData: response.data });
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      handleChangePassword: async (currentPassword, newPassword) => {
        const userID = get().userData.id;
        try {
          const response = await api.put(`/api/users/${userID}/change-password`, { currentPassword, newPassword });
          return response.data;
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      login: async (username, password) => {
        try {
          const response = await api.post('/api/users/login', { username, password });
          set({ userData: response.data });
          return response.data;
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      setAvatar: async (file) => {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const userID = get().userData.id;
          const response = await api.put(`/api/users/${userID}/avatar`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          set({ userData: { ...get().userData, avatarURL: response.data.avatarURL } });
          return response.data.avatarURL; // Return the avatar URL
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      getAvatar: async (userId) => {
        try {
          const response = await api.get(`/api/users/${userId}/avatar`);
          return response.data.avatarURL;
        } catch (error) {
          // Handle error if avatar not found or any other issue
          if (error.response && error.response.status === 404) {
            return null; // Avatar not found
          }
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },
      
      updateStatus: async (userId, status) => {
        try {
          await api.put(`/api/users/${userId}/status`, { status });
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error; // Re-throw the error to handle it in the component
        }
      },

      // BATCH API: Update multiple users status at once - OPTIMIZED
      updateBatchStatus: async (userIds, status) => {
        try {
          const response = await api.put('/api/users/batch-update-status', { 
            userIds, 
            status 
          });
          return response.data; // Returns array of results
        } catch (error) {
          set({ error: error.response ? error.response.data : error.message });
          throw error;
        }
      },
    }), 
    {
      name: 'user-storage', // unique name for the storage
      partialize: (state) => ({ userData: state.userData }) // use localStorage as the storage
    }
  )
);
