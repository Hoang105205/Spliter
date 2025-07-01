import React, { useEffect, useState } from "react";
import Sort from "./sort";
import BlockText from "./block_text";
import { useActivity } from "../../hooks/useActivity";
import { useUser } from "../../hooks/useUser";

const ActivityList = () => {
  const [sortType, setSortType] = React.useState("newest");
  const { activities, loading, fetchActivities } = useActivity();
  const { userData, findUser } = useUser();

  useEffect(() => {
    if (userData.id) {
    fetchActivities(userData.id);
    }
  }, [userData.id]);

  const getSortedActivities = () => {
    const arr = [...activities];
    switch (sortType) {
      case "newest":
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "az":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return arr.sort((a, b) => b.title.localeCompare(a.title));
      case "group":
        const groupA = (a.group || a.groupId || "").toString();
        const groupB = (b.group || b.groupId || "").toString();
        if (groupA === groupB) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return groupA.localeCompare(groupB);
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
      <div
        className="space-y-6"
        style={{
          marginTop: "45px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: "30px"
        }}
      >
        {loading ? (
          <BlockText title="Loading..." description=""/>
        ) : (
          getSortedActivities().map((act, idx) => (
            <BlockText
              key={act.id || idx}
              title={act.title}
              description={act.description}
              timestamp={act.createdAt}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;