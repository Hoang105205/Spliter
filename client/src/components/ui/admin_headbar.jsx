import { BellIcon, ChevronDownIcon, PlusIcon, Camera, PencilIcon } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.jsx";
import { Button } from "./button.jsx";
import { Separator } from "./seperator.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Report from "../popup/report.jsx";
import InputFile from "./inputfile.jsx";

// API
import { useUser } from '../../hooks/useUser.js';
import { useFriend } from '../../hooks/useFriend.js';
import { useActivity } from '../../hooks/useActivity.js';
import { useGroupMember } from '../../hooks/useGroupMember.js';
import { useNotification } from '../../hooks/useNotification.js'; // ✅ Thêm useNotification

// WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';


const accountScroll = [
  { title: "Account" },
  { title: "Logout" },
];

function Admin_head_bar(){

  const navigate = useNavigate();
  
  // Function to get first letter of username for avatar fallback
  const getInitials = (username) => {
    if (!username) return "A";
    return username.charAt(0).toUpperCase();
  };
  

  // State management
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountScrolldown, setShowAccountScrolldown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Active Notification
  const [activeRequestId, setActiveRequestId] = useState(null);

  // Report popup
  const [showReportPopup, setShowReportPopup] = useState(false);
  
  // State cho modal xem tất cả notification
  const [showAllNotiModal, setShowAllNotiModal] = useState(false);

  // State cho popup account
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  // User data
  const { clearUserData, userData, getAvatar, handleChangePassword, setAvatar } = useUser();

  //Activities data
  const { clearActivityData } = useActivity();

  // Friend requests
  const { fetchPendingRequests, requests, acceptFriendRequest, denyFriendRequest, clearFriendData } = useFriend();

  // Group data
  const { fetchPendingInvites, pendingInvites, clearGroups, acceptInvite, declineInvite } = useGroupMember();

  // Notifications
  const { fetchNotifications, notifications, notificationTrigger, markAsRead } = useNotification();

  // Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);
  

  const notifRef = useRef(null);
  const accountRef = useRef(null);
  const friendRequestPopupRef = useRef(null);

  useEffect(() => {
    if (userData.id) {
      fetchPendingRequests(userData.id);
      fetchPendingInvites(userData.id);
      fetchNotifications(userData.id); // Fetch notifications when userData.id changes
    }
  }, [userData.id, notificationTrigger]); // Re-fetch notifications when trigger changes

  // Handle Log out
  const handleLogout = async () => {
    setShowLogoutModal(false);

    // Clear all user-related data
    await clearUserData();
    await clearActivityData();
    await clearFriendData();
    await clearGroups();

    // clear localStorage 
    localStorage.removeItem("token");
    
    // fetch data after clearing
    const clearedData = useUser.getState().userData;
    const clearedActivityData = useActivity.getState().activities;
    const clearedFriendData = useFriend.getState().requests;
    const clearedGroupData = useGroupMember.getState().groups;

    // Check if all data is cleared
    const isUserCleared = Object.values(clearedData).every(v => !v);
    const isActivityCleared = Object.keys(clearedActivityData).length === 0;
    const isFriendCleared = clearedFriendData.length === 0;
    const isGroupCleared = clearedGroupData.length === 0;

    // If all data is cleared, navigate to login
    if (isUserCleared && isActivityCleared && isFriendCleared && isGroupCleared) {
      navigate("/login");
    } else {
      console.error("Failed to clear userData completely!");
    }
  };

  // Khi bấm vào bell icon, chỉ mở/đóng dropdown, KHÔNG markAsRead nữa
  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setShowAccountScrolldown(false);
  };

  // Khi dropdown notification đóng, markAsRead cho các system notification chưa đọc
  const prevShowNotifications = useRef(false);
  useEffect(() => {
    if (prevShowNotifications.current && !showNotifications) {
      // Dropdown vừa đóng
      const unreadSystemNotiIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadSystemNotiIds.length > 0 && userData.id) {
        Promise.all(unreadSystemNotiIds.map(id => markAsRead(id))).then(() => {
          fetchNotifications(userData.id);
          // Trigger UI update
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              useNotification.getState().incrementNotificationTrigger();
            }, 100);
          }
        });
      }
    }
    prevShowNotifications.current = showNotifications;
  }, [showNotifications]);

  const handleAvatarClick = () => {
    setShowAccountScrolldown((prev) => !prev);
    setShowNotifications(false);
  };

  const handleLogoClick = () => {
    navigate(`/admin/dashboard/${userData.id}`);
  };


  // Format friend requests into notifications
  const friendRequestNotifs = requests.map((r) => ({
    id: r.id,
    title: `Friend request from ${r.requester.username}`,
    type: "friend",
  }))

  
  // Format group invites into notifications
  const groupRequestNotifs = pendingInvites.map((invite) => ({
    id: invite.id,
    title: `Join group invite: ${invite.name}`,
    type: "group",
  }));

  // Format system notifications (chỉ lấy các noti chưa đọc)
  const systemNotifs = notifications.filter(n => !n.isRead).map((n) => ({
    id: n.id,
    title: n.description,
    type: "system",
  }));

  const combinedNotifs = [...friendRequestNotifs, ...groupRequestNotifs, ...systemNotifs]
  
  //Handle accept friend request
  const handleAccept = async (requestId, type) => {
    try {
      if (type === "friend") {
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
      }
      else if (type === "group") {
        const invite = pendingInvites.find(i => i.id === Number(requestId));
        
        await acceptInvite(invite.id, userData.id);

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "ACCEPT_JOIN_GROUP_REQUEST",
            payload: {
              groupId: invite.id,
              accepterId: userData.id,
              ownerId: invite.ownerId,
            }
          }));
        }
      }
      setActiveRequestId(null);
      await fetchPendingRequests(userData.id);
      await fetchPendingInvites(userData.id);
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  //Handle decline friend request
  const handleDecline = async (requestId, type) => {
    try {
      if (type === "friend") {
        const request = requests.find(r => r.id === Number(requestId));
        await denyFriendRequest(requestId);


        // Gửi socket thông báo cho cả requester và accepter
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "DECLINE_FRIEND_REQUEST",
            payload: {
              declinerId: userData.id,
              requesterId: request?.requester?.id // có thể giúp server nhẹ hơn
            }
          }));
        }

      }
      else if (type === "group") {
        const invite = pendingInvites.find(i => i.id === Number(requestId));
        await declineInvite(invite.id, userData.id);


        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "DECLINE_JOIN_GROUP_REQUEST",
            payload: {
              groupId: invite.id, // BỔ SUNG groupId
              declinerId: userData.id,
              ownerId: invite.ownerId // BỔ SUNG ownerId
            }
          }));
        }
      }
      await fetchPendingRequests(userData.id);
      await fetchPendingInvites(userData.id);
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

    if (userData.id) {
      getAvatar(userData.id).then((url) => {
        if (isMounted) {
          setAvatarUrl(url);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [userData.id, userData.avatarURL]);

  // Lock scroll khi mở modal See All Notifications
  useEffect(() => {
    if (showAllNotiModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAllNotiModal]);

  // Lock scroll khi mở popup account
  useEffect(() => {
    if (showAccountPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAccountPopup]);

  // Handle account popup functions
  const handlePasswordChange = async () => {
    if (editPassword) {
      // Save password changes
      try {
        const result = await handleChangePassword(currentPassword, newPassword);
        if (result.success) {
          setEditPassword(false);
          setCurrentPassword("");
          setNewPassword("");
        }
      } catch (error) {
        console.error("Failed to change password:", error);
      }
    } else {
      // Start editing password
      setEditPassword(true);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      await setAvatar(file);
      // Sau khi upload thành công, lấy lại avatar mới nhất
      if (userData.id) {
        const newUrl = await getAvatar(userData.id);
        setAvatarUrl(newUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image: " + error.message);
    }
  };

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
            <div className="relative" ref={notifRef}>
              <Button variant="ghost" size="icon" className="text-white" onClick={handleBellClick}>
                <BellIcon className="w-[30px] h-[30px]" />

                {/* Notification Badge */}
                {combinedNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-[6px] py-[1px] rounded-full border border-white shadow-md">
                    {combinedNotifs.length > 99 ? '99+' : combinedNotifs.length}
                  </span>
                )}
              </Button>
            </div>
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
                  {combinedNotifs.map((notif, index) => (
                    <div
                      key={notif.id}
                      onClick={notif.type === "system" ? undefined : () => setActiveRequestId({ id: notif.id, type: notif.type })}
                      className={`px-4 py-2 border-b text-sm text-gray-800 cursor-pointer ${notif.type === "system" ? "opacity-60 cursor-default" : "hover:bg-gray-100"}`}
                    >
                      <div>{notif.title}</div>
                    </div>
                  ))}

                  <div className="text-center py-2 text-green-600 font-medium hover:underline cursor-pointer"
                    onClick={() => setShowAllNotiModal(true)}
                  >
                    See all
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar & Dropdown */}
          <div className="flex items-center" ref={accountRef}>
            <Avatar className="w-[34px] h-[33px] bg-[#d9d9d9]">
              {(avatarUrl || userData.avatarURL) ? (
                <img
                  src={avatarUrl || userData.avatarURL}
                  alt={userData.username}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <AvatarFallback>
                  {getInitials(userData.username)}
                </AvatarFallback>
              )}
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
                          setShowAccountPopup(true);
                          setShowAccountScrolldown(false);
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

      {/* Account Popup */}
      <AnimatePresence>
        {showAccountPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAccountPopup(false);
                setEditPassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setShowAvatarPopup(false);
              }
            }}
          >
            <div className="bg-white p-6 rounded-[20px] shadow-lg w-[700px] h-[550px] flex flex-col">
              <h2 className="text-2xl font-bold mb-6 text-center">Account Information</h2>
              
              <div className="flex-1 flex">
                {/* Left side - Avatar */}
                <div className="flex flex-col items-center w-[250px] pr-6">
                  <div className="relative w-[150px] h-[150px] mb-4">
                    <Avatar className="w-full h-full bg-[#d9d9d9]">
                      {(avatarUrl || userData.avatarURL) ? (
                        <img
                          src={avatarUrl || userData.avatarURL}
                          alt={userData.username}
                          className="w-full h-full rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(userData.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <button
                      onClick={() => setShowAvatarPopup(true)}
                      className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 
                                border border-gray-300 rounded-full p-2 shadow-md cursor-pointer">
                      <Camera className="w-5 h-5 text-gray-600" />
                    </button>

                    {showAvatarPopup && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                        <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 w-[320px] h-auto flex flex-col">
                          <h2 className="font-bold text-lg text-center">Change Avatar</h2>
                          <div className="flex flex-row items-center justify-center gap-3">
                            <div className="[&_label]:!text-sm [&_label]:!px-3 [&_label]:!py-2 [&_label]:!h-10">
                              <InputFile
                                onChange={async (e) => {
                                  await handleImageChange(e);
                                  setShowAvatarPopup(false);
                                }}
                                label="Upload image"
                              />
                            </div>
                            <button
                              onClick={() => setShowAvatarPopup(false)}
                              className="w-[90px] h-10 rounded-full bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors 
                                        duration-200 border border-transparent hover:border-white">
                              <span className="text-white font-medium text-sm">
                                Cancel
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Account Info */}
                <div className="flex-1 space-y-6">
                  {/* Username - Read only */}
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-700">Username</label>
                    <p className="text-gray-600 text-lg">{userData.username}</p>
                  </div>

                  {/* Email - Read only */}
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-700">Email</label>
                    <p className="text-gray-600 text-lg">{userData.email}</p>
                  </div>

                  {/* Password Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-start">
                      <label className="block text-lg font-semibold text-gray-700">Password</label>
                      {!editPassword && (
                        <button
                          onClick={handlePasswordChange}
                          className="flex items-center text-blue-500 hover:text-blue-700 ml-[120px]"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Change Password
                        </button>
                      )}
                    </div>
                    
                    {!editPassword ? (
                      <p className="text-gray-600 text-lg">••••••••••••</p>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex gap-3">
                          <Button 
                            onClick={handlePasswordChange}
                            className="w-[100px] h-9 rounded-full bg-[#5a96f0] hover:bg-[#4a86e0] text-white"
                          >
                            Save
                          </Button>
                          <Button 
                            onClick={() => {
                              setEditPassword(false);
                              setCurrentPassword("");
                              setNewPassword("");
                              setShowAvatarPopup(false);
                            }}
                            className="w-[100px] h-9 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => {
                    setShowAccountPopup(false);
                    setEditPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setShowAvatarPopup(false);
                  }}
                  className="w-[120px] h-10 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  onClick={handleLogout}
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
            const { id: requestId, type } = activeRequestId;
            let content;

            if (type === "friend") {
              const activeRequest = requests.find((r) => r.id === requestId);
              content = (
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
                      onClick={() => handleAccept(requestId, type)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() => handleDecline(requestId, type)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            } else if (type === "group") {
              const activeInvite = pendingInvites.find((i) => i.id === requestId);
              content = (
                <div
                  ref={friendRequestPopupRef}
                  className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-bold mb-4">
                    Join Group Invite: {activeInvite?.name || "Unknown Group"}
                  </h2>
                  <p className="mb-4">Do you want to accept this invite?</p>
                  <div className="flex justify-between">
                    <Button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      onClick={() => handleAccept(requestId, type)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() => handleDecline(requestId, type)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
                onClick={() => setActiveRequestId(null)}
              >
                {content}
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <Report show={showReportPopup} onClose={() => setShowReportPopup(false)} ws={ws} />

      {/* See All Notifications Modal */}
      <AnimatePresence>
        {showAllNotiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]"
            onClick={() => setShowAllNotiModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] max-h-[70vh] flex flex-col items-center p-0 relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full text-center text-xl font-bold py-4 border-b">All Notifications</div>
              <div className="w-full flex-1 overflow-y-auto" style={{ maxHeight: '50vh' }}>
                {notifications.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No notifications.</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={notif.id || idx}
                      className={`px-6 py-3 border-b text-base text-gray-800 ${notif.isRead ? 'opacity-60' : ''}`}
                    >
                      {notif.description}
                    </div>
                  )))
                }
              </div>
              <button
                className="w-32 mx-auto my-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-full text-lg font-semibold text-gray-700"
                onClick={() => setShowAllNotiModal(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

export default Admin_head_bar;