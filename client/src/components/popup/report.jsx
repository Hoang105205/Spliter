import { useState, useEffect, useContext } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useUser } from "../../hooks/useUser.js";
import { WebSocketContext } from "../../websocket/WebSocketProvider.jsx";
import { motion, AnimatePresence } from "framer-motion";

function Report({ show, onClose, ws }) {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState("");
  const { userData, findUser } = useUser();

  useEffect(() => {
    if (show) {
      setSearch("");
      setFilteredUsers([]);
      setSelectedUser(null);
      setReason("");
    }
  }, [show]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const user = await findUser(search);
      if (user && user.username !== userData.username) {
        setFilteredUsers([{ id: user.id, username: user.username }]);
      } else {
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error("Find user failed", err);
      setFilteredUsers([]);
    }
    setLoading(false);
  };

  const handleSendReport = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket not available.");
      return;
    }

    if (!selectedUser || !reason) {
      alert("Please select a user and provide a reason.");
      return;
    }

    // ws.send(
    //   JSON.stringify({
    //     type: "REPORT_USER",
    //     payload: {
    //       reporterId: userData.id,
    //       reportedUserId: selectedUser.id,
    //       reason: reason,
    //     },
    //   })
    // );

    alert(`Report sent for ${selectedUser.username}`);
    onClose(); // ✅ Đóng popup sau khi gửi
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[700px] flex flex-col"
          >
            <h2 className="text-xl font-bold mb-4">Report a User</h2>

            {/* Search User */}
            <input
              type="text"
              placeholder="Enter username to report"
              className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* Search Results */}
            <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 max-h-[150px] mb-4">
              {loading && <p>Searching...</p>}
              {!loading && filteredUsers.length === 0 && search && <p>No matching users</p>}
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex justify-between items-center px-2 py-1 border rounded-[20px] cursor-pointer ${
                    selectedUser?.id === user.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <span>{user.username}</span>
                  {selectedUser?.id === user.id && (
                    <span className="text-blue-600 text-sm">(Selected)</span>
                  )}
                </div>
              ))}
            </div>

            {/* Reason TextArea */}
            <textarea
              placeholder="Enter report reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                onClick={handleSendReport}
              >
                Submit Report
              </Button>
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Report;