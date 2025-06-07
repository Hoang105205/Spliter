import { create } from 'zustand';
import api from '../axios/api';

export const useUser = create((set, get) => ({
  // users state
  users: [],
  error: null,

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
}));
