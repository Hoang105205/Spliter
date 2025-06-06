import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard_group() {
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

  const notifications = [
    {
      title: "You paid xxx for ...",
      time: "9 days ago",
    },
    {
      title: "You have been added into group ...",
      time: "9 days 21 hours ago",
    },
    {
      title: "You have created a bill with ...",
      time: "12 days 4 hours ago",
    },
    // Add more...
  ];

  const accountScroll = [
    {
      title: "Account",
    },
    {
      title: "Report",
    },
    {
      title: "Logout",
    },
  ];

  // Navigate to Dashboard
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("group"); // or "recently", etc.

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

  // State to manage the visibility of the notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // State to manage the visibility of the account dropdown
  const [showAccountScrolldown, setShowAccountScrolldown] = useState(false);
  const accountRef = useRef(null);

  // Handle bell icon click to toggle notifications
  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setShowAccountScrolldown(false); // Close account dropdown if open
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((notifRef.current && !notifRef.current.contains(event.target))
          || (accountRef.current && !accountRef.current.contains(event.target))) {
        setShowNotifications(false);
        setShowAccountScrolldown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle avatar click to toggle notifications  // Handle click on the avatar to toggle notifications
  const handleAvatarClick = () => {
    setShowAccountScrolldown((prev) => !prev);  
    setShowNotifications(false); // Close notifications if open
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1500px] min-h-[1000px] p-5">
        <div className="relative w-full max-w-[1409px] mx-auto">
          {/* Header */}
          <header className="w-full bg-[#5a96f0c7] rounded-[30px] h-14 flex items-center justify-between px-6">
            <Button className="[font-family:'Pompiere',Helvetica] font-normal text-white text-[40px]" onClick={handleLogoClick}>
              Spliter
            </Button>

            <div className="flex items-center gap-4 relative z-50" ref={notifRef}>
              <Button variant="ghost" size="icon" className="text-white" onClick={handleBellClick}>
                <BellIcon className="w-[30px] h-[30px]" />
              </Button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-[380px] bg-white shadow-lg rounded-lg border z-50 max-h-[400px] overflow-y-auto"
                  >
                    <div className="p-4 border-b font-bold text-gray-800">What's new?</div>
                    {notifications.map((notif, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 border-b hover:bg-gray-100 text-sm text-gray-800"
                      >
                        <div>{notif.title}</div>
                        <div className="text-xs text-gray-500">{notif.time}</div>
                      </div>
                    ))}
                    <div className="text-center py-2 text-green-600 font-medium hover:underline cursor-pointer">
                      See all
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center">
                <Avatar className="w-[34px] h-[33px] bg-[#d9d9d9]">
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <span className="ml-2 [font-family:'Poetsen_One',Helvetica] font-normal text-white text-2xl">
                  user's name
                </span>
                <div className="flex items-center gap-4 relative z-50" ref={notifRef}>
                  <Button variant="ghost" size="icon" className="text-white" onClick={handleAvatarClick}>
                    <ChevronDownIcon className="w-6 h-6 text-white ml-1" />
                  </Button>

                  {/* ChevronDownIcon Dropdown */}
                  <AnimatePresence>
                    {showAccountScrolldown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-[200px] bg-white shadow-lg rounded-[15px] border z-50 max-h-[400px] overflow-y-auto "
                      >
                        {accountScroll.map((accScr, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 border-b hover:bg-gray-100 text-[20px] text-gray-800 text-center rounded-[15px]"
                          >
                            <div>{accScr.title}</div>
                            <div className="text-xs text-gray-500">{}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

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

export default Dashboard_group;