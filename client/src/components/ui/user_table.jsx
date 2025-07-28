import React, { useState, useEffect } from "react";

const customersData = [
  { id: 1, username: "Smith", email: "smith@example.com", phone: "123-456-7890", status: "Unbanned" },
  { id: 2, username: "Bob", email: "bob@example.com", phone: "234-567-8901", status: "Banned" },
  { id: 3, username: "Alice", email: "alice@example.com", phone: "345-678-9012", status: "Unbanned" },
  { id: 4, username: "John", email: "john@example.com", phone: "456-789-0123", status: "Unbanned" },
  { id: 5, username: "Jane", email: "jane@example.com", phone: "567-890-1234", status: "Unbanned" },
  { id: 6, username: "Emily", email: "emily@example.com", phone: "678-901-2345", status: "Unbanned" },
  { id: 7, username: "Michael", email: "michael@example.com", phone: "789-012-3456", status: "Unbanned" },
  { id: 8, username: "Sarah", email: "sarah@example.com", phone: "890-123-4567", status: "Unbanned" },
  { id: 9, username: "David", email: "david@example.com", phone: "901-234-5678", status: "Unbanned" },
  { id: 10, username: "Laura", email: "laura@example.com", phone: "012-345-6789", status: "Unbanned" },
  { id: 11, username: "Chris", email: "chris@example.com", phone: "123-456-7890", status: "Unbanned" },
  { id: 12, username: "Jessica", email: "jessica@example.com", phone: "234-567-8901", status: "Unbanned" },
  { id: 13, username: "Tom", email: "tom@example.com", phone: "345-678-9012", status: "Unbanned" },
  { id: 14, username: "Lisa", email: "lisa@example.com", phone: "456-789-0123", status: "Unbanned" },
  { id: 15, username: "Kevin", email: "kevin@example.com", phone: "567-890-1234", status: "Unbanned" },
  { id: 16, username: "Rachel", email: "rachel@example.com", phone: "678-901-2345", status: "Unbanned" },
  { id: 17, username: "Daniel", email: "daniel@example.com", phone: "789-012-3456", status: "Unbanned" },
  { id: 18, username: "Olivia", email: "olivia@example.com", phone: "890-123-4567", status: "Unbanned" },
  { id: 19, username: "James", email: "james@example.com", phone: "901-234-5678", status: "Unbanned" },
  { id: 20, username: "Emma", email: "emma@example.com", phone: "012-345-6789", status: "Unbanned" },
  { id: 21, username: "George", email: "george@example.com", phone: "123-456-7890", status: "Unbanned" }
];

export default function CustomerTable() {
  const [search, setSearch] = useState("");
  // Local state for each user's status
  const [userStatus, setUserStatus] = useState(() => {
    const map = {};
    customersData.forEach(c => { map[c.id] = c.status; });
    return map;
  });

  // Sync userStatus with customersData (handle new users)
  useEffect(() => {
    setUserStatus(prev => {
      const updated = { ...prev };
      let changed = false;
      customersData.forEach(c => {
        if (!(c.id in updated)) {
          updated[c.id] = c.status || "Unbanned";
          changed = true;
        }
      });
      // Remove users that no longer exist
      Object.keys(updated).forEach(id => {
        if (!customersData.find(c => c.id === Number(id))) {
          delete updated[id];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [customersData.length]);
  // Checkbox state
  const [selected, setSelected] = useState([]);


  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);


  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Filter by username (case insensitive)
  let filteredCustomers = customersData.filter(
    c => c.username.toLowerCase().includes(search.toLowerCase())
  );

  // Sort logic
  if (sortConfig.key) {
    filteredCustomers = [...filteredCustomers].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'id') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalRows = filteredCustomers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
    setPage(1);
  };

  const isAllSelected = selected.length === paginatedCustomers.length && paginatedCustomers.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedCustomers.map(c => c.id));
    } else {
      setSelected([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleStatus = (id) => {
    setUserStatus(prev => ({
      ...prev,
      [id]: prev[id] === "Banned" ? "Unbanned" : "Banned"
    }));
  };

  // Animation state for notification bar
  const [showBar, setShowBar] = useState(false);
  const [barLeaving, setBarLeaving] = useState(false);

  useEffect(() => {
    if (selected.length > 0) {
      setShowBar(true);
      setBarLeaving(false);
    } else if (showBar) {
      setBarLeaving(true);
      const timeout = setTimeout(() => {
        setShowBar(false);
        setBarLeaving(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [selected.length]);

  // Ban selected users
  const handleBanSelected = () => {
    setUserStatus(prev => {
      const updated = { ...prev };
      selected.forEach(id => {
        updated[id] = "Banned";
      });
      return updated;
    });
    setSelected([]);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white relative">
      {/* Notification bar for selected users */}
      {showBar && (
        <div className={`absolute left-0 right-0 top-0 z-20 flex items-center bg-blue-50 border-b border-blue-200 px-6 py-3 ${barLeaving ? 'animate-slide-down' : 'animate-slide-up'}`}>
          <div className="flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              title="Clear selection"
              onClick={() => setSelected([])}
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <span className="text-blue-700 font-medium">
              {selected.length} user{selected.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors font-semibold"
              onClick={handleBanSelected}
            >
              Ban
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(40px); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
      {/* Search bar with magnifying glass icon */}
      <div className="p-4 flex items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M20 20l-3-3"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search user name."
            className="border pl-9 pr-3 py-2 rounded w-48"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <table className="min-w-full text-sm align-middle">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-3 text-center font-semibold text-gray-700 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="accent-blue-600 w-4 h-4 rounded"
              />
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('id')}>
              <span className="inline-flex items-center">
                ID
                <span className="ml-1">
                  {sortConfig.key === 'id' ? (
                    sortConfig.direction === 'asc' ? (
                      <span className="inline text-xs">▲</span>
                    ) : (
                      <span className="inline text-xs">▼</span>
                    )
                  ) : (
                    <span className="inline text-xs text-gray-300">▲</span>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('username')}>
              <span className="inline-flex items-center">
                Username
                <span className="ml-1">
                  {sortConfig.key === 'username' ? (
                    sortConfig.direction === 'asc' ? (
                      <span className="inline text-xs">▲</span>
                    ) : (
                      <span className="inline text-xs">▼</span>
                    )
                  ) : (
                    <span className="inline text-xs text-gray-300">▲</span>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('email')}>
              <span className="inline-flex items-center">
                Email
                <span className="ml-1">
                  {sortConfig.key === 'email' ? (
                    sortConfig.direction === 'asc' ? (
                      <span className="inline text-xs">▲</span>
                    ) : (
                      <span className="inline text-xs">▼</span>
                    )
                  ) : (
                    <span className="inline text-xs text-gray-300">▲</span>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.length > 0 ? paginatedCustomers.map((row, idx) => (
            <tr
              key={row.id}
              className={idx % 2 === 0 ? "bg-white hover:bg-blue-50 transition" : "bg-gray-50 hover:bg-blue-50 transition"}
            >
              <td className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                  className="accent-blue-600 w-4 h-4 rounded"
                />
              </td>
              <td className="px-4 py-2 text-center">{row.id}</td>
              <td className="px-4 py-2 text-left">{row.username}</td>
              <td className="px-4 py-2 text-left">{row.email}</td>
              <td className="px-4 py-2 text-left">{row.phone}</td>
              <td className="px-4 py-2 text-center">
                <button
                  className={`w-24 px-3 py-1 rounded font-semibold focus:outline-none transition ${userStatus[row.id] === "Banned" ? "bg-red-100 text-red-600 border border-red-400" : "bg-green-100 text-green-700 border border-green-400"}`}
                  onClick={() => handleToggleStatus(row.id)}
                >
                  {userStatus[row.id]}
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">No customers found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-end px-4 py-2 border-t bg-white text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 15].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            {totalRows === 0 ? (
              <span>0-0 of 0</span>
            ) : (
              <span>
                {(page - 1) * rowsPerPage + 1}
                -
                {Math.min(page * rowsPerPage, totalRows)}
                {' '}of {totalRows}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${p === page ? 'bg-gray-200 font-bold' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}