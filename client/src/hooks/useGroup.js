import { useState, useCallback } from "react";
import api from "../axios/api";



// This hook is used to fetch group members by groupId
export const useGroup = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm getGroupmember nhận groupId làm tham số
  const getGroupmember = useCallback(
    async (groupId) => {
      if (!groupId) {
        setMembers([]);
        setError("Group ID is required");
        setLoading(false);
        return;
      }

      let isMounted = true; // Biến để kiểm tra component có đang mount không
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/groups/${groupId}/members`);
        if (isMounted) {
          setMembers(response.data); // Lấy dữ liệu từ response.data
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || "Failed to fetch members"
          ); // Xử lý lỗi chi tiết
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      // Cleanup
      return () => {
        isMounted = false;
      };
    },
    [] // useCallback không phụ thuộc vào biến nào
  );

  // Fetch all groups for admin
  const fetchAllGroups = useCallback(async () => {
    try {
      const response = await api.get('/api/groups');
      return response.data;
    } catch (err) {
      console.error("Failed to fetch all groups:", err);
      throw err;
    }
  }, []);

  return { members, loading, error, getGroupmember, fetchAllGroups };
};