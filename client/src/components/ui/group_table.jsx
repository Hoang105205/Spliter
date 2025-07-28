import React from "react";

const groups = [
  { id: 1, name: "Group A", memberCount: 10, createdAt: "2024-05-01" },
  { id: 2, name: "Group B", memberCount: 8, createdAt: "2024-08-15" },
];

const GroupTable = () => (
  <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">#</th>
          <th className="p-2">Group Name</th>
          <th className="p-2">Members</th>
          <th className="p-2">Created At</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((group, idx) => (
          <tr key={group.id} className={idx % 2 ? "bg-gray-100" : ""}>
            <td className="p-2">{group.id}</td>
            <td className="p-2">{group.name}</td>
            <td className="p-2">{group.memberCount}</td>
            <td className="p-2">{group.createdAt}</td>
            <td className="p-2">
              <button className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">View</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default GroupTable;