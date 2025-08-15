import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_head_bar from "../../components/ui/admin_headbar.jsx";
import Admin_left_bar from "../../components/ui/admin_leftbar.jsx";
import UserTable from "../../components/ui/user_table.jsx";
import GroupTable from "../../components/ui/group_table.jsx";

const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const [activeTab, setActiveTab] = useState("homeboard");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <Admin_head_bar />
      </div>

      {/* Main content with sidebar */}
      <div className="page-main-content">
        
        {/* Left Sidebar */}
        <div className="page-left-sidebar">
          <Admin_left_bar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="page-center-content">
          {/* Nút chuyển đổi */}
          <div className="mb-6 flex gap-2">
            <button
              className={`px-4 py-2 rounded font-semibold ${tab === "users" ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setTab("users")}
            >
              Users
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold ${tab === "groups" ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setTab("groups")}
            >
              Groups
            </button>
          </div>
      
          {/* Hiển thị bảng */}
          <div className="w-full">
            {tab === "users" ? <UserTable /> : <GroupTable />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;