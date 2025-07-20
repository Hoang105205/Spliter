import React, { useEffect, useState } from "react";
import BlockText from "./block_text.jsx";
import CountUp from 'react-countup';
import { useGroupMember } from "../../hooks/useGroupMember.js";
import { useFriend } from "../../hooks/useFriend.js";
import { useUser } from "../../hooks/useUser.js";
import { useExpense } from "../../hooks/useExpense.js";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// Hàm lấy N tháng gần nhất (bao gồm tháng hiện tại), định dạng MM/YYYY
function getLastNMonths(n) {
  const result = [];
  const currentDate = new Date();
  for(let i = 0; i < n; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - (n - 1 - i), 1);
    result.push(`${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
  }
  return result;
}

const MONTH_OPTIONS = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "9 months", value: 9 }
];

const StatisticInfo = () => {
  const [monthCount, setMonthCount] = useState(6); // Mặc định 6 tháng
  const [months, setMonths] = useState(getLastNMonths(6));
  const [data, setData] = useState([]);

  const { userData } = useUser();
  const { groups, fetchGroups } = useGroupMember();
  const { friends, fetchFriends } = useFriend();
  const { getAllLend, getAllOwe, getUserExpenses } = useExpense();

  // Dữ liệu tổng
  const [lend, setLend] = useState(0);
  const [owe, setOwe] = useState(0);
  // Dữ liệu từng tháng
  const [monthlyLend, setMonthlyLend] = useState({});
  const [monthlyOwe, setMonthlyOwe] = useState({});
  const [paidExpenses, setPaidExpenses] = useState(0);
  const [unpaidExpenses, setUnpaidExpenses] = useState(0);

  // Lấy số tiền đã cho vay và đã nợ của user, gồm cả từng tháng
  useEffect(() => {
    const fetchLendOwe = async () => {
      if (userData?.id) {
        try {
          const lendRes = await getAllLend(userData.id);
          const oweRes = await getAllOwe(userData.id);
          setLend(Number(lendRes?.unpaidLend || 0)); // lấy unpaidLend
          setOwe(Number(oweRes?.unPaidOwe || 0));    // lấy unPaidOwe
          setMonthlyLend(lendRes?.monthlyLend || {}); // object {month: value}
          setMonthlyOwe(oweRes?.monthlyOwe || {});    // object {month: value}
        } catch (err) {
          setLend(0);
          setOwe(0);
          setMonthlyLend({});
          setMonthlyOwe({});
        }
      }
    };
    fetchLendOwe();
  }, [userData?.id, getAllLend, getAllOwe]);

  // Lấy danh sách expenses của user
  useEffect(() => {
    const fetchUserExpenses = async () => {
      if (userData?.id) {
        try {
          const expenses = await getUserExpenses(userData.id);
          setPaidExpenses(Number(expenses?.paidExpenses || 0));
          setUnpaidExpenses(Number(expenses?.unpaidExpenses || 0));
        } catch (err) {
          setPaidExpenses(0);
          setUnpaidExpenses(0);
        }
      }
    };
    fetchUserExpenses();
  }, [userData?.id, getUserExpenses]);

  useEffect(() => {
    if (userData.id) {
      fetchGroups(userData.id);
      fetchFriends(userData.id);
    }
  }, [userData.id, fetchGroups, fetchFriends]);

  useEffect(() => {
    setMonths(getLastNMonths(monthCount));
  }, [monthCount]);

  // Build dữ liệu biểu đồ từ monthlyLend/monthlyOwe
  useEffect(() => {
    setData(
      months.map(month => ({
        month,
        lend: Number(monthlyLend[month] || 0),
        owe: Number(monthlyOwe[month] || 0),
      }))
    );
  }, [months, monthlyLend, monthlyOwe]);

  const balance = lend - owe;

  return (
    <div>
      <div className="flex items-center mb-4">
        <h1 className="[font-family:'Bree_Serif',Helvetica] font-normal text-3xl text-[#193865]">
          Statistics
        </h1>
      </div>
      <div
        style={{
          width: "100%",
          marginTop: "45px",
          maxHeight: "520px",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: "30px"
          }}
        >
          <BlockText
            title="Social"
            description={
              <div style={{ display: "flex", gap: 80 }}>
                <span>Group: <CountUp end={groups.length} duration={1.2} /></span>
                <span>Friend: <CountUp end={friends.length} duration={1.2} /></span>
              </div>
            }
          />

          <BlockText
            title="Expenses"
            description={
              <>
                <div style={{ display: "flex", gap: 80, marginBottom: 16 }}>
                  <span>All bills: <CountUp end={paidExpenses + unpaidExpenses} duration={1.2} /></span>
                  <span>Unpaid bills: <CountUp end={unpaidExpenses} duration={1.2} /></span>
                  <span>Paid bills: <CountUp end={paidExpenses} duration={1.2} /></span>
                </div>
                <div>
                  Balanced: <CountUp end={balance} duration={1.2} separator="." suffix="đ" />
                  <span style={{ marginLeft: 32, color: "#4caf50", fontWeight: 600 }}>
                    Lend: <CountUp end={lend} duration={1.2} separator="." suffix="đ" />
                  </span>
                  <span style={{ marginLeft: 32, color: "#ee4444", fontWeight: 600 }}>
                    Owe: <CountUp end={owe} duration={1.2} separator="." suffix="đ" />
                  </span>
                </div>
              </>
            }
          />

          {/* Chọn số tháng hiển thị */}
          <div style={{ width: "100%", maxWidth: 700, marginBottom: 8 }}>
            <label htmlFor="monthCount" style={{ fontWeight: 500, marginRight: 8 }}>Statistic in last:</label>
            <select
              id="monthCount"
              value={monthCount}
              onChange={e => setMonthCount(Number(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #bbb", fontSize: 15 }}
            >
              {MONTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Biểu đồ AreaChart với lend (green), owe (red) */}
          <div style={{ width: "100%", maxWidth: 700, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(32,50,91,0.08)", padding: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: "#20325b" }}>
              Lend & Owe ({monthCount} months)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOwe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ee4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ee4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="lend" stroke="#4caf50" fill="url(#colorLend)" name="Lend" />
                <Area type="monotone" dataKey="owe" stroke="#ee4444" fill="url(#colorOwe)" name="Owe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticInfo;