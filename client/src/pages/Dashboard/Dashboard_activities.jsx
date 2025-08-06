import { BellIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Head_bar from "../../components/ui/headbar.jsx";
import Left_bar from "../../components/ui/leftbar.jsx";
import ActivityList from "../../components/ui/activities_list.jsx";

function Dashboard_activities() {

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("activities"); // or "recently", etc.

  return (
        <div className="page-container">
          {/* Header */}
          <div className="page-header">
            <Head_bar />
          </div>

          {/* Main Content */}
          <div className="page-main-content">
            {/* Left Sidebar */}
            <div className="page-left-sidebar">
              <Left_bar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>


            {/* Main Content Area */}
            <main className="page-center-content">
              <div className="mb-20 mt-5">
                <ActivityList />
              </div>
            </main>
          </div>

        </div>
  );
};

export default Dashboard_activities;