import React, { useState } from "react";
import Sort from "./sort";
import BlockText from "./block_text";

const initialActivities = [
  { title: "Add friend", group: "Social", description: "Kết bạn mới.", timestamp: "2025-06-25 08:00" },
  { title: "Create expense", group: "Finance", description: "Tạo khoản chi.", timestamp: "2025-06-24 09:30" },
  { title: "Pay expense", group: "Finance", description: "Thanh toán.", timestamp: "2025-06-20 10:10" },
  { title: "Join event", group: "Social", description: "Tham gia sự kiện.", timestamp: "2025-06-15 14:20" },
];

const ActivityList = () => {
  const [sortType, setSortType] = useState("newest");
  const [activities] = useState(initialActivities);

  const getSortedActivities = () => {
    const arr = [...activities];
    switch (sortType) {
      case "newest":
        return arr.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      case "oldest":
        return arr.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      case "az":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return arr.sort((a, b) => b.title.localeCompare(a.title));
      case "group":
        return arr.sort((a, b) => {
          if ((a.group || "") === (b.group || "")) {
            return b.timestamp.localeCompare(a.timestamp);
          }
          return (a.group || "").localeCompare(b.group || "");
        });
      default:
        return arr;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="[font-family:'Bree_Serif',Helvetica] font-normal text-3xl text-[#193865]">
          Activities
        </h1>
        <Sort value={sortType} onChange={setSortType} />
      </div>
      <div className="space-y-6" style={{ marginTop: "45px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "30px" }}>
        {getSortedActivities().map((act, idx) => (
          <BlockText key={idx} {...act} />
        ))}
      </div>
    </div>
  );
};

export default ActivityList;