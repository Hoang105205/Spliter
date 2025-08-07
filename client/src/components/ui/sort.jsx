import React, { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { 
    label: "Relationship",
    value: "relationship",
    children: [
      { label: "Friend", value: "relationship-friend" },
      { label: "Group", value: "relationship-group" }
    ]
  },
  { label: "Expense", value: "expense" },
  { label: "Report", value: "report" }
];

const Sort = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const ref = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setSubOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const selected = (() => {
    for (const opt of SORT_OPTIONS) {
      if (opt.value === value) return opt;
      if (opt.children) {
        const found = opt.children.find(child => child.value === value);
        if (found) return found;
      }
    }
    return null;
  })();

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
        {selected ? (typeof selected.label === "string" ? selected.label : selected.label) : "Sort"}
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
          marginTop: 6,
          minWidth: "100%",
        }}
      >
        {SORT_OPTIONS.map(opt => (
          !opt.children ? (
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
          ) : (
            <div
              key={opt.value}
              style={{
                position: "relative",
                padding: "12px 18px",
                cursor: "pointer",
                background: value === opt.value || opt.children.some(child => child.value === value) ? "#f0f4ff" : "#fff",
                fontWeight: value === opt.value || opt.children.some(child => child.value === value) ? 600 : 400,
                transition: "background 0.15s"
              }}
              onMouseEnter={() => setSubOpen(true)}
              onMouseLeave={() => setSubOpen(false)}
            >
              {opt.label}
              {/* Submenu */}
              <div
                style={{
                  display: subOpen ? "block" : "none",
                  position: "absolute",
                  top: 0,
                  right: "100%",
                  minWidth: "100%",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  zIndex: 20,
                }}
              >
                {opt.children.map(child => (
                  <div
                    key={child.value}
                    style={{
                      padding: "12px 18px",
                      cursor: "pointer",
                      background: value === child.value ? "#e6f0ff" : "#fff",
                      fontWeight: value === child.value ? 600 : 400,
                      transition: "background 0.15s"
                    }}
                    onClick={() => {
                      onChange(child.value);
                      setOpen(false);
                      setSubOpen(false);
                    }}
                  >
                    {child.label}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Sort;