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
    <aside className="w-[330px] h-screen pr-4 border-r-4 border-[#4A73A8]">
      <nav className="mt-4 space-y-6">
        {/* Dashboard */}
        <div
          className={`${
            activeTab === "homeboard"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[25px] cursor-pointer ${
            activeTab === "homeboard" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("homeboard", `/admin/dashboard/${userData.id}`)}
        >
          <Home className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Homeboard */}
          Homeboard
        </div>

        {/* Activities */}
        <div
          className={`${
            activeTab === "activities"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[25px] cursor-pointer ${
            activeTab === "activities" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("activities", `/admin/dashboard/${userData.id}/activities`)}
        >
          <Calendar className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Activities */}
          Users' activities
        </div>

        {/* Statistics */}
        <div
          className={`${
            activeTab === "statistics"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[25px] cursor-pointer ${
            activeTab === "statistics" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("statistics", `/admin/dashboard/${userData.id}/statistics`)}
        >
          <BarChart2 className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Statistics */}
          Statistics
        </div>

        {/* Report Request */}
        <div
          className={`${
            activeTab === "reportRequests"
              ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
              : ""
          } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[25px] cursor-pointer ${
            activeTab === "reportRequests" ? "text-[#5a96f0]" : "text-[#193865]"
          } `}
          onClick={() => handleClick("reportRequests", `/admin/dashboard/${userData.id}/reportRequests`)}
        >
          <AlertTriangle className="w-6 h-6 mr-2 inline-block" /> {/* Logo cho Report Request */}
          Report Requests
        </div>
      </nav> 
    </aside>


    
  );
}

export default Admin_left_bar;