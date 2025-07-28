import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_head_bar from "../../components/ui/admin_headbar.jsx";
import Admin_left_bar from "../../components/ui/admin_leftbar.jsx";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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

            {/* Main Dashboard Content */}
            <div className="flex-1 p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
              <p className="text-gray-600 mb-4">Welcome to the Admin Control Panel. Manage users and system settings here.</p>

              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Management Card */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">User Management</h2>
                  <p className="text-gray-500">View and manage all users (Total: 150)</p>
                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Users
                  </button>
                </div>

                {/* System Settings Card */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700">System Settings</h2>
                  <p className="text-gray-500">Configure system parameters and permissions.</p>
                  <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Configure Settings
                  </button>
                </div>
              </div>

              {/* Mock Table */}
              <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Recent Activities</h2>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">ID</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">001</td>
                      <td className="p-2">User Added</td>
                      <td className="p-2">2025-07-28 12:00 PM</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="p-2">002</td>
                      <td className="p-2">Settings Updated</td>
                      <td className="p-2">2025-07-28 11:30 AM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;