import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Head_bar from "../../components/ui/headbar.jsx";
import { use } from "react";
import Left_bar from "../../components/ui/leftbar.jsx";

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
  const [friendsWithAvatars, setFriendsWithAvatars] = useState([]);

  // Custom hooks for user and friend management
  const { userData, findUser, getAvatar, revokeAvatarUrl } = useUser(); // Lấy trạng thái người dùng từ hook useUser
  const { fetchFriends, friends } = useFriend();

  
  // Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);

  useEffect(() => {
    if (userData.id) {
      fetchFriends(userData.id);
    }
  }, [userData.id]);

  useEffect(() => {
    let isMounted = true;
    const urlsToRevoke = [];

    const loadAvatars = async () => {
      const newFriends = friends.filter(f => !friendsWithAvatars.some(fwa => fwa.id === f.id));

      if (newFriends.length === 0) return; // Không có avatar mới cần tải

      const newAvatars = await Promise.all(
        newFriends.map(async (friend) => {
          try {
            const avatarURL = await getAvatar(friend.id);
            urlsToRevoke.push(avatarURL);
            return { ...friend, avatarURL };
          } catch (_err) {
            return { ...friend, avatarURL: null };
          }
        })
      );

      if (isMounted) {
        setFriendsWithAvatars(prev => [...prev, ...newAvatars]);
      }
    };

    if (friends.length > 0) {
      loadAvatars();
    }

    return () => {
      isMounted = false;
      // cleanup avatar URLs to avoid memory leak
      urlsToRevoke.forEach((url) => revokeAvatarUrl(url));
    };
  }, [friends]);

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  
  const handleSearch = () => {
    setLoading(true); // Hiển thị trạng thái loading
    setTimeout(async() => {
      try {
        const user = await findUser(search);
        if (user && user.username !== userData.username) {
          setFilteredUsers([{ id: user.id, username: user.username }]);
        } else {
          setFilteredUsers([]); // No matching user
        }
        console.log('User found:', user.username);
      } catch (error) {
        console.error('Error finding user:', error);
        setFilteredUsers([]); // Reset results
      }

      setLoading(false); // Tắt trạng thái loading
    }, 500); // Giả lập độ trễ của API (500ms)

  };

  const handleAddFriend = (user) => {
    if (!ws) {
      console.error('WebSocket instance is not available.');
      alert('WebSocket connection is not available. Please try again later.');
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'ADD_FRIEND',
          payload: {
            senderId: userData.id, // ID of the current user
            receiverId: user.id,  // ID of the user to be added as a friend
          },
        })
      );
      console.log(`Sent friend request to user ${user.username}`);
    } else {
      console.error('WebSocket connection is not open.');
      alert('WebSocket connection is not open. Please try again later.');
    }
};

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddModal]);

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
                <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowAddModal(true)}>
                  <PlusIcon className="w-6 h-6" />
                </Button>
              </div>

              <div className="mt-4 space-y-6">
                {friendsWithAvatars.map((friend) => (
                  <div key={friend.id} className="flex items-center">
                    <div className="relative">
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
              </div>
            </aside>
            
            <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
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
                      if (e.key === "Enter") {
                        handleSearch(); // Thực hiện tìm kiếm khi nhấn Enter
                      }
                    }}
                  />
                  <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow"
                        style={{ maxHeight: "250px" }}>
                    {filteredUsers.length === 0 && (
                      <p className="text-gray-500">No matching users</p>
                    )}
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                      >
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

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard_main;