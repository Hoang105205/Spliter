import { useState, useEffect, useContext } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { PlusIcon, Home, Calendar, BarChart2, Users, AlertTriangle } from "lucide-react";
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

  const handleClick = (tabName, path) => {
    setActiveTab(tabName);
    navigate(path);
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
        {/* Homeboard */}
        <div
          className={`${
            activeTab === "homeboard"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-lg cursor-pointer transition-all duration-200 ${
            activeTab === "homeboard" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("homeboard", `/admin/dashboard/${userData.id}`)}
        >
          <Home className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Homeboard</span>
        </div>

        {/* Users' Activities */}
        <div
          className={`${
            activeTab === "activities"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-lg cursor-pointer transition-all duration-200 ${
            activeTab === "activities" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("activities", `/admin/dashboard/${userData.id}/activities`)}
        >
          <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Users' activities</span>
        </div>

        {/* Statistics */}
        <div
          className={`${
            activeTab === "statistics"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-lg cursor-pointer transition-all duration-200 ${
            activeTab === "statistics" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("statistics", `/admin/dashboard/${userData.id}/statistics`)}
        >
          <BarChart2 className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Statistics</span>
        </div>

        {/* Report Requests */}
        <div
          className={`${
            activeTab === "reportRequests"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center px-4"
              : "h-[53px] flex items-center px-4"
          } [font-family:'Bree_Serif',Helvetica] font-normal text-lg cursor-pointer transition-all duration-200 ${
            activeTab === "reportRequests" ? "text-[#5a96f0]" : "text-[#193865]"
          } hover:bg-[#f0f8ff] rounded-[15px]`}
          onClick={() => handleClick("reportRequests", `/admin/dashboard/${userData.id}/reportRequests`)}
        >
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Report Requests</span>
        </div>
      </nav> 
    </aside>
  );
}

export default Admin_left_bar;