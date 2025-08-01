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
              {/* Nút chuyển đổi */}
              <div className="mb-6 flex gap-2">
                <button
                  className={`px-4 py-2 rounded font-semibold ${tab === "reports" ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setTab("reports")}
                >
                  Reports
                </button>
              </div>
          
              {/* Hiển thị bảng */}
              <div className="w-full">
                {tab === "reports" && <ReportTable />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportRequests;