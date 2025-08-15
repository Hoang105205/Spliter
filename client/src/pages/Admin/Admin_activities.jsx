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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <Admin_head_bar />
      </div>

      {/* Main Content */}
      <div className="page-main-content">
        {/* Left Sidebar (optional) */}
        <div className="page-left-sidebar">
          <Admin_left_bar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Center Content */}
        <div className="page-center-content">
          {/* Nội dung chính của page */}
            <AdminActivityList/>
        </div>
      </div>
    </div> 
  );
};

export default AdminActivities;