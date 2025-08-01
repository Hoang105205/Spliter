import { create } from 'zustand';
import api from '../axios/api';

export const useReport = create((set, get) => ({
    reports: [],
    loading: false,
    error: null,

    // Fetch all reports
    fetchAllReports: async () => {
        try {
            set({ loading: true });
            const response = await api.get('/api/reports');
            set({ reports: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response ? error.response.data : error.message, loading: false });
            throw error;
        }
    },

    // Create a new report
    createReport: async (reportData) => {
        try {
            await api.post('/api/reports', reportData);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // Update report status (resolve, dismiss, etc.)
    updateReportStatus: async (reportId, status) => {
        try {
            // Update the report status on the backend
            const response = await api.put(`/api/reports/${reportId}/status`, { status });
            
            // Update the specific report in the local store immediately
            const currentReports = get().reports;
            const updatedReports = currentReports.map(report => 
                report.id == reportId ? { ...report, status } : report
            );
            set({ reports: updatedReports });
            
            // Fallback: fetch all reports to ensure data consistency
            setTimeout(async () => {
                try {
                    const freshResponse = await api.get('/api/reports');
                    set({ reports: freshResponse.data });
                } catch (fetchError) {
                    console.error('Failed to fetch fresh data:', fetchError);
                }
            }, 100);
            
            return response.data;
        } catch (error) {
            console.error('Failed to update report status:', error);
            throw error.response ? error.response.data : error;
        }
    }
}));