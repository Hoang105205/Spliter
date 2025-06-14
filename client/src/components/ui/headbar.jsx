import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useUser } from '../../hooks/useUser.js';

// Button data
const notifications = [
  { title: "New update available", time: "2 hours ago" },
  { title: "Welcome to the app!", time: "1 day ago" },
];

const accountScroll = [
  { title: "Account" },
  { title: "Report" },
  { title: "Logout" },
];

function Head_bar(){

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountScrolldown, setShowAccountScrolldown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const { setUserData, userData } = useUser();

  const notifRef = useRef(null);
  const accountRef = useRef(null);

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setShowAccountScrolldown(false);
  };

  const handleAvatarClick = () => {
    setShowAccountScrolldown((prev) => !prev);
    setShowNotifications(false);
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current && !notifRef.current.contains(event.target) &&
        accountRef.current && !accountRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
        setShowAccountScrolldown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return(
    <>
      {/* Header */}
      <header className="w-full bg-[#5a96f0c7] rounded-[30px] h-14 flex items-center justify-between px-6">
        <Button onClick={handleLogoClick} className="[font-family:'Pompiere',Helvetica] font-normal text-white text-[40px]">
          Spliter
        </Button>

        <div className="flex items-center gap-4 relative z-50">
          {/* Notification Bell */}
          <div ref={notifRef}>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleBellClick}>
              <BellIcon className="w-[30px] h-[30px]" />
            </Button>
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
                    <div key={index} className="px-4 py-2 border-b hover:bg-gray-100 text-sm text-gray-800">
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
          </div>

          {/* Avatar & Dropdown */}
          <div className="flex items-center" ref={accountRef}>
            <Avatar className="w-[34px] h-[33px] bg-[#d9d9d9]">
              <AvatarFallback />
            </Avatar>
            {/*Username*/}
            <span className="ml-2 [font-family:'Poetsen_One',Helvetica] font-normal text-white text-2xl">
              {userData.username
                ? userData.username.length > 8
                  ? userData.username.slice(0, 8) + "..."
                  : userData.username
                : "User"}
            </span>
            <Button variant="ghost" size="icon" className="text-white ml-1" onClick={handleAvatarClick}>
              <ChevronDownIcon className="w-6 h-6 text-white" />
            </Button>

            <AnimatePresence>
              {showAccountScrolldown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-[200px] bg-white shadow-lg rounded-[15px] border z-50"
                >
                  {accountScroll.map((accScr, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 border-b hover:bg-gray-100 text-[20px] text-gray-800 text-center cursor-pointer"
                      onClick={() => {
                        if (accScr.title === "Account") {
                          navigate("/dashboard/account");
                        } else if (accScr.title === "Report") {
                          navigate("/dashboard/report");
                        } else if (accScr.title === "Logout") {
                          setShowLogoutModal(true);
                          setShowAccountScrolldown(false);
                        }
                      }}
                    >
                      {accScr.title}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[300px]">
              <h2 className="text-xl font-bold mb-2">ARE YOU SURE?</h2>
              <p className="mb-4">You will no longer be logged in on the server.</p>
              <div className="flex justify-around">
                <Button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setShowLogoutModal(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("userData");
                    setUserData({});
                    navigate("/login");
                  }}
                >
                  Log out
                </Button>
                <Button
                  className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Head_bar;