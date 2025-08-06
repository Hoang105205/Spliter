import React, { useEffect, useState } from "react";
import Sort from "./sort";
import BlockText from "./block_text";
import { useActivity } from "../../hooks/useActivity";
import { useUser } from "../../hooks/useUser";

const ActivityList = () => {
  const [sortType, setSortType] = React.useState("latest");
  const { activities, loading, fetchActivities } = useActivity();
  const { userData } = useUser();

  useEffect(() => {
    if (userData.id) {
      fetchActivities(userData.id);
    }
  }, [userData.id, fetchActivities]);

  const getSortedActivities = () => {
    const arr = [...activities];
    switch (sortType) {
      case "latest":
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "relationship-friend":
        return arr
          .filter(act => act.description && /friend/i.test(act.description))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "relationship-group":
        return arr
          .filter(act => act.description && /group/i.test(act.description))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "expense":
        return arr
          .filter(act => act.activityType === "expense")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "report":
        return arr
          .filter(act => act.activityType === "report")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return arr;
    }
  };

  return (
  <div className="overflow-x-hidden">
    <div className="flex items-center justify-between mb-4">
      <h1 className="[font-family:'Bree_Serif',Helvetica] font-normal text-3xl text-[#193865]">
        Activities
      </h1>
      <Sort value={sortType} onChange={setSortType} />
    </div>
    <div
      className="space-y-6"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 700,         
        margin: "0 auto",      
        gap: "30px",
        boxSizing: "border-box",
        paddingLeft: 16,      
        paddingRight: 16,
      }}
    >
      {loading ? (
        <BlockText title="Loading..." description="" />
      ) : (
        getSortedActivities().map((act, idx) => (
          <BlockText
            key={act.id || idx}
            title={act.title}
            description={act.description}
            timestamp={act.createdAt}
            style={{ width: "100%", maxWidth: "100%" }}
          />
        ))
      )}
    </div>
  </div>
  );
};

export default ActivityList;