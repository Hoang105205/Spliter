import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useUser } from '../../hooks/useUser.js';


function Left_bar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { userData } = useUser();

  const handleClick = (tabName, path) => {
    setActiveTab(tabName);
    navigate(path);
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
    </aside>
  );
}

export default Left_bar;