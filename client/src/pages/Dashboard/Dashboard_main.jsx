import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Head_bar from "../../components/ui/headbar.jsx";
import { use } from "react";
import { useUser } from '../../hooks/useUser.js';


function Dashboard_main() {
  const { userData } = useUser(); // Lấy trạng thái người dùng từ hook useUser
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu không có userData thì chuyển hướng tới /login
    if (!userData || !userData.username) {
      navigate("/login");
    }
  }, [userData, navigate]);

 

  // Friend data for the right sidebar
  const friendsList = [
    { id: 1, name: "Friend's name" },
    { id: 2, name: "Friend's name" },
    { id: 3, name: "Friend's name" },
    { id: 4, name: "Friend's name" },
    { id: 5, name: "Friend's name" },
  ];

  // Data for people you owe
  const youOweList = [
    { id: 1, name: "Friend's name", amount: "... đ" },
    { id: 2, name: "Friend's name", amount: "... đ" },
    { id: 3, name: "Friend's name", amount: "... đ" },
  ];

  // Data for people who owe you
  const owesYouList = [
    { id: 1, name: "Friend's name", amount: "... đ" },
    { id: 2, name: "Friend's name", amount: "... đ" },
    { id: 3, name: "Friend's name", amount: "... đ" },
  ];

  
  const { id } = useParams(); // Get the user ID from the URL

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("dashboard"); // or "recently", etc.

  const handleDashboardClick = () => {
    setActiveTab("dashboard");
    navigate(`/dashboard/${id}`);
  };

  const handleDashboardRecentlyClick = () => {
    setActiveTab("recently");
    navigate(`/dashboard/${id}/recently`);
  };

  const handleStatisticsClick = () => {
    setActiveTab("statistics");
    navigate(`/dashboard/${id}/statistics`);
  };

  const handleGroupClick = () => {
    setActiveTab("group");
    navigate(`/dashboard/${id}/group`);
  };


  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1500px] min-h-[1000px] p-5">
        <div className="relative w-full max-w-[1409px] mx-auto">
          {/* Header */}
          <Head_bar/>

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

              {/* Header Row: Welcome Text + Buttons */}
              <div className="flex justify-between items-center mb-8 pl-4 border-b-2 border-[#4A73A8]">
                {/* Welcome Text */}
                <h1 className="[font-family:'Rouge_Script',Helvetica] font-normal text-black text-8xl">
                  Welcome
                </h1>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button className="h-[57px] bg-[#ed5050] hover:bg-[#ed5050]/90 rounded-[10px] [font-family:'Roboto_Condensed',Helvetica] text-white text-3xl">
                    New expense
                  </Button>
                  <Button className="h-[57px] bg-[#3acd5a] hover:bg-[#3acd5a]/90 rounded-[10px] [font-family:'Roboto_Condensed',Helvetica] text-white text-3xl">
                    Settle up
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 mb-8">
                <Button className="flex-1 h-[53px] bg-[#ed5050] hover:bg-[#ed5050]/90 rounded-[50px] [font-family:'Roboto_Condensed',Helvetica] text-white text-3xl">
                  You owe
                </Button>

                <Button className="flex-1 h-[53px] bg-[#3bce5a] hover:bg-[#3bce5a]/90 rounded-[50px] [font-family:'Roboto_Condensed',Helvetica] text-white text-3xl">
                  You lend
                </Button>
              </div>

              {/* Amounts */}
              <div className="flex justify-around mb-8">
                <div className="[font-family:'Roboto',Helvetica] font-normal text-[#ed5050] text-[50px] text-center">
                  ... đ
                </div>

                <div className="[font-family:'Roboto',Helvetica] font-normal text-[#3bce5a] text-[50px] text-center">
                  ... đ
                </div>
              </div>

              {/* Lists */}
              <div className="flex gap-8">
                {/* You Owe List */}
                <div className="flex-1 space-y-6">
                  {youOweList.map((friend) => (
                    <div key={friend.id} className="flex items-center">
                      <Avatar className="w-[51px] h-[51px] bg-[#d9d9d9]">
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-2xl">
                          {friend.name}
                        </div>
                        <div className="[font-family:'Roboto',Helvetica] font-normal text-[#ed5050] text-base">
                          you owe ... đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Owes You List */}
                <div className="flex-1 space-y-6">
                  {owesYouList.map((friend) => (
                    <div key={friend.id} className="flex items-center">
                      <Avatar className="w-[51px] h-[51px] bg-[#d9d9d9]">
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-2xl">
                          {friend.name}
                        </div>
                        <div className="[font-family:'Roboto',Helvetica] font-normal text-[#3bce5a] text-base">
                          owes you ... đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

export default Dashboard_main;