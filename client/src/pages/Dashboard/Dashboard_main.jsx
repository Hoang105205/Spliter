import { PlusIcon } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Head_bar from "../../components/ui/headbar.jsx";
import Left_bar from "../../components/ui/leftbar.jsx";
import { toast } from "sonner"

// API
import { useUser } from '../../hooks/useUser.js';
import { useFriend } from '../../hooks/useFriend.js';

// WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';

function Dashboard_main() {

  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [expenseUsers, setExpenseUsers] = useState([]);
  const [friendsWithAvatars, setFriendsWithAvatars] = useState([]);

  // Custom hooks for user and friend management
  const { userData, findUser, getAvatar, revokeAvatarUrl } = useUser(); // Lấy trạng thái người dùng từ hook useUser
  const { fetchFriends, friends, deleteFriend } = useFriend();

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    friendId: null,
    friendshipId: null,
  });
  
  // Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);

  useEffect(() => {
    if (userData.id) {
      fetchFriends(userData.id);
    }
  }, [userData.id, fetchFriends]);

  useEffect(() => {
    let isMounted = true;
    const urlsToRevoke = [];

    const loadAvatars = async () => {
      // Lấy tất cả friends hiện tại, không chỉ newFriends
      const avatarPromises = friends.map(async (friend) => {
        let avatarURL = null;
        try {
          avatarURL = await getAvatar(friend.id); // Sẽ trả về null nếu 404
        } catch (err) {
          // Im lặng các lỗi, chỉ log nếu cần debug
          // console.log('Error loading avatar:', err); // Bỏ comment nếu cần debug
        }
        if (avatarURL) urlsToRevoke.push(avatarURL);
        return { ...friend, avatarURL };
      });

      const newAvatars = await Promise.all(avatarPromises);
      if (isMounted) {
        setFriendsWithAvatars(newAvatars); // Gán toàn bộ danh sách mới
      }
    };

    if (friends.length > 0) {
      loadAvatars();
    } else {
      if (isMounted) {
        setFriendsWithAvatars([]); // Reset khi không có bạn
      }
    }

    return () => {
      isMounted = false;
      urlsToRevoke.forEach((url) => revokeAvatarUrl(url));
    };
  }, [friends, getAvatar, revokeAvatarUrl]); // Chỉ phụ thuộc vào friends

  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [search, setSearch] = useState("");
  
  const handleSearch = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const user = await findUser(search);
        if (user) {
          // Kiểm tra nếu người dùng không phải là chính mình và không phải là bạn bè
          const isSelf = user.username === userData.username;
          const isFriend = friends.some((friend) => friend.id === user.id);
          if (!isSelf && !isFriend) {
            setFilteredUsers([{ id: user.id, username: user.username }]);
          } else {
            setFilteredUsers([]);
            if (isSelf) {
              toast.info("You cannot add yourself as a friend!");
            } else if (isFriend) {
              toast.info("This user is already your friend!");
            }
          }
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Error finding user:', error);
        setFilteredUsers([]);
      }
      setLoading(false);
    }, 500);
  };

  const handleExpenseUserSearch = () => {
    setLoading(true); // Hiển thị trạng thái loading
    setTimeout(async() => {
      try {
        const user = await findUser(search);
        if (user && user.username !== userData.username) {
          setExpenseUsers([{ id: user.id, username: user.username }]);
        } else {
          setExpenseUsers([]); // No matching user
        }
        console.log('User found:', user.username);
      } catch (error) {
        console.error('Error finding user:', error);
        setExpenseUsers([]); // Reset results
      }

      setLoading(false); // Tắt trạng thái loading
    }, 500); // Giả lập độ trễ của API (500ms)
  };

  const handleAddFriend = (user) => {
    if (!ws) {
      toast.error('There is a problem. Please refresh the page.');
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(
          JSON.stringify({
            type: "ADD_FRIEND",
            payload:
              {
                senderId: userData.id,
                receiverId: user.id,
              },
          })
        );
        toast.success(`Friend request sent to ${user.username}!`);
        
      } catch (err) {
        console.error("Failed to send friend request:", err);
        toast.error("Failed to send friend request. Please try again.");
      }
      finally {
        setFilteredUsers([]); // Reset search results
        setSearch(""); // Clear search input
        setLoading(false); // Reset loading state
        setShowAddModal(false); // Close the modal after sending request
      }

    } else {
      toast.error("WebSocket connection is not open.");
    }
  };

  const handleAddExpenseFriends = (users) => {
    if (!ws) {
      console.error('WebSocket instance is not available.');
      alert('WebSocket connection is not available. Please try again later.');
      return;
    }

    // if (ws.readyState === WebSocket.OPEN) {
    //   ws.send(
    //     // chua co api (chac z, ehehehhe)
    //     JSON.stringify({
    //       type: 'ADD_DEBT',
    //       payload: {
    //         senderId: userData.id, // ID of the current user
    //         receiverId: user.id,  // ID of the user to be added expense
    //       },
    //     })
    //   );
      console.log(`Sent friend request to user ${users.username}`);
    // } else {
    //   console.error('WebSocket connection is not open.');
    //   alert('WebSocket connection is not open. Please try again later.');
    // }
  }
  

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showAddModal || showExpenseModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddModal, showExpenseModal]);

  // Clear search/filter state when Add Friend modal closes
  useEffect(() => {
    if (!showAddModal) {
      setSearch("");
      setFilteredUsers([]);
    }
  }, [showAddModal]);

  const handleContextMenu = (e, friendId, friendshipId) => {
    e.preventDefault();
    const menuWidth = 140; // Minimum width for the context menu
    const menuHeight = 40; // Minimum height for the context menu
    let x = e.clientX;
    let y = e.clientY;
    const padding = 8; // Padding from the edges of the viewport

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding; // Adjust x position if it exceeds
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding; // Adjust y position if it exceeds
    }

    setContextMenu({
      visible: true,
      x,
      y,
      friendId: friendId,
      friendshipId: friendshipId
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
    if (contextMenu.visible) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [contextMenu.visible]);

  const handleUnfriend = async () => {
    if (contextMenu.friendId) {
      try {
        await deleteFriend(contextMenu.friendshipId);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'UNFRIEND',
              payload: {
                userId: userData.id, // ID of the current user
                friendId: contextMenu.friendId, // ID of the friend to unfriend
              },
            })
          );
          
        } else {
          console.error('WebSocket connection is not open.');
          alert('WebSocket connection is not open. Please try again later.');
        }
        
        // Loại bỏ bạn khỏi friendsWithAvatars ngay lập tức
        setFriendsWithAvatars((prev) =>
          prev.filter((friend) => friend.id !== contextMenu.friendId)
        );

        // Làm mới danh sách bạn bè sau khi xóa
        await fetchFriends(userData.id);
        
        
        setContextMenu({ ...contextMenu, visible: false });
      } catch (error) {
        console.error('Error unfriending user:', error);
        alert('Failed to unfriend user. Please try again later.');
      }
    } else {
      console.error('No friend ID available for unfriend action.');
      alert('No friend selected to unfriend.');
    }
  };

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

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("dashboard"); // or "recently", etc.

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1500px] min-h-[1000px] p-5">
        <div className="relative w-full max-w-[1409px] mx-auto">
          {/* Header */}
          <Head_bar/>

          {/* Main Content */}
          <div className="flex mt-4">
            {/* Left Sidebar */}
            <Left_bar activeTab={activeTab} setActiveTab={setActiveTab} />

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
                  <Button className="h-[57px] bg-[#ed5050] hover:bg-[#ed5050]/90 rounded-[10px] [font-family:'Roboto_Condensed',Helvetica] text-white text-3xl"
                          onClick={() => setShowExpenseModal(true)}>
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
                <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowAddModal(true)}>
                  <PlusIcon className="w-6 h-6" />
                </Button>
              </div>

              <div className="mt-4 space-y-6">
                {friendsWithAvatars.map((friend) => (
                  <div key={friend.id} className="relative flex items-center group" onContextMenu={(e) => handleContextMenu(e, friend.id, friend.friendshipId)}>
                    <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] z-10"></div>
                    <div className="relative flex items-center z-20 px-1 py-1">
                      <Avatar className="w-[53px] h-[53px] bg-[#d9d9d9]">
                        {friend.avatarURL ? (
                          <img
                            src={friend.avatarURL}
                            alt={friend.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback>
                            {friend.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="ml-2 [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-lg">
                      {friend.username}
                    </div>
                  </div>
                ))}

                {contextMenu.visible && (
                  <div
                    className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 px-4"
                    style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 120, maxWidth: '90wh', maxHeight: '90vh', overflow: 'auto' }}
                  >
                    <button
                      className="w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
                      onClick={() => {
                        // Handle remove friend action
                        handleUnfriend();
                      }}
                    >
                      Unfriend
                    </button> 
                  </div>
                )}
              </div>
            </aside>
            
            <AnimatePresence>
              {showAddModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
                  onClick={(e) => {
                    if (e.target === e.currentTarget){
                      setFilteredUsers([]); // Reset search results when closing modal
                      setSearch(""); // Clear search input
                      setLoading(false); // Reset loading state
                      setShowAddModal(false); // Close the modal
                    } 
                  }}
                >
                  <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[700px] h-[500px] flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Add a Friend</h2>
                    <input
                      type="text"
                      placeholder="Enter friend's name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />
                    <div
                      className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow"
                      style={{ maxHeight: "250px" }}
                    >
                      {filteredUsers.length === 0 && !loading && <p className="text-gray-500">No matching users</p>}
                      {loading && <p className="text-gray-500">Loading...</p>}
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex justify-between items-center px-2 py-1 border rounded-[20px]">
                          <span>{user.username}</span>
                          <Button
                            size="sm"
                            className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                            onClick={() => handleAddFriend(user)}
                          >
                            + Friend
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                        onClick={() => {
                          setSearch("");
                          setFilteredUsers([]);
                          setShowAddModal(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showExpenseModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
                  onClick={(e) => {
                    if (e.target === e.currentTarget)
                      {
                        setSearch(""); // Reset search input
                        setExpenseUsers([]); // Reset expense users
                        setLoading(false); // Reset loading state
                        setShowExpenseModal(false); // Close the modal
                      }
                  }}
                >
                  <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[600px] h-[500px] gap-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Add a new Expense</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col w-full">
                        <input
                          type="text"
                          placeholder="Enter a title"
                          className="border-b border-gray-300 focus:outline-none text-center mb-2"
                        />
                        <div className="flex items-center justify-center text-lg font-medium border-b border-dotted border-gray-400 pb-1">
                          <input type="number" placeholder="0" className="text-right w-24 focus:outline-none" />
                          <span className="ml-1">đ</span>
                        </div>
                        <textarea
                          className="resize-none w-[300px] h-[150px] focus:border-0 focus:outline-none [font-family:'Roboto_Condensed',Helvetica] font-normal text-[#b3b3b3] text-base"
                          placeholder="There is still nothing here, how about you spice something up?"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      Paid by{" "}
                      <span className="inline-block bg-gray-200 px-2 py-1 rounded-full min-w-[50px]"></span> and
                      split{" "}
                      <span className="inline-block bg-gray-200 px-2 py-1 rounded-full min-w-[50px]"></span>
                      <div className="text-xs text-gray-500 mt-1">(0.00đ/person)</div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-full">Date</button>
                      <button className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-full">Group or individual</button>
                    </div>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
                      onClick={() => {}}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-full transition-colors"
                      onClick={() => {
                        setSearch("");
                        setExpenseUsers([]);
                        setShowExpenseModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] h-[500px] translate-x-5 flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Add expense with Friend(s)</h2>
                    <input
                      type="text"
                      placeholder="Enter friend's name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleExpenseUserSearch();
                      }}
                    />
                    <div
                      className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow"
                      style={{ maxHeight: "250px" }}
                    >
                      {search === "" &&
                        friendsWithAvatars.map((friend) => (
                          <div key={friend.id} className="flex justify-between items-center px-2 py-1 border rounded-[20px]">
                            <span>{friend.username}</span>
                            <Button
                              size="sm"
                              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                              onClick={() => handleAddExpenseFriends(friend)}
                            >
                              + Add
                            </Button>
                          </div>
                        ))}
                      {search !== "" && expenseUsers.length === 0 && !loading && (
                        <p className="text-gray-500">No matching users</p>
                      )}
                      {loading && <p className="text-gray-500">Loading...</p>}
                      {search !== "" &&
                        expenseUsers.map((user) => (
                          <div key={user.id} className="flex justify-between items-center px-2 py-1 border rounded-[20px]">
                            <span>{user.username}</span>
                            <Button
                              size="sm"
                              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                              onClick={() => handleAddExpenseFriends(user)}
                            >
                              + Add
                            </Button>
                          </div>
                        ))}
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

export default Dashboard_main;