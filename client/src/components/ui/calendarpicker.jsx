import React, { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["m", "t", "w", "t", "f", "s", "s"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function getPrevMonth(year, month) {
  return month === 0 ? [year - 1, 11] : [year, month - 1];
}
function getNextMonth(year, month) {
  return month === 11 ? [year + 1, 0] : [year, month + 1];
}
function isSameDay(d1, d2) {
  return (
    d1?.getDate() === d2?.getDate() &&
    d1?.getMonth() === d2?.getMonth() &&
    d1?.getFullYear() === d2?.getFullYear()
  );
}

const CalendarPopup = ({ value, onChange, open, onClose, position = { top: 0, left: 0 } }) => {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(value?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(value?.getMonth() || today.getMonth());
  const ref = useRef();

  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const offset = (firstDay + 6) % 7;

  const [prevYear, prevMonth] = getPrevMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  const leading = Array.from({ length: offset }, (_, i) => ({
    date: new Date(prevYear, prevMonth, prevMonthDays - offset + i + 1),
    currentMonth: false,
  }));
  const current = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(viewYear, viewMonth, i + 1),
    currentMonth: true,
  }));
  const [nextYear, nextMonth] = getNextMonth(viewYear, viewMonth);
  const trailingCount = 42 - (leading.length + current.length);
  const trailing = Array.from({ length: trailingCount }, (_, i) => ({
    date: new Date(nextYear, nextMonth, i + 1),
    currentMonth: false,
  }));
  const calendarDays = [...leading, ...current, ...trailing];

  return (
    <div
      ref={ref}
      style={{
        ...styles.popup,
        top: position.top,
        left: position.left,
        position: "absolute",

        // Apply font globally here:
        fontFamily: "'Roboto Condensed', Helvetica, Arial, sans-serif",
        color: "#333",
        userSelect: "none", // prevent text selection when clicking
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={() =>
            viewMonth === 0
              ? (setViewYear(viewYear - 1), setViewMonth(11))
              : setViewMonth(viewMonth - 1)
          }
          style={styles.arrowBtn}
          onMouseEnter={e => (e.currentTarget.style.color = "#5a96f0")}
          onMouseLeave={e => (e.currentTarget.style.color = "#000")}
        >
          ←
        </button>
        <div style={styles.monthLabel}>{new Date(viewYear, viewMonth).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          onClick={() =>
            viewMonth === 11
              ? (setViewYear(viewYear + 1), setViewMonth(0))
              : setViewMonth(viewMonth + 1)
          }
          style={styles.arrowBtn}
          onMouseEnter={e => (e.currentTarget.style.color = "#5a96f0")}
          onMouseLeave={e => (e.currentTarget.style.color = "#000")}
        >
          →
        </button>
      </div>

      {/* Weekdays */}
      <div style={styles.weekdays}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            style={styles.weekdayCell}
            onMouseEnter={e => (e.currentTarget.style.color = "#5a96f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#999")}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={styles.daysGrid}>
        {calendarDays.map(({ date, currentMonth }, i) => {
          const isSelected = isSameDay(date, value);
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              onClick={() => {
                onChange(date);
                onClose?.();
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                ...styles.dayCell,
                ...(isSelected ? styles.selectedDay : {}),
                ...(currentMonth ? {} : styles.outsideMonth),
                ...(isHovered ? styles.hoveredDay : {}),
              }}
              className="calendar-day"
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  popup: {
    background: "white",
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 100,
    width: 260,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 15,
  },
  arrowBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#000",
    transition: "color 0.3s ease",
  },
  monthLabel: {
    userSelect: "none",
  },
  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600",
  },
  weekdayCell: {
    textTransform: "lowercase",
    cursor: "default",
    transition: "color 0.3s ease",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  dayCell: {
    width: 30,
    height: 30,
    lineHeight: "30px",
    textAlign: "center",
    borderRadius: "50%",
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease",
    userSelect: "none",
  },
  selectedDay: {
    backgroundColor: "#5a96f0",
    color: "white",
  },
  outsideMonth: {
    color: "#ccc",
  },
  hoveredDay: {
    backgroundColor: "#e1e6ed",
  },
};

export default CalendarPopup;
