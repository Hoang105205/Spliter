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

      const response = await api.post('/api/expenses', payload);
      return response.data; 
      
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

  //Lấy số tiền đã cho vay của người dùng
  getAllLend: async (userId) => {
    if (!userId) return null;

    try {
      const response = await api.get(`/api/expenses/allLend/${userId}`);
      return response.data; // Trả về danh sách các khoản vay từ server
    } catch (err) {
      console.error('Error fetching all lendings:', err);
      toast.error('Failed to fetch lendings. Please try again.');
      return null;
    }
  },

  //Lấy số tiền đã nợ của người dùng
  getAllOwe: async (userId) => {
    if (!userId) return null;

    try {
      const response = await api.get(`/api/expenses/allOwe/${userId}`);
      return response.data; // Trả về danh sách các khoản nợ từ server
    } catch (err) {
      console.error('Error fetching all owes:', err);
      toast.error('Failed to fetch owes. Please try again.');
      return null;
    }
  },

  // Lấy tất cả các khoản chi tiêu của người dùng
  getUserExpenses: async (userId) => {
    if (!userId) return null;

    try {
      const response = await api.get(`/api/expenses/allExpenses/${userId}`);
      return response.data; // Trả về danh sách các khoản chi tiêu của người dùng
    } catch (err) {
      console.error('Error fetching user expenses:', err);
      toast.error('Failed to fetch user expenses. Please try again.');
      return null;
    }
  },

  // Cập nhật trạng thái is_paid của một expense item
  updateExpenseItemStatus: async ({ expenseId, itemId, userId, status }) => {
    if (!expenseId || !itemId || !userId || !status) return null;

    try {
      const payload = {
        expenseId,
        itemId,
        userId,
        status,
      };

      const response = await api.put('/api/expenses/updateStatus', payload);
      return response.data; // Trả về dữ liệu cập nhật (nếu cần)
    } catch (err) {
      console.error('Error updating expense status:', err);
      toast.error('Failed to update expense status. Please try again.');
      return null;
    }
  },

  // Lấy chi tiết một expense dựa trên expenseId
  getExpenseById: async (expenseId) => {
    if (!expenseId) return null;

    try {
      const response = await api.get(`/api/expenses/detail/${expenseId}`); // Sử dụng endpoint mới
      return response.data; // Trả về chi tiết expense bao gồm items từ server
    } catch (err) {
      console.error('Error fetching expense details:', err);
      toast.error('Failed to fetch expense details. Please try again.');
      return null;
    }
  },

  // Lấy tất cả expenses cho admin statistics
  getAllExpenses: async () => {
    try {
      const response = await api.get('/api/expenses/all');
      return response.data; // Trả về danh sách tất cả expenses
    } catch (err) {
      console.error('Error fetching all expenses:', err);
      toast.error('Failed to fetch expenses. Please try again.');
      return [];
    }
  },
}));
