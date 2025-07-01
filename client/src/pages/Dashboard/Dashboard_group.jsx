import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import Head_bar from "../../components/ui/headbar.jsx";
import Left_bar from "../../components/ui/leftbar.jsx";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";

// Import custom hooks
import { useUser } from '../../hooks/useUser.js';
import { useGroupMember } from '../../hooks/useGroupMember.js';

function Dashboard_group() {
  const navigate = useNavigate();

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("group"); // or "recently", etc.

  // State to hold selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Fetch user data
  const { userData } = useUser();

  // Fetch groups that the user is a member of
  const { groups, loading, error, fetchGroups } = useGroupMember();

  useEffect(() => {
    if (activeTab === 'group') {
      fetchGroups(userData.id);
    } else {
      setSelectedGroup(null); // Reset selected group when tab changes away from "group"
    }
  }, [activeTab, userData.id]);


  // Mock data for group members
  const groupmembers = [
    {
      id: 1,
      username: "Alice",
      
    },
    {
      id: 2,
      username: "Bob",
      
    },
    {
      id: 3,
      username: "Charlie",
      
    }
  ];

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
                  <Button variant="ghost" size="icon" className="p-0">
                    <PlusIcon className="w-6 h-6" />
                  </Button>
                </div>

                <div className="mt-4 space-y-6">
                  {groupmembers.map((member) => (
                    <div key={member.id} className="flex items-center">
                      <div className="relative">
                        <Avatar className="w-[53px] h-[53px] bg-[#d9d9d9]">
                          {member.avatarURL ? (
                            <img
                              src={member.avatarURL}
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
                    </div>
                  ))}
                </div>
              </aside>
            )}



          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_group;