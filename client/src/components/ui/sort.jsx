import React, { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Lastest", value: "oldest" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Group", value: "group" }
];

const Sort = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const selected = SORT_OPTIONS.find(opt => opt.value === value);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block", minWidth: 120 }}>
      <button
        style={{
          padding: "8px 16px",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          background: "#fff",
          fontWeight: 500,
          cursor: "pointer",
          width: "100%",
          textAlign: "left"
        }}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? selected.label : "Sắp xếp"}
        <span style={{ float: "right", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </button>
      {/* Dropdown với hiệu ứng */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          background: "#fff",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          marginTop: 6
        }}
      >
        {SORT_OPTIONS.map(opt => (
          <div
            key={opt.value}
            style={{
              padding: "12px 18px",
              cursor: "pointer",
              background: value === opt.value ? "#f0f4ff" : "#fff",
              fontWeight: value === opt.value ? 600 : 400,
              transition: "background 0.15s"
            }}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sort;