import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Report from "../../components/popup/report.jsx";

// API
import { useUser } from '../../hooks/useUser.js';
import { useFriend } from '../../hooks/useFriend.js';

// WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';

// Button data
const notifications = [
  
];




const accountScroll = [
  { title: "Account" },
  { title: "Report" },
  { title: "Logout" },
];

function Head_bar(){

  const navigate = useNavigate();

  // State management
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountScrolldown, setShowAccountScrolldown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Active Notification
  const [activeRequestId, setActiveRequestId] = useState(null);

  // Report popup
  const [showReportPopup, setShowReportPopup] = useState(false);
  

  // User data
  const { clearUserData, userData, getAvatar, revokeAvatarUrl } = useUser();

  // Friend requests
  const { fetchPendingRequests, requests, acceptFriendRequest, denyFriendRequest } = useFriend();


  // Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);
  

  const notifRef = useRef(null);
  const accountRef = useRef(null);
  const friendRequestPopupRef = useRef(null);

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      const next = !prev;
      if (next && userData.id) {
        fetchPendingRequests(userData.id); // ✅ GỌI MỖI LẦN MỞ
      }
      return next;
    });
    setShowAccountScrolldown(false);
  };

  const handleAvatarClick = () => {
    setShowAccountScrolldown((prev) => !prev);
    setShowNotifications(false);
  };

  const handleLogoClick = () => {
    navigate(`/dashboard/${userData.id}`);
  };

  // Fetch friend requests when userData.id changes
  useEffect(() => {
    if (userData.id) {
      fetchPendingRequests(userData.id);
    }
  }, [userData.id]);

  // Format friend requests into notifications
  const friendRequestNotifs = requests.map((r) => ({
    title: `Friend request from Username: ${r.requester.username}`,
    time: '', // có thể format thời gian nếu cần
  }));

  const combinedNotifs = [...friendRequestNotifs, ...notifications];


  //Handle accept friend request
  const handleAccept = async (requestId) => {
    try {
      const request = requests.find(r => r.id === Number(requestId));

      await acceptFriendRequest(requestId);

      // Gửi socket thông báo cho cả requester và accepter
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "ACCEPT_FRIEND_REQUEST",
          payload: {
            requestId,
            accepterId: userData.id,
            requesterId: request?.requester?.id // có thể giúp server nhẹ hơn
          }
        }));
      }

      setActiveRequestId(null);
      // Có thể bỏ dòng sau nếu server gửi lại 'FRIEND_ACCEPTED' rồi client xử lý realtime
      await fetchPendingRequests(userData.id);
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  //Handle decline friend request
  const handleDecline = async (requestId) => {
    try {
      await denyFriendRequest(requestId);
      await fetchPendingRequests(userData.id);
      setActiveRequestId(null);
    } catch (err) {
      console.error("Decline failed:", err);
    }
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

      if (
        friendRequestPopupRef.current && !friendRequestPopupRef.current.contains(event.target)
      ) {
        setActiveRequestId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    let isMounted = true;
    let oldUrl = avatarUrl;

    if (userData.id) {
      getAvatar(userData.id).then((url) => {
        if (isMounted) {
          setAvatarUrl(url);
          if (oldUrl) revokeAvatarUrl(oldUrl);
        }
      });
    }

    return () => {
      isMounted = false;
      if (avatarUrl) revokeAvatarUrl(avatarUrl);
    };
  }, [userData.id]);

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
                  
                  {/* On-click notifications */}
                  {requests.map((r, index) => (
                    <div
                      key={r.id}
                      onClick={() => setActiveRequestId(r.id)}
                      className="px-4 py-2 border-b hover:bg-gray-100 text-sm text-gray-800 cursor-pointer"
                    >
                      <div>Friend request from: {r.requester.username}</div>
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
              <AvatarImage src={avatarUrl || userData.avatarURL} />
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
                          navigate(`/dashboard/${userData.id}/account`);
                        } else if (accScr.title === "Report") {
                          setShowReportPopup(true);
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
                  onClick={async () => {
                    setShowLogoutModal(false);

                    await clearUserData();

                    localStorage.removeItem("token");
                    
                    const clearedData = useUser.getState().userData;
                    
                    if (!clearedData.id && !clearedData.username && !clearedData.email) {
                      navigate("/login");
                    } else {
                      console.error("Failed to clear userData completely!");
                    }
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


      <AnimatePresence>
        {activeRequestId && (
          (() => {
            const activeRequest = requests.find((r) => r.id === activeRequestId);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
                onClick={() => setActiveRequestId(null)}
              >
                <div
                  ref={friendRequestPopupRef}
                  className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-bold mb-4">
                    Friend Request from {activeRequest?.requester?.username || "Unknown"}
                  </h2>
                  <p className="mb-4">Do you want to accept this request?</p>
                  <div className="flex justify-between">
                    <Button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      onClick={() => handleAccept(activeRequestId)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() => handleDecline(activeRequestId)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <Report show={showReportPopup} onClose={() => setShowReportPopup(false)} ws={ws} />

    </>
  );
}

export default Head_bar;