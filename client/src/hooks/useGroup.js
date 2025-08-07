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
        return response.data || [];
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || "Failed to fetch members"
          ); // Xử lý lỗi chi tiết
          return [];
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

  const renameGroup = useCallback(
    async (groupId, newName) => {
      if (!groupId || !newName) {
        setError("Group ID and new name are required");
        return false;
      }

      let isMounted = true;
      setLoading(true);
      setError(null);

      try {
        const response = await api.put(`/api/groups/${groupId}`, { name: newName });
        if (isMounted) {
          // Cập nhật thành viên nếu cần, hoặc chỉ trả về thành công
          // (Tùy thuộc vào yêu cầu, hiện tại không cần thay đổi members)
          return true; // Trả về true nếu đổi tên thành công
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || "Failed to rename group"
          );
        }
        return false; // Trả về false nếu thất bại
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    },
    []
  );

  const deleteGroup = useCallback(
    async (groupId) => {
      if (!groupId) {
        setError("Group ID is required");
        return false;
      }

      let isMounted = true;
      setLoading(true);
      setError(null);

      try {
        await api.delete(`/api/groups/${groupId}`);
        if (isMounted) {
          return true; // Trả về true nếu xóa thành công
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || "Failed to delete group"
          );
        }
        return false; // Trả về false nếu thất bại
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    },
    []
  );

  return { members, loading, error, getGroupmember, fetchAllGroups, renameGroup, deleteGroup };
};