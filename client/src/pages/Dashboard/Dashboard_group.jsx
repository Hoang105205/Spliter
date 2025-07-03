import { PlusIcon, CrownIcon } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import Head_bar from "../../components/ui/headbar.jsx";
import Left_bar from "../../components/ui/leftbar.jsx";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Import custom hooks
import { useUser } from '../../hooks/useUser.js';
import { useGroupMember } from '../../hooks/useGroupMember.js';
import { useGroup } from "../../hooks/useGroup.js";
import { useFriend } from "../../hooks/useFriend.js";

// Import WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';

function Dashboard_group() {
  const navigate = useNavigate();

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("group"); // or "recently", etc.

  // State to hold selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // State to store avatar URLs for each member
  const [memberAvatars, setMemberAvatars] = useState({});

  // State to control the visibility of the add group member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // State for context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    memberId: null,
  });
  
  // Fetch user data
  const { userData, getAvatar, revokeAvatarUrl } = useUser();

  // Fetch groups that the user is a member of
  const { groups, loading, error, fetchGroups } = useGroupMember();

  // Fetch group details
  const { members: groupMembers, loading: membersLoading, error: membersError, getGroupmember } = useGroup();

  // Use friend hook
  const { friends, loading: friendsLoading, error: friendsError, fetchFriends } = useFriend();

  /// Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);
  

  // Check if current user is the group owner
  const isOwner = userData.id === selectedGroup?.ownerId;

  useEffect(() => {
    if (activeTab === 'group') {
      fetchGroups(userData.id);
    } else {
      setSelectedGroup(null); // Reset selected group when tab changes away from "group"
    }
  }, [activeTab, userData.id]);


  useEffect(() => {
    if (selectedGroup && activeTab === 'group') {
      getGroupmember(selectedGroup.id);
    } 
  }, [selectedGroup, activeTab, getGroupmember]);


  // Fetch avatars for group members
  useEffect(() => {
    let isMounted = true;

    const fetchMemberAvatars = async () => {
      if (groupMembers.length > 0 && activeTab === "group") {
        const avatarPromises = groupMembers.map(async (member) => {
          try {
            const avatarUrl = await getAvatar(member.id);
            return { memberId: member.id, avatarUrl };
          } catch (error) {
            console.error(`Failed to fetch avatar for member ${member.id}:`, error);
            return { memberId: member.id, avatarUrl: null };
          }
        });

        const avatars = await Promise.all(avatarPromises);
        if (isMounted) {
          const newAvatars = avatars.reduce((acc, { memberId, avatarUrl }) => {
            acc[memberId] = avatarUrl;
            return acc;
          }, {});
          setMemberAvatars(newAvatars);
        }
      } else {
        if (isMounted) setMemberAvatars({});
      }
    };

    fetchMemberAvatars();

    // Cleanup avatar URLs when unmount or members change
    return () => {
      isMounted = false;
      Object.values(memberAvatars).forEach((url) => revokeAvatarUrl(url));
    };
  }, [groupMembers, activeTab, getAvatar, revokeAvatarUrl]);




  // Lock background scroll when modal is open
  useEffect(() => {
    if (showAddMemberModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddMemberModal]);


  useEffect(() => {
    if (userData.id) {
      fetchFriends(userData.id);
    }
  }, [userData.id]);

  // Handle adding a member to the group
  const handleAddMember = async (friendId) => {
    if (!selectedGroup || !isOwner) {
      toast.error("You are not authorized to add members.");
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not connected. Please try again later.");
      return;
    }

    try {
      const message = {
        type: "ADD_GROUP_MEMBER",
        payload: {
          senderId: userData.id,
          groupId: selectedGroup.id,
          memberId: friendId,
          groupName: selectedGroup.name,
        },
      };
      ws.send(JSON.stringify(message));

      // Làm mới danh sách thành viên sau khi gửi request (tùy thuộc vào WebSocket response)
      await getGroupmember(selectedGroup.id);
      setShowAddMemberModal(false);
      toast.success("Member add request has been sent!");
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
      toast.error("Failed to add member. Please try again.");
    }
  };


  // Handle kick member
  const handleKickMember = async () => {
    if (!contextMenu.memberId || !isOwner) {
      toast.error("You are not authorized to kick members.");
      return;
    }

    // API here





    // Tìm username của member bị kick từ groupMembers
    const memberToKick = groupMembers.find(member => member.id === contextMenu.memberId);
    const memberUsername = memberToKick ? memberToKick.username : "Unknown User";

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not connected. Please try again later.");
      setContextMenu({ ...contextMenu, visible: false }); // Ẩn menu sau khi kick
      return;
    }

    try {
      const message = {
        type: "KICK_GROUP_MEMBER",
        payload: {
          ownerId: userData.id,
          groupId: selectedGroup.id,
          memberId: contextMenu.memberId,
          groupName: selectedGroup.name,
        },
      };
      ws.send(JSON.stringify(message));

      
    } catch (error) {
      console.error("Failed to send to server:", error);
      toast.error("Failed to send to server. Please try again.");
    }


    await getGroupmember(selectedGroup.id); // Làm mới danh sách thành viên
    setContextMenu({ ...contextMenu, visible: false }); // Ẩn menu sau khi kick
    toast.info(`Member ${memberUsername} has been kicked!`);
  };

  // Handle context menu click
  const handleContextMenu = (e, memberId) => {
    e.preventDefault();
    if (!isOwner || memberId === userData.id) {
      setContextMenu({ ...contextMenu, visible: false }); // Đảm bảo tắt menu nếu không hợp lệ
      return;
    }

    const menuWidth = 140;
    const menuHeight = 40;
    let x = e.clientX;
    let y = e.clientY;
    const padding = 8;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - padding;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - padding;

    setContextMenu({
      visible: true,
      x,
      y,
      memberId,
    });
  };

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && !e.target.closest('.context-menu')) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    if (contextMenu.visible) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.visible]);

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1500px] min-h-[1000px] p-5">
        <div className="relative w-full max-w-[1409px] mx-auto">
          {/* Header */}
          <Head_bar />

          {/* Main Content */}
          <div className="flex mt-4">
            {/* Left Sidebar */}
            <Left_bar activeTab={activeTab} setActiveTab={setActiveTab} onGroupSelect={setSelectedGroup} />

            {/* Main Content Area */}
            <main className="flex-1 px-4">
              {activeTab === 'group' && selectedGroup && (
                // Hiển thị thông tin nhóm chỉ khi activeTab là "group" và có nhóm được chọn
                <div className="mt-4">
                  <h2 className="[font-family:'Roboto',Helvetica] text-3xl font-bold text-[#193865]">
                    {selectedGroup.name}
                  </h2>
                </div>
              )}


              {/* Hiển thị chung chung ở đây khi không có nhóm được chọn và activeTab là "group" */}
            </main>


            {/* Right Sidebar - Only show when group is selected */}
            {activeTab === 'group' && selectedGroup && (
              <aside className="w-[269px] h-screen pl-4 border-l-4 border-[#4A73A8]">
                <div className="bg-[#cccccc]/30 rounded-[15px] h-[38px] flex items-center justify-between px-3.5">
                  <span className="[font-family:'Roboto',Helvetica] text-[#666666] text-xl">
                    Group Members
                  </span>
                  {isOwner && (
                    <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowAddMemberModal(true)}>
                      <PlusIcon className="w-6 h-6" />
                    </Button>
                  )}
                </div>

                <div className="mt-4 space-y-6">
                  {membersLoading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                  ) : membersError ? (
                    <p className="text-center text-red-500">Error: {membersError}</p>
                  ) : groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center relative group"
                        onContextMenu={(e) => handleContextMenu(e, member.id)}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] z-10"></div>
                        <div className="relative flex items-center z-20 px-1 py-1">
                          <Avatar className="w-[53px] h-[53px] bg-[#d9d9d9]">
                            {memberAvatars[member.id] ? (
                              <img
                                src={memberAvatars[member.id]}
                                alt={member.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {member.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <div className="ml-2 [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-lg">
                          {member.username}
                        </div>
                        {member.id === selectedGroup?.ownerId && (
                          <CrownIcon className="w-5 h-5 text-yellow-500 ml-2" /> // Biểu tượng vương miện
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No members found.</p>
                  )}
                </div>
              </aside>
            )}

            {/* Context Menu for Kick Member */}
            {contextMenu.visible && isOwner && (
              <div
                className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 px-4 context-menu"
                style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 120, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
              >
                <button
                  className="w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
                  onClick={handleKickMember}
                >
                  Kick Member
                </button>
              </div>
            )}


            <AnimatePresence>
              {showAddMemberModal && activeTab === "group" && selectedGroup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
                >
                  <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[700px] h-[500px] flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Add a Friend</h2>
                    {/* Display friend list from useFriend */}
                    <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow" style={{ maxHeight: "350px" }}>
                      {friendsLoading ? (
                        <p className="text-gray-500">Loading friends...</p>
                      ) : friendsError ? (
                        <p className="text-red-500">Error: {friendsError}</p>
                      ) : friends.length > 0 ? (
                        friends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                          >
                            <span>{friend.username}</span>
                            <Button
                              size="sm"
                              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                              onClick={() => handleAddMember(friend.id)}
                              disabled={groupMembers.some((member) => member.id === friend.id)} // Disable if already a member
                            >
                              + Member
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No friends available.</p>
                      )}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                        onClick={() => setShowAddMemberModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_group;