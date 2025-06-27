import React from "react";

const BlockText = ({ title, description, timestamp, icon }) => {
  return (
    <div style={styles.container}>
      {icon && (
        <div style={styles.iconWrapper}>
          {typeof icon === "string" ? (
            <img src={icon} alt="icon" style={styles.icon} />
          ) : (
            icon
          )}
        </div>
      )}
      <div style={styles.textBlock}>
        <div style={styles.title}>{title}</div>
        <div style={styles.description}>{description}</div>
        {timestamp && <div style={styles.timestamp}>{timestamp}</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    background: "#fff",
    borderRadius: "14px",
    padding: "16px 22px",
    margin: "0",
    boxShadow: "0 2px 8px rgba(32,50,91,0.08)",
    minHeight: "70px",
    maxWidth: "520px",
    width: "100%",
    border: "1px solid #e3e8fa"
  },
  iconWrapper: {
    marginRight: "16px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e3e8fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  icon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  textBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  title: {
    fontWeight: 700,
    fontSize: "1.08rem",
    color: "#20325b",
    marginBottom: "6px",
    wordBreak: "break-word",
  },
  description: {
    fontSize: "1rem",
    color: "#536395",
    marginBottom: "2px",
    wordBreak: "break-word",
  },
  timestamp: {
    fontSize: "0.88rem",
    color: "#b0b8ca",
    marginTop: "6px",
  },
};

export default BlockText;