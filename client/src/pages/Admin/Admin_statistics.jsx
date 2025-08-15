import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_head_bar from "../../components/ui/admin_headbar.jsx";
import Admin_left_bar from "../../components/ui/admin_leftbar.jsx";
import AdminStatisticInfo from "../../components/ui/admin_statistic_info.jsx";

const AdminStatistics = () => {
  const [activeTab, setActiveTab] = useState("statistics");

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
              <AdminStatisticInfo />
          </div>
        </div>
    </div>
  );
};

export default AdminStatistics;