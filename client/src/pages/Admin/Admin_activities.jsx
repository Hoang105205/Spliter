import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_head_bar from "../../components/ui/admin_headbar.jsx";
import Admin_left_bar from "../../components/ui/admin_leftbar.jsx";
import AdminActivityList from "../../components/ui/admin_activities_list.jsx";

const AdminActivities = () => {
  const [tab, setTab] = useState("users");
  const [activeTab, setActiveTab] = useState("activities");

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="bg-white w-full max-w-[1500px] relative py-5">
        <div className="mx-auto w-[1409px] relative">
          {/* Header */}
          <Admin_head_bar />

          {/* Main content with sidebar */}
          <div className="flex mt-8">
            {/* Left Sidebar */}
            <Admin_left_bar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="w-full ml-[30px]">
              {/* Hiển thị bảng */}
              <div className="w-full">
                <AdminActivityList/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivities;