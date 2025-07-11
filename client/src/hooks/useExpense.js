import { create } from 'zustand';
import api from '../axios/api';
import { toast } from 'sonner';

// This hook is used to manage expense creation for a group
export const useExpense = create(() => ({
  // Tạo mới một expense
  createExpense: async ({
    title,
    expDate,
    description,
    amount,
    paidbyId,
    groupId,
    members,
  }) => {
    if (!groupId || !paidbyId) return;

    try {
      const payload = {
        title,
        expDate: expDate.toISOString(), // Định dạng ISO cho schema DATE
        description,
        amount,
        paidbyId,
        groupId,
        members: members.map(member => ({
          memberId: member.userId,
          amount: member.shared_amount,
        })),
      };

      await api.post('/api/expenses', payload);

    } catch (err) {
      throw err; // Ném lỗi để component có thể xử lý nếu cần
    }
  },

  // Lấy danh sách tất cả expense của một group
  getExpenses: async (groupId) => {
    if (!groupId) return null;

    try {
      const response = await api.get(`/api/expenses/${groupId}`);
      return response.data; // Trả về danh sách expense từ server
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error('Failed to fetch expenses. Please try again.');
      return null;
    }
  },
}));