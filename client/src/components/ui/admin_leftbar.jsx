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


function Admin_left_bar({ activeTab, setActiveTab, onGroupSelect }) {
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
    <aside className="w-[342px] h-screen pr-4 border-r-4 border-[#4A73A8]">
      <nav className="mt-4 space-y-6">
        {/* Dashboard */}
        <div
          className={`${
            activeTab === "dashboard"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
            activeTab === "dashboard" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("dashboard", `/dashboard/${userData.id}`)}
        >
          <Home className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Dashboard */}
          Dashboard
        </div>

        {/* Recently */}
        <div
          className={`${
            activeTab === "activities"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
            activeTab === "activities" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("activities", `/dashboard/${userData.id}/activities`)}
        >
          <Calendar className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Activities */}
          Activities
        </div>

        {/* Statistics */}
        <div
          className={`${
            activeTab === "statistics"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
            activeTab === "statistics" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("statistics", `/dashboard/${userData.id}/statistics`)}
        >
          <BarChart2 className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Statistics */}
          Statistics
        </div>

        {/* Your Group */}
        <div
          className={`${
            activeTab === "group"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
            activeTab === "group" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("group", `/dashboard/${userData.id}/group`)}
        >
          <Users className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Your Group */}
          Your group
        </div>
      </nav>


      {activeTab === "group" && (
        <>
          {/* + Button */}
          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-[#cccccc]/50 hover:bg-[#cccccc]/70 text-[#5a96f0]"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Group list */}
          <div className="mt-4 space-y-2">
            {loading && <p className="text-center text-sm text-gray-500">Loading groups...</p>}
            {error && <p className="text-center text-sm text-red-500">Failed to load groups</p>}
            {!loading && groups.length === 0 && (
              <p className="text-center text-sm text-gray-500">You have no groups yet.</p>
            )}
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer ${
                  selectedGroupId === group.id
                    ? "bg-[#83abe7] text-white font-bold" // Hiệu ứng khi được chọn: nền xanh đậm, chữ trắng, đậm
                    : "hover:bg-[#f0f8ff]"
                }`}
                onClick={() => handleGroupClick(group)}
              >
                <span className="[font-family:'Roboto_Condensed',Helvetica] text-lg">
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
        </>

        
      )}   
    </aside>


    
  );
}

export default Admin_left_bar;