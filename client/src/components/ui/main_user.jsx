import React, { useState, useEffect, use } from "react";
import { useFriend } from "../../hooks/useFriend.js";
import { useExpense } from "../../hooks/useExpense.js";
import { useUser } from "../../hooks/useUser.js";
import { useGroupMember } from "../../hooks/useGroupMember.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Custom animated Toggle Button
const ToggleView = ({ active, onToggle }) => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
    margin: "0px 0 20px 0"
  }}>
    <div style={{
      display: "inline-flex",
      borderRadius: 30,
      background: "#f5f5f5",
      boxShadow: "0 2px 10px #e2e2e2",
      overflow: "hidden",
      border: "1px solid #e0e0e0",
      padding: "2px"
    }}>
      <button
        onClick={() => onToggle("list")}
        style={{
          padding: "10px 32px",
          background: active === "list" ? "linear-gradient(90deg,#4e8cff33,#4e8cff11)" : "transparent",
          color: active === "list" ? "#4e8cff" : "#333",
          border: "none",
          outline: "none",
          fontWeight: 600,
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          boxShadow: active === "list" ? "0 2px 8px #4e8cff44" : "none",
          transition: "all 0.25s cubic-bezier(0.55,0,0.1,1)",
          borderRadius: "30px"
        }}
      >
        <span role="img" aria-label="list" style={{fontSize:18}}>📋</span>
        View as list
      </button>
      <button
        onClick={() => onToggle("chart")}
        style={{
          padding: "10px 32px",
          background: active === "chart" ? "linear-gradient(90deg,#ffa50033,#ffa50011)" : "transparent",
          color: active === "chart" ? "#ffa500" : "#333",
          border: "none",
          outline: "none",
          fontWeight: 600,
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          boxShadow: active === "chart" ? "0 2px 8px #ffa50044" : "none",
          transition: "all 0.25s cubic-bezier(0.55,0,0.1,1)",
          borderRadius: "30px"
        }}
      >
        <span role="img" aria-label="chart" style={{fontSize:18}}>📊</span>
        View chart
      </button>
    </div>
  </div>
);

// Custom Tooltip for chart, always show full username and amount
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { fullName, amount } = payload[0].payload;
    const formatMoney = (value) =>
      Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString().replace(/(\.\d{2})$/, '') + '';
    return (
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #e2e2e2",
        padding: "10px 18px",
        fontSize: 18,
        fontWeight: 600,
        color: "#333"
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>{fullName}</div>
        <div style={{ fontWeight: 500, fontSize: 16 }}>{formatMoney(amount)} đ</div>
      </div>
    );
  }
  return null;
};

const CustomBarLabel = ({ x, y, width, height, value, name }) => (
  <g>
    <text
      x={x + 18}
      y={y + height / 2 - 4}
      fontWeight={700}
      fontSize={22}
      fill="#fff"
      alignmentBaseline="middle"
      style={{ pointerEvents: "none" }}
    >
      {name}
    </text>
    <text
      x={x + 18}
      y={y + height / 2 + 22}
      fontWeight={500}
      fontSize={18}
      fill="#fff"
      alignmentBaseline="middle"
      style={{ pointerEvents: "none" }}
    >
      {value}
    </text>
  </g>
);

const ChartBar = ({ data, color, emptyText }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "#888", fontSize: 18, marginTop: 32, textAlign: "center" }}>
        {emptyText}
      </div>
    );
  }
  const chartData = data.map(f => ({
    name: f.name.length > 15 ? f.name.slice(0, 12) + "..." : f.name,
    fullName: f.name,
    amount: f.amount
  }));
  const formatMoney = (value) =>
    Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString().replace(/(\.\d{2})$/, '') + '';
  return (
    <ResponsiveContainer width="100%" height={86 * chartData.length + 20}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 16, right: 24, left: 24, bottom: 16 }}
        barCategoryGap="16%"
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          width={0}
        />
        <Tooltip
          content={<CustomTooltip />}
        />
        <Bar
          dataKey="amount"
          fill={color}
          radius={[20, 20, 20, 20]}
          isAnimationActive={true}
          animationDuration={650}
          animationEasing="ease-in-out"
          barSize={78}
          label={{
            position: "insideLeft",
            content: (props) => (
              <CustomBarLabel
                {...props}
                value={formatMoney(props.value) + " đ"}
                name={chartData[props.index].name}
              />
            )
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const FriendList = ({ data, type }) => (
  <div>
    {data.length === 0 && <div style={{ color: "#888", fontSize: 18, marginTop: 32, textAlign: "center" }}>No data</div>}
    {data.map(friend => (
      <div key={friend.id} style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#e0e0e0",
            marginRight: 12
          }}
        ></div>
        <div>
          <b style={{ fontSize: 18 }}>{friend.name}</b>
          <div style={{ color: type === "owe" ? "#f34d4d" : "#19c37d", fontWeight: 500 }}>
            {type === "owe"
              ? `You owe ${Number.isInteger(friend.amount)
                ? friend.amount.toLocaleString()
                : friend.amount.toLocaleString().replace(/(\.\d{2})$/, '')} đ`
              : `Owes you ${Number.isInteger(friend.amount)
                ? friend.amount.toLocaleString()
                : friend.amount.toLocaleString().replace(/(\.\d{2})$/, '')} đ`}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// History Transactions Section (click to show detail)
const HistoryTransactions = ({ transactions, getExpenseById, getUsernameById, getGroupNameById }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [details, setDetails] = useState({}); // expenseId -> detail data

  const formatMoney = (value) =>
    Number.isInteger(value)
      ? value.toLocaleString()
      : value?.toLocaleString().replace(/(\.\d{2})$/, '') + '';
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return `${d.getDate().toString().padStart(2, '0')}/${
      (d.getMonth() + 1).toString().padStart(2, '0')}/${
      d.getFullYear()}`;
  };

  const handleOpen = async (idx, expenseId) => {
    if (openIdx === idx) {
      setOpenIdx(null);
      return;
    }
    setOpenIdx(idx);
    if (!details[expenseId]) {
      const detail = await getExpenseById(expenseId);
      setDetails(prev => ({ ...prev, [expenseId]: detail }));
    }
  };

  if (!transactions || transactions.length === 0)
    return (
      <div style={{ color: "#888", fontSize: 17, padding: "16px 0", textAlign: "center" }}>
        No history transactions
      </div>
    );

  return (
    <div style={{
      background: "#f7fcf9",
      borderRadius: 18,
      boxShadow: "0 2px 8px #e2f7e9",
      padding: "22px 22px 10px 22px",
      marginTop: 28,
      marginBottom: 10
    }}>
      <div style={{
        fontSize: 21,
        fontWeight: 700,
        marginBottom: 12,
        color: "#19c37d",
        letterSpacing: 1,
        textAlign: "left"
      }}>
        History Transactions
      </div>
      {transactions.map((tx, idx) => (
        <div key={tx.expenseId || idx}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 14,
            padding: "10px 0",
            borderBottom: idx !== transactions.length - 1 ? "1px solid #e8f7e9" : "none",
            cursor: "pointer",
            transition: "background 0.2s",
            background: openIdx === idx ? "#eafaf3" : "transparent",
            position: "relative"
          }}
          onClick={() => handleOpen(idx, tx.expenseId)}
        >
          <div style={{
            background: "#e3f9e6",
            borderRadius: "50%",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 18,
            fontSize: 22
          }}>
            <span role="img" aria-label="paid">✅</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 600,
              fontSize: 18,
              color: "#222",
              marginBottom: 2,
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span>
                You paid <span style={{ color: "#19c37d" }}>{formatMoney(tx.shared_amount)} đ</span>
                {tx.title && <span style={{ color: "#888", marginLeft: 12, fontWeight: 400, fontSize: 15 }}>• {tx.title}</span>}
              </span>
              <span style={{
                marginLeft: 14,
                fontSize: 17,
                color: "#4e8cff",
                fontWeight: 400,
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                {openIdx === idx
                  ? <span style={{ fontSize: 18 }}>▲</span>
                  : <span style={{ fontSize: 18 }}>▼</span>
                }
                <span style={{fontSize:14}}>Details</span>
              </span>
            </div>
            <div style={{
              fontSize: 15,
              color: "#888",
              marginTop: 1
            }}>
              On {formatDate(tx.updatedAt)}
            </div>
            {openIdx === idx && (
              <div style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 10px #e2f7e9",
                marginTop: 16,
                padding: "22px 30px",
                fontSize: 17,
                color: "#444",
                animation: "fadeIn 0.2s",
                border: "1px solid #e7f7ec",
                position: "relative"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 18
                }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#222",
                    flex: 1,
                    letterSpacing: 0.5,
                    wordBreak: "break-word"
                  }}>
                    <span style={{
                      marginRight: 8,
                      display: "inline-block",
                      verticalAlign: "middle"
                    }}>
                      📄
                    </span>
                    {details[tx.expenseId]?.title || "No title"}
                  </div>
                  <div style={{
                    background: "#eaf6ff",
                    color: "#1976d2",
                    padding: "4px 18px",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}>
                    <span style={{ marginRight: 6 }}>Group:</span>
                    {getGroupNameById(details[tx.expenseId]?.groupId) || "No group"}
                  </div>
                </div>
                {details[tx.expenseId]?.description &&
                  <div style={{
                    marginBottom: 10,
                    color: "#444",
                    fontSize: 15,
                    paddingLeft: 2
                  }}>
                    <span style={{ fontWeight: 500 }}>Description:</span>{" "}
                    <span>{details[tx.expenseId]?.description}</span>
                  </div>
                }
                <div style={{
                  marginBottom: 10,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 18
                }}>
                  <span style={{ fontWeight: 500 }}>Total Amount:</span>
                  <span style={{
                    color: "#1976d2",
                    fontWeight: 700,
                    fontSize: 17,
                    background: "#e7f7ec",
                    borderRadius: 8,
                    padding: "2px 10px"
                  }}>
                    {formatMoney(details[tx.expenseId]?.amount) + " đ"}
                  </span>
                </div>
                <div style={{
                  marginBottom: 6,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 18
                }}>
                  <span style={{ fontWeight: 500 }}>Paid By:</span>
                  <span style={{
                    color: "#19c37d",
                    fontWeight: 700,
                    fontSize: 16
                  }}>
                    {getUsernameById(details[tx.expenseId]?.paidbyId)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div style={{
        textAlign: "center",
        color: "#888",
        fontSize: 14,
        paddingTop: 8,
        opacity: 0.7
      }}>
        Tip: Click on a transaction to view more details
      </div>
    </div>
  );
};

// Helper to check if bill is expiring soon (<= 3 days)
const isExpiringSoon = (expDate) => {
  if (!expDate) return false;
  const now = new Date();
  const exp = new Date(expDate);
  const diffTime = exp - now;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
};

// Helper to check if bill is expired (expDate < now)
const isExpired = (expDate) => {
  if (!expDate) return false;
  const now = new Date();
  const exp = new Date(expDate);
  return exp < now;
};

const UnpaidBills = ({ bills, getExpenseById, getUsernameById, getGroupNameById }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [details, setDetails] = useState({});

  const formatMoney = (value) =>
    Number.isInteger(value)
      ? value.toLocaleString()
      : value?.toLocaleString().replace(/(\.\d{2})$/, '') + '';
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return `${d.getDate().toString().padStart(2, '0')}/${
      (d.getMonth() + 1).toString().padStart(2, '0')}/${
      d.getFullYear()}`;
  };

  // Fetch all bill detail in advance for expDate highlight
  useEffect(() => {
    const fetchAllDetails = async () => {
      const missingIds = bills
        .map(bill => bill.expenseId)
        .filter(expenseId => !details[expenseId]);
      if (missingIds.length === 0) return;

      const detailPromises = missingIds.map(expenseId => getExpenseById(expenseId));
      const responses = await Promise.all(detailPromises);
      const newDetails = {};
      missingIds.forEach((expenseId, i) => {
        newDetails[expenseId] = responses[i];
      });
      setDetails(prev => ({ ...prev, ...newDetails }));
    };
    if (bills && bills.length > 0) fetchAllDetails();
    // eslint-disable-next-line
  }, [bills]);

  const handleOpen = async (idx, expenseId) => {
    if (openIdx === idx) {
      setOpenIdx(null);
      return;
    }
    setOpenIdx(idx);
    // No need to fetch here, already prefetched in useEffect
  };

  if (!bills || bills.length === 0)
    return (
      <div style={{ color: "#888", fontSize: 17, padding: "16px 0", textAlign: "center" }}>
        No unpaid bills
      </div>
    );

  return (
    <div style={{
      background: "#fff7f7",
      borderRadius: 18,
      boxShadow: "0 2px 8px #fadede",
      padding: "22px 22px 10px 22px",
      marginTop: 28,
      marginBottom: 10
    }}>
      <div style={{
        fontSize: 21,
        fontWeight: 700,
        marginBottom: 12,
        color: "#f34d4d",
        letterSpacing: 1,
        textAlign: "left"
      }}>
        Unpaid Bills
      </div>
      {bills.map((bill, idx) => {
        const detail = details[bill.expenseId] || {};
        const expDate = detail.expDate;
        const expiringSoon = isExpiringSoon(expDate);
        const expired = isExpired(expDate);

        // UI variables
        let background = "transparent";
        let icon = <span role="img" aria-label="unpaid">🕒</span>;
        let outerColor = undefined;
        let highlightText = null;

        if (expired) {
          background = "#ffeaea";
          icon = <span role="img" aria-label="expired">❌</span>;
          outerColor = "0 0 0 2px #f34d4d55";
          highlightText = (
            <span style={{
              color: "#f34d4d",
              fontWeight: 700,
              fontSize: 15,
              marginLeft: 12,
              padding: "2px 10px",
              background: "#fff1f1",
              borderRadius: 8,
              boxShadow: "0 0 0 1px #f34d4d"
            }}>
              Expired!
            </span>
          );
        } else if (expiringSoon) {
          background = "#fff1e0";
          icon = <span role="img" aria-label="expiring">⏰</span>;
          outerColor = "0 0 0 2px #ff98004c";
          highlightText = (
            <span style={{
              color: "#ff9800",
              fontWeight: 700,
              fontSize: 15,
              marginLeft: 12,
              padding: "2px 10px",
              background: "#fff3e0",
              borderRadius: 8,
              boxShadow: "0 0 0 1px #ff9800"
            }}>
              Expiring soon!
            </span>
          );
        }

        return (
          <div key={bill.expenseId || idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 14,
              padding: "10px 0",
              borderBottom: idx !== bills.length - 1 ? "1px solid #fadede" : "none",
              cursor: "pointer",
              transition: "background 0.2s",
              background: openIdx === idx ? "#ffeeee" : background,
              position: "relative",
              boxShadow: outerColor
            }}
            onClick={() => handleOpen(idx, bill.expenseId)}
          >
            <div style={{
              background: expired ? "#ffd6d6" : expiringSoon ? "#ffe0b2" : "#ffe6e6",
              borderRadius: "50%",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 18,
              fontSize: 22,
              flexShrink: 0,
              border: expired ? "2px solid #f34d4d" : expiringSoon ? "2px solid #ff9800" : undefined
            }}>
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: 18,
                color: "#222",
                marginBottom: 2,
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>
                  You owe <span style={{ color: "#f34d4d" }}>{formatMoney(bill.shared_amount)} đ</span>
                  {bill.title && <span style={{ color: "#888", marginLeft: 12, fontWeight: 400, fontSize: 15 }}>• {bill.title}</span>}
                  {highlightText}
                </span>
                <span style={{
                  marginLeft: 14,
                  fontSize: 17,
                  color: expired ? "#f34d4d" : expiringSoon ? "#ff9800" : "#f34d4d",
                  fontWeight: 400,
                  opacity: 0.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  {openIdx === idx
                    ? <span style={{ fontSize: 18 }}>▲</span>
                    : <span style={{ fontSize: 18 }}>▼</span>
                  }
                  <span style={{fontSize:14}}>Details</span>
                </span>
              </div>
              <div style={{
                fontSize: 15,
                color: "#888",
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                Created {formatDate(bill.updatedAt || bill.createdAt)}
                {expDate && (
                  <span style={{
                    color: expired ? "#f34d4d" : expiringSoon ? "#ff9800" : "#888",
                    fontWeight: expired ? 700 : expiringSoon ? 700 : 400,
                    fontSize: 15,
                    marginLeft: 10
                  }}>
                    {expired
                      ? "Expired: "
                      : expiringSoon
                        ? "Expires: "
                        : "Exp.Date: "}
                    {formatDate(expDate)}
                  </span>
                )}
              </div>
              {openIdx === idx && (
                <div style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 2px 10px #fadede",
                  marginTop: 16,
                  padding: "22px 30px",
                  fontSize: 17,
                  color: "#444",
                  animation: "fadeIn 0.2s",
                  border: "1px solid #fadede",
                  position: "relative"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    marginBottom: 18
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#222",
                      flex: 1,
                      letterSpacing: 0.5,
                      wordBreak: "break-word"
                    }}>
                      <span style={{
                        marginRight: 8,
                        display: "inline-block",
                        verticalAlign: "middle"
                      }}>
                        📄
                      </span>
                      {detail.title || "No title"}
                    </div>
                    <div style={{
                      background: "#ffe6e6",
                      color: "#f34d4d",
                      padding: "4px 18px",
                      borderRadius: 14,
                      fontSize: 16,
                      fontWeight: 600,
                      whiteSpace: "nowrap"
                    }}>
                      <span style={{ marginRight: 6 }}>Group:</span>
                      {getGroupNameById(detail.groupId) || "No group"}
                    </div>
                  </div>
                  {detail.description &&
                    <div style={{
                      marginBottom: 10,
                      color: "#444",
                      fontSize: 15,
                      paddingLeft: 2
                    }}>
                      <span style={{ fontWeight: 500 }}>Description:</span>{" "}
                      <span>{detail.description}</span>
                    </div>
                  }
                  <div style={{
                    marginBottom: 10,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 18
                  }}>
                    <span style={{ fontWeight: 500 }}>Total Amount:</span>
                    <span style={{
                      color: "#f34d4d",
                      fontWeight: 700,
                      fontSize: 17,
                      background: "#ffe6e6",
                      borderRadius: 8,
                      padding: "2px 10px"
                    }}>
                      {formatMoney(detail.amount) + " đ"}
                    </span>
                  </div>
                  <div style={{
                    marginBottom: 6,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 18
                  }}>
                    <span style={{ fontWeight: 500 }}>Paid By:</span>
                    <span style={{
                      color: "#f34d4d",
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      {getUsernameById(detail.paidbyId)}
                    </span>
                  </div>
                  {expDate && (
                    <div style={{
                      marginTop: 8,
                      color: expired ? "#f34d4d" : expiringSoon ? "#ff9800" : "#888",
                      fontWeight: expired ? 700 : expiringSoon ? 700 : 500,
                      fontSize: 15
                    }}>
                      <span style={{
                        background: expired
                          ? "#fff1f1"
                          : expiringSoon
                            ? "#fff3e0"
                            : undefined,
                        padding: (expired || expiringSoon) ? "2px 10px" : undefined,
                        borderRadius: (expired || expiringSoon) ? 8 : undefined,
                        boxShadow: expired
                          ? "0 0 0 1px #f34d4d"
                          : expiringSoon
                            ? "0 0 0 1px #ff9800"
                            : undefined
                      }}>
                        {expired
                          ? "❌ This bill is expired: "
                          : expiringSoon
                            ? "⚠️ This bill will expire soon: "
                            : "Expire date: "}
                        {formatDate(expDate)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div style={{
        textAlign: "center",
        color: "#888",
        fontSize: 14,
        paddingTop: 8,
        opacity: 0.7
      }}>
        Tip: Expired bills (❌) and expiring soon bills (⏰) are highlighted. Click to view details.
      </div>
    </div>
  );
};

const MainInfo = () => {
  const { userData, findAllUsers } = useUser();
  const { friends, fetchFriends } = useFriend();
  const { getAllOwe, getAllLend, getUserExpenses, getExpenseById } = useExpense();
  const { groups, fetchGroups } = useGroupMember();

  const [viewMode, setViewMode] = useState("list");
  const [oweList, setOweList] = useState([]);
  const [lendList, setLendList] = useState([]);
  const [historyTransactions, setHistoryTransactions] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const users = await findAllUsers();
      setAllUsers(users || []);
    } catch (e) {}
  };
  fetchUsers();
  }, [findAllUsers]);
  
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const getUsernameById = (userId) => {
    if (!userId) return "";
    const user = allUsers.find(u => String(u.id) === String(userId));
    return user ? user.username : userId;
  };

  const getGroupNameById = (groupId) => {
    if (!groupId) return "";
    const group = groups.find(g => String(g.id) === String(groupId));
    return group ? group.name : groupId;
  };

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    const fetchData = async () => {
      if (userData?.id) {
        const oweRes = await getAllOwe(userData.id);
        const lendRes = await getAllLend(userData.id);
        const oweArr = Object.entries(oweRes?.userOwe || {}).map(([uid, amount]) => {
          const friend = friends.find(f => f.id === Number(uid));
          return {
            id: uid,
            name: friend?.username || `User ${uid}`,
            amount: Number(amount)
          };
        });
        const lendArr = Object.entries(lendRes?.userLend || {}).map(([uid, amount]) => {
          const friend = friends.find(f => f.id === Number(uid));
          return {
            id: uid,
            name: friend?.username || `User ${uid}`,
            amount: Number(amount)
          };
        });
        setOweList(oweArr.filter(f => f.amount > 0));
        setLendList(lendArr.filter(f => f.amount > 0));
      }
    };
    fetchData();
  }, [userData?.id, friends, getAllOwe, getAllLend]);

  // Fetch all paid transactions and unpaid bills from getUserExpenses
  useEffect(() => {
    const fetchHistoryTransactions = async () => {
      if (userData?.id) {
        try {
          const expenses = await getUserExpenses(userData.id);
          const paidExpenses = expenses?.paidExpenses || [];
          const sorted = [...(paidExpenses || [])].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
          });
          setHistoryTransactions(sorted);
        } catch (e) {
          setHistoryTransactions([]);
        }
      }
    };
    const fetchUnpaidBills = async () => {
      if (userData?.id) {
        try {
          const expenses = await getUserExpenses(userData.id);
          const unpaidExpenses = expenses?.unpaidExpenses || [];
          const sorted = [...(unpaidExpenses || [])].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
          });
          setUnpaidBills(sorted);
        } catch (e) {
          setUnpaidBills([]);
        }
      }
    };
    fetchHistoryTransactions();
    fetchUnpaidBills();
  }, [userData?.id, getUserExpenses]);

  return (
    <div style={{ padding: "24px 0 0 0", maxWidth: 900, margin: "0 auto" }}>
      {/* Welcome top left */}
      <div style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}>
        <span style={{
          fontFamily: "cursive",
          fontSize: 51,
          color: "#4e8cff",
          fontWeight: 700,
          marginLeft: 16,
          marginBottom: 5,
          letterSpacing: 1,
          textShadow: "0 2px 10px #b6e3ff"
        }}>
          Welcome
        </span>
      </div>
      {/* View toggle centered */}
      <div>
        <ToggleView active={viewMode} onToggle={setViewMode} />
      </div>
      {/* You owe / You lend header */}
      <div style={{
        display: "flex",
        gap: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        marginTop: 10
      }}>
        <div style={{
          flex: 1,
          textAlign: "center",
          fontWeight: 700,
          fontSize: 26,
          color: "#f34d4d",
          letterSpacing: 1
        }}>
          You Owe
        </div>
        <div style={{
          flex: 1,
          textAlign: "center",
          fontWeight: 700,
          fontSize: 26,
          color: "#19c37d",
          letterSpacing: 1
        }}>
          You Lend
        </div>
      </div>
      {/* Main content */}
      <div style={{
        display: "flex",
        gap: 40,
        justifyContent: "center",
        alignItems: "flex-start"
      }}>
        {/* Owe column */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: "#fff",
          borderRadius: 24,
          padding: "28px 18px 28px 18px",
          boxShadow: "0 4px 16px #e2e2e2",
          transition: "box-shadow 0.25s cubic-bezier(0.55,0,0.1,1)",
        }}>
          {viewMode === "list"
            ? <FriendList data={oweList} type="owe" />
            : <ChartBar data={oweList} color="#f34d4d" emptyText="You do not owe anyone" />
          }
        </div>
        {/* Lend column */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: "#fff",
          borderRadius: 24,
          padding: "28px 18px 28px 18px",
          boxShadow: "0 4px 16px #e2e2e2",
          transition: "box-shadow 0.25s cubic-bezier(0.55,0,0.1,1)",
        }}>
          {viewMode === "list"
            ? <FriendList data={lendList} type="lend" />
            : <ChartBar data={lendList} color="#19c37d" emptyText="You are not owed anything" />
          }
        </div>
      </div>
      {/* History Transactions */}
      <HistoryTransactions
        transactions={historyTransactions}
        getExpenseById={getExpenseById}
        getUsernameById={getUsernameById}
        getGroupNameById={getGroupNameById}
      />
      {/* Unpaid Bills */}
      <UnpaidBills
        bills={unpaidBills}
        getExpenseById={getExpenseById}
        getUsernameById={getUsernameById}
        getGroupNameById={getGroupNameById}
      />
    </div>
  );
};

export default MainInfo;