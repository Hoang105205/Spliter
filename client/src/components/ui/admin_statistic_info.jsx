import React, { useEffect, useState } from "react";
import BlockText from "./block_text.jsx";
import CountUp from 'react-countup';
import { useUser } from "../../hooks/useUser.js";
import { useGroup } from "../../hooks/useGroup.js";
import { useExpense } from "../../hooks/useExpense.js";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
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

const AdminStatisticInfo = () => {
  const [monthCount, setMonthCount] = useState(6); // Mặc định 6 tháng
  const [months, setMonths] = useState(getLastNMonths(6));
  const [data, setData] = useState([]);

  const { findAllUsers } = useUser();
  const { fetchAllGroups } = useGroup();
  const { getAllExpenses } = useExpense();

  // Server statistics
  const [totalUsers, setTotalUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [paidExpenses, setPaidExpenses] = useState(0);
  const [unpaidExpenses, setUnpaidExpenses] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  
  // Monthly data for charts
  const [monthlyUsers, setMonthlyUsers] = useState({});
  const [monthlyExpenses, setMonthlyExpenses] = useState({});

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await findAllUsers();
        setTotalUsers(users.length);
        
        // Count banned users
        const banned = users.filter(user => user.status === 'Banned').length;
        setBannedUsers(banned);
        
        // Group users by month
        const usersByMonth = {};
        users.forEach(user => {
          if (user.createdAt) {
            const date = new Date(user.createdAt);
            const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
          }
        });
        setMonthlyUsers(usersByMonth);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setTotalUsers(0);
        setBannedUsers(0);
        setMonthlyUsers({});
      }
    };
    fetchUsers();
  }, [findAllUsers]);

  // Fetch all groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await fetchAllGroups();
        setTotalGroups(groups.length);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setTotalGroups(0);
      }
    };
    fetchGroups();
  }, [fetchAllGroups]);

  // Fetch all expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await getAllExpenses();
        console.log("=== ALL EXPENSES DEBUG ===");
        console.log("Response from server:", response);
        
        const expenses = response.expenses || [];
        const summary = response.summary || {};
        
        console.log("Total expenses found:", expenses.length);
        console.log("Summary:", summary);
        
        setTotalExpenses(expenses.length);
        
        // Use backend calculated paid/unpaid counts
        setPaidExpenses(summary.paid || 0);
        setUnpaidExpenses(summary.unpaid || 0);
        setPaidAmount(summary.paidAmount || 0);
        setUnpaidAmount(summary.unpaidAmount || 0);
        
        // Calculate total expense amount with detailed logging
        let totalAmount = 0;
        expenses.forEach((expense, index) => {
          const amount = Number(expense.amount || 0);
          console.log(`Expense ${index + 1}:`, {
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            convertedAmount: amount,
            calculatedStatus: expense.calculatedStatus,
            createdAt: expense.createdAt,
            items: expense.items
          });
          totalAmount += amount;
        });
        
        console.log("Final total amount:", totalAmount);
        console.log("Paid expenses:", summary.paid, "Amount:", summary.paidAmount);
        console.log("Unpaid expenses:", summary.unpaid, "Amount:", summary.unpaidAmount);
        setTotalExpenseAmount(totalAmount);
        
        // Group expenses by month
        const expensesByMonth = {};
        expenses.forEach(expense => {
          if (expense.createdAt) {
            const date = new Date(expense.createdAt);
            const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + 1;
          }
        });
        setMonthlyExpenses(expensesByMonth);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        setTotalExpenses(0);
        setTotalExpenseAmount(0);
        setPaidExpenses(0);
        setUnpaidExpenses(0);
        setPaidAmount(0);
        setUnpaidAmount(0);
        setMonthlyExpenses({});
      }
    };
    fetchExpenses();
  }, [getAllExpenses]);

  useEffect(() => {
    setMonths(getLastNMonths(monthCount));
  }, [monthCount]);

  // Build chart data from monthly users and expenses
  useEffect(() => {
    setData(
      months.map(month => ({
        month,
        users: Number(monthlyUsers[month] || 0),
        expenses: Number(monthlyExpenses[month] || 0),
      }))
    );
  }, [months, monthlyUsers, monthlyExpenses]);

  const activeUsers = totalUsers - bannedUsers;

  // Data for amount pie chart
  const amountData = [
    { name: 'Paid', value: paidAmount, color: '#4caf50' },
    { name: 'Unpaid', value: unpaidAmount, color: '#ff9800' }
  ];

  // Data for amount bar chart
  const amountBarData = [
    {
      name: 'Total Amount',
      total: totalExpenseAmount,
      paid: paidAmount,
      unpaid: unpaidAmount
    }
  ];

  // Custom tooltip for amount charts
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          marginTop: "20px",
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
          paddingRight: "12px",
          paddingBottom: "40px",
          marginBottom: "30px"  
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: "25px"
          }}
        >
          <BlockText
            title="Users Overview"
            description={
              <div style={{ display: "flex", gap: 80 }}>
                <span>Total Users: <CountUp end={totalUsers} duration={1.2} /></span>
                <span style={{ color: "#4caf50", fontWeight: 600 }}>
                  Active: <CountUp end={activeUsers} duration={1.2} />
                </span>
                <span style={{ color: "#ee4444", fontWeight: 600 }}>
                  Banned: <CountUp end={bannedUsers} duration={1.2} />
                </span>
              </div>
            }
          />

          <BlockText
            title="Platform Activity"
            description={
              <>
                <div style={{ display: "flex", gap: 80, marginBottom: 16 }}>
                  <span>Total Groups: <CountUp end={totalGroups} duration={1.2} /></span>
                  <span>Total Expenses: <CountUp end={totalExpenses} duration={1.2} /></span>
                </div>
                <div style={{ display: "flex", gap: 80, marginBottom: 16 }}>
                  <span style={{ color: "#4caf50", fontWeight: 600 }}>
                    Paid: <CountUp end={paidExpenses} duration={1.2} />
                    <br />
                    <span style={{ fontSize: "0.9em", fontWeight: "normal" }}>
                      <CountUp end={paidAmount} duration={1.2} separator="." suffix="đ" />
                    </span>
                  </span>
                  <span style={{ color: "#ff9800", fontWeight: 600 }}>
                    Unpaid: <CountUp end={unpaidExpenses} duration={1.2} />
                    <br />
                    <span style={{ fontSize: "0.9em", fontWeight: "normal" }}>
                      <CountUp end={unpaidAmount} duration={1.2} separator="." suffix="đ" />
                    </span>
                  </span>
                </div>
                <div>
                  <span>Total Amount: <CountUp end={totalExpenseAmount} duration={1.2} separator="." suffix="đ" /></span>
                </div>
              </>
            }
          />

          {/* Chọn số tháng hiển thị */}
          <div style={{ width: "100%", maxWidth: 800, marginBottom: 12 }}>
            <label htmlFor="monthCount" style={{ fontWeight: 500, marginRight: 10, fontSize: 16 }}>
              Server growth in last:
            </label>
            <select
              id="monthCount"
              value={monthCount}
              onChange={e => setMonthCount(Number(e.target.value))}
              style={{ 
                padding: "8px 16px", 
                borderRadius: 6, 
                border: "1px solid #ddd", 
                fontSize: 15,
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              {MONTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Biểu đồ AreaChart với users (blue), expenses (green) */}
          <div style={{ width: "100%", maxWidth: 800, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(32,50,91,0.08)", padding: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, color: "#20325b" }}>
              Users & Expenses Growth ({monthCount} months)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stroke="#2196f3" fill="url(#colorUsers)" name="New Users" />
                <Area type="monotone" dataKey="expenses" stroke="#4caf50" fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ Amount Distribution - Pie Chart */}
          <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 1000 }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(32,50,91,0.08)", padding: 20 }}>
              <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#20325b" }}>
                Amount Distribution
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={amountData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {amountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Biểu đồ Amount Comparison - Bar Chart */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(32,50,91,0.08)", padding: 20 }}>
              <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#20325b" }}>
                Amount Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={amountBarData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name === 'total' ? 'Total' : name === 'paid' ? 'Paid' : 'Unpaid']} 
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#2196f3" name="Total" />
                  <Bar dataKey="paid" fill="#4caf50" name="Paid" />
                  <Bar dataKey="unpaid" fill="#ff9800" name="Unpaid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticInfo;
