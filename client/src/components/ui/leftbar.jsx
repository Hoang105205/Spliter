import { useState, useEffect, useContext } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { PlusIcon, Home, Calendar, BarChart2, Users } from "lucide-react";
import { toast } from "sonner";

// Import custom hooks
import { useUser } from '../../hooks/useUser.js';
import { useGroupMember } from '../../hooks/useGroupMember.js';

// WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';

// Import Modals 
import CreateGroupPopup from "../popup/CreateGroupPopup.jsx";

function Left_bar({ activeTab, setActiveTab, onGroupSelect }) {
  const navigate = useNavigate();

  // User data 
  const { userData } = useUser();

  // Group data
  const { groups, loading, error, fetchGroups } = useGroupMember();

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State to track the selected group ID
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // WebSocket context
  const ws = useContext(WebSocketContext);

  // Fetch groups when the component mounts or when the active tab changes
  useEffect(() => {
    if (activeTab === 'group') {
      fetchGroups(userData.id);
      // Reset selected group when switching away from or back to 'group' tab
      setSelectedGroupId(null);
    }
  }, [activeTab, userData.id]);

  const handleClick = (tabName, path) => {
    setActiveTab(tabName);
    navigate(path);
  };

  const handleGroupClick = (group) => {
    if (activeTab === 'group') {
      onGroupSelect(group);
      setSelectedGroupId(group.id); 
    }
  };

  // Handle group creation
  const handleCreateGroup = (newGroup) => {
    console.log("Group created:", newGroup);

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'CREATE_GROUP',
        payload: {
          group_name: newGroup.name,
          creator_id: userData.id, // Gửi thêm ID của người tạo nếu cần
        }
      };

      ws.send(JSON.stringify(message));

      toast.success(`Create Group Request sent successfully!`);

    } else {
      console.error("WebSocket is not connected.");
    }
  };

  return (
    <aside 
      className="w-full h-full flex flex-col overflow-hidden border-r-4 border-[#4A73A8]"
      style={{ 
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      <nav className="mt-4 space-y-4 flex-shrink-0 px-3">
        {/* Dashboard */}
        <div
          className={`${
            activeTab === "dashboard"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-xl cursor-pointer transition-all duration-200 ${
            activeTab === "dashboard" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("dashboard", `/dashboard/${userData.id}`)}
        >
          <Home className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">Dashboard</span>
        </div>

        {/* Activities */}
        <div
          className={`${
            activeTab === "activities"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-xl cursor-pointer transition-all duration-200 ${
            activeTab === "activities" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("activities", `/dashboard/${userData.id}/activities`)}
        >
          <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">Activities</span>
        </div>

        {/* Statistics */}
        <div
          className={`${
            activeTab === "statistics"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-xl cursor-pointer transition-all duration-200 ${
            activeTab === "statistics" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("statistics", `/dashboard/${userData.id}/statistics`)}
        >
          <BarChart2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">Statistics</span>
        </div>

        {/* Your Group */}
        <div
          className={`${
            activeTab === "group"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-xl cursor-pointer transition-all duration-200 ${
            activeTab === "group" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("group", `/dashboard/${userData.id}/group`)}
        >
          <Users className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">Your group</span>
        </div>
      </nav>

      {activeTab === "group" && (
        <div className="flex flex-col flex-1 overflow-hidden px-3">
          {/* + Button */}
          <div className="flex justify-center mt-6 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-[#cccccc]/50 hover:bg-[#cccccc]/70 text-[#5a96f0] transition-colors duration-200"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Group list - Scrollable content */}
          <div className="mt-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden pr-2">
            {loading && <p className="text-center text-sm text-gray-500 py-4">Loading groups...</p>}
            {error && <p className="text-center text-sm text-red-500 py-4">Failed to load groups</p>}
            {!loading && groups.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">You have no groups yet.</p>
            )}
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center px-3 py-3 rounded-[10px] cursor-pointer transition-all duration-200 ${
                  selectedGroupId === group.id
                    ? "bg-[#83abe7] text-white font-bold shadow-sm"
                    : "hover:bg-[#f0f8ff] text-[#193865]"
                }`}
                onClick={() => handleGroupClick(group)}
              >
                <span className="[font-family:'Roboto_Condensed',Helvetica] text-lg truncate w-full">
                  {group.name}
                </span>
              </div>
            ))}
          </div>

          <CreateGroupPopup
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
          />
        </div>
      )}   
    </aside>
  );
}

export default Left_bar;