import React from "react";

export default function SearchBox({ value, onChange, placeholder = "Search" }) {
  return (
    <div
      className="flex items-center bg-[#f3f3f3] rounded border border-[#e5e5e5] px-4 py-2 w-64 shadow"
      style={{
        borderBottom: "2px solid #bdbdbd",
        boxShadow: "0 2px 6px #e0e0e0",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none text-gray-600 flex-1 placeholder-gray-400"
        placeholder={placeholder}
        style={{ fontSize: 20 }}
      />
      <svg
        width="24"
        height="24"
        className="ml-2 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
      </svg>
    </div>
  );
}