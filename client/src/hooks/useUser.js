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
        password: '',
        role: 'user', // Default role
        createdAt: '',
        updatedAt: '',
        bio: ''
      },

      setUserData: (newUserData) => set({ userData: newUserData }),

      addUser: async (userData) => {
        try {
          await api.post('/api/users', userData);
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
      }
    }), 
    {
      name: 'user-storage', // unique name for the storage
      getStorage: (state) => ({ userData: state.userData }), // use localStorage as the storage
    }
  )
);
