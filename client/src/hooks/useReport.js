import { create } from 'zustand';
import api from '../axios/api';

export const useReport = create((set) => ({
    createReport: async (reportData) => {
        try {
            await api.post('/api/reports', reportData);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}));