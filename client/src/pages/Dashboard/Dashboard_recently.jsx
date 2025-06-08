import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Head_bar from "../../components/ui/headbar.jsx";

function Dashboard_recently() {
  // Friend data for the right sidebar
  const friendsList = [
    { id: 1, name: "Friend's name" },
    { id: 2, name: "Friend's name" },
    { id: 3, name: "Friend's name" },
    { id: 4, name: "Friend's name" },
    { id: 5, name: "Friend's name" },
  ];

  const navigate = useNavigate();

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("recently"); // or "recently", etc.

  const handleDashboardClick = () => {
    setActiveTab("dashboard");
    navigate("/dashboard");
  };

  const handleDashboardRecentlyClick = () => {
    setActiveTab("recently");
    navigate("/dashboard/recently");
  };

  const handleStatisticsClick = () => {
    setActiveTab("statistics");
    navigate("/dashboard/statistics");
  };

  const handleGroupClick = () => {
    setActiveTab("group");
    navigate("/dashboard/group");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1500px] min-h-[1000px] p-5">
        <div className="relative w-full max-w-[1409px] mx-auto">
          {/* Header */}
          <Head_bar />

          {/* Main Content */}
          <div className="flex mt-4">
            {/* Left Sidebar */}
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
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </div>

                {/* Recently */}
                <div
                  className={`${
                    activeTab === "recently"
                      ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
                      : ""
                  } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
                    activeTab === "recently" ? "text-[#5a96f0]" : "text-[#193865]"
                  }`}
                  onClick={handleDashboardRecentlyClick}
                >
                  Recently
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
                  onClick={handleStatisticsClick}
                >
                  Statistics
                </div>

                {/* Your group */}
                <div
                  className={`${
                    activeTab === "group"
                      ? "bg-[#cccccc]/30 rounded-[15px] h-[53px] flex items-center"
                      : ""
                  } [font-family:'Bree_Serif',Helvetica] font-normal text-2xl pl-[53px] cursor-pointer ${
                    activeTab === "group" ? "text-[#5a96f0]" : "text-[#193865]"
                  }`}
                  onClick={handleGroupClick}
                >
                  Your group
                </div>
              </nav>
            </aside>


            {/* Main Content Area */}
            <main className="flex-1 px-4">
            </main>

            {/* Right Sidebar */}
            <aside className="w-[269px] h-screen pl-4 border-l-4 border-[#4A73A8]">
              <div className="bg-[#cccccc]/30 rounded-[15px] bg-[100%_100%] h-[38px] flex items-center justify-between px-3.5">
                <span className="[font-family:'Roboto',Helvetica] text-[#666666] text-xl">
                  Your friend
                </span>
                <Button variant="ghost" size="icon" className="p-0">
                  <PlusIcon className="w-6 h-6" />
                </Button>
              </div>

              <div className="mt-4 space-y-6">
                {friendsList.map((friend) => (
                  <div key={friend.id} className="flex items-center">
                    <div className="relative">
                      <Avatar className="w-[53px] h-[53px] bg-[#d9d9d9]">
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-[18px] h-[18px]">
                      </div>
                    </div>
                    <div className="ml-2 [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-lg">
                      {friend.name}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard_recently;