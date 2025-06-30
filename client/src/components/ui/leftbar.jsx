import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "lucide-react";

import { useUser } from '../../hooks/useUser.js';


// Import Modals 
import CreateGroupPopup from "../popup/CreateGroupPopup.jsx";


function Left_bar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { userData } = useUser();

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleClick = (tabName, path) => {
    setActiveTab(tabName);
    navigate(path);
  };

  // Mock data for groups, replace with actual data fetching logic
  const mockGroups = [
    { id: 1, name: "Group name" },
    { id: 2, name: "Group name" },
    { id: 3, name: "Group name" }
  ];

  // Handle group creation
  const handleCreateGroup = (newGroup) => {
    console.log("Group created:", newGroup);
    // Bạn có thể gọi API ở đây
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
          }`}
          onClick={() => handleClick("dashboard", `/dashboard/${userData.id}`)}
        >
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
          }`}
          onClick={() => handleClick("activities", `/dashboard/${userData.id}/activities`)}
        >
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
          }`}
          onClick={() => handleClick("statistics", `/dashboard/${userData.id}/statistics`)}
        >
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
          }`}
          onClick={() => handleClick("group", `/dashboard/${userData.id}/group`)}
        >
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
            {mockGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-[#f0f8ff]"
                // onClick={() => handleClick(`group-${group.id}`, `/dashboard/${userData.id}/group/${group.id}`)}
              >
                <div className="w-[40px] h-[40px] bg-[#d9d9d9] rounded-full" />
                <span className="[font-family:'Roboto_Condensed',Helvetica] font-medium text-lg">
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

export default Left_bar;