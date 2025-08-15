import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_head_bar from "../../components/ui/admin_headbar.jsx";
import Admin_left_bar from "../../components/ui/admin_leftbar.jsx";
import ReportTable from "../../components/ui/report_table.jsx";

const AdminReportRequests = () => {
  const [tab, setTab] = useState("reports");
  const [activeTab, setActiveTab] = useState("reportRequests");

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
          {/* Hiển thị bảng */}
          <div className="w-full">
            {tab === "reports" && <ReportTable />}
          </div>
        </div>
      </div>
    </div> 
  );
};

export default AdminReportRequests;