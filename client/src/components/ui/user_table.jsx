import React, { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";

export default function UserTable() {
  const [search, setSearch] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Loading states for individual users
  const [updatingUsers, setUpdatingUsers] = useState(new Set());
  
  // Local state for each user's status
  const [userStatus, setUserStatus] = useState({});
  const { findAllUsers, updateStatus } = useUser();

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users = await findAllUsers();
        setCustomersData(users);
        
        // Set user status from fetched data
        const statusMap = {};
        users.forEach(user => {
          statusMap[user.id] = user.status || "Unbanned";
        });
        setUserStatus(statusMap);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [findAllUsers]);

  // Checkbox state
  const [selected, setSelected] = useState([]);


  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // State for expanded user row
  const [expandedUserId, setExpandedUserId] = useState(null);

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
    setExpandedUserId(null); // Close expanded details
  };

  const isAllSelected = selected.length === paginatedCustomers.length && paginatedCustomers.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedCustomers.map(c => c.id));
    } else {
      setSelected([]);
    }
    setExpandedUserId(null); // Close expanded details
  };
  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setExpandedUserId(null); // Close expanded details
  };

  // Toggle expanded row
  const handleExpandRow = (id) => {
    setExpandedUserId(prev => (prev === id ? null : id));
  };

  const handleToggleStatus = async (id) => {
    // Only allow banning, not unbanning
    const currentStatus = userStatus[id];
    if (currentStatus === "Banned") {
      return; // Don't allow unbanning
    }

    try {
      // Add to updating set
      setUpdatingUsers(prev => new Set([...prev, id]));
      
      const newStatus = "Banned";
      
      // Update user status via API
      await updateStatus(id, newStatus);
      
      // Update local state if API call successful
      setUserStatus(prev => ({
        ...prev,
        [id]: newStatus
      }));
      
      // Remove from updating set after completion
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      // Remove from updating set on error
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      console.error("Failed to update user status:", error);
    }
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
  const handleBanSelected = async () => {
    try {
      // Filter selected users that are currently unbanned
      const usersToBan = selected.filter(id => userStatus[id] === "Unbanned");
      
      // Add all users to ban to updating set
      setUpdatingUsers(prev => new Set([...prev, ...usersToBan]));
      
      // Update each user via API
      await Promise.all(
        usersToBan.map(id => updateStatus(id, "Banned"))
      );
      
      // Update local state if all API calls successful
      setUserStatus(prev => {
        const updated = { ...prev };
        usersToBan.forEach(id => {
          updated[id] = "Banned";
        });
        return updated;
      });
      
      // Remove all banned users from updating set and clear selection
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        usersToBan.forEach(id => newSet.delete(id));
        return newSet;
      });
      setSelected([]);
      setExpandedUserId(null); // Close expanded details
    } catch (error) {
      // Remove all users from updating set on error
      const usersToBan = selected.filter(id => userStatus[id] === "Unbanned");
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        usersToBan.forEach(id => newSet.delete(id));
        return newSet;
      });
      
      console.error("Failed to ban selected users:", error);
      // You can add a toast notification here if needed
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white relative">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading users...</span>
          </div>
        </div>
      )}
      
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
          <div className="flex-1 flex justify-end gap-2">
            {hasUnbannedUsers && (
              <button
                className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
                  selected.some(id => updatingUsers.has(id))
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
                onClick={handleBanSelected}
                disabled={selected.some(id => updatingUsers.has(id))}
              >
                {selected.some(id => updatingUsers.has(id)) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {selected.some(id => updatingUsers.has(id)) ? 'Waiting...' : 'Ban'}
              </button>
            )}
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .username-column {
          width: 200px !important;
          min-width: 200px !important;
          max-width: 200px !important;
        }
        .username-cell {
          width: 200px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fixed-table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .col-checkbox {
          width: 50px !important;
        }
        .col-id {
          width: 80px !important;
        }
        .col-email {
          width: 250px !important;
        }
        .col-phone {
          width: 150px !important;
        }
        .col-status {
          width: 120px !important;
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
            onChange={e => {
              setSearch(e.target.value);
              setExpandedUserId(null); // Close expanded details when searching
            }}
          />
        </div>
      </div>
      <table className="min-w-full text-sm align-middle fixed-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-3 text-center font-semibold text-gray-700 col-checkbox">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="accent-blue-600 w-4 h-4 rounded"
              />
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none col-id" onClick={() => handleSort('id')}>
              <span className="inline-flex items-center">
                ID
                <span className="ml-1">
                  {sortConfig.key === 'id' ? (
                    sortConfig.direction === 'asc' ? (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                    ) : (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    )
                  ) : (
                    <svg className="inline w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none username-column" onClick={() => handleSort('username')}>
              <span className="inline-flex items-center">
                Username
                <span className="ml-1">
                  {sortConfig.key === 'username' ? (
                    sortConfig.direction === 'asc' ? (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                    ) : (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    )
                  ) : (
                    <svg className="inline w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none col-email" onClick={() => handleSort('email')}>
              <span className="inline-flex items-center">
                Email
                <span className="ml-1">
                  {sortConfig.key === 'email' ? (
                    sortConfig.direction === 'asc' ? (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                    ) : (
                      <svg className="inline w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    )
                  ) : (
                    <svg className="inline w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
                  )}
                </span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 col-phone">Phone</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700 col-status">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.length > 0 ? paginatedCustomers.map((row, idx) => (
            <React.Fragment key={row.id}>
              <tr
                className={`${idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"} transition cursor-pointer`}
                onClick={e => {
                  // Đừng mở rộng khi click vào checkbox
                  if (e.target.tagName === 'INPUT') return;
                  handleExpandRow(row.id);
                }}
              >
                <td className="px-2 py-2 text-center col-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={ev => { ev.stopPropagation(); handleSelectRow(row.id); }}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </td>
                <td className="px-4 py-2 text-center col-id">{row.id}</td>
                <td className="px-4 py-2 text-left username-cell" title={row.username}>
                  {row.username}
                </td>
                <td className="px-4 py-2 text-left col-email" title={row.email}>
                  <div className="truncate">
                    {row.email}
                  </div>
                </td>
                <td className="px-4 py-2 text-left col-phone" title={row.phone}>
                  <div className="truncate">
                    {row.phone}
                  </div>
                </td>
                <td className="px-4 py-2 text-center col-status">
                  <span
                    className={`w-24 px-3 py-1 rounded font-semibold inline-block ${userStatus[row.id] === "Banned" ? "bg-red-100 text-red-600 border border-red-400" : "bg-green-100 text-green-700 border border-green-400"}`}
                  >
                    {userStatus[row.id]}
                  </span>
                </td>
              </tr>
              {expandedUserId === row.id && (
                <tr>
                  <td colSpan={6} className="bg-blue-50 border-t border-b border-blue-200 animate-fade-in">
                    <div className="p-4">
                      <div className="font-semibold text-gray-700 mb-3">User Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">ID:</span>
                          <span className="ml-2">{row.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Username:</span>
                          <span className="ml-2">{row.username}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="ml-2">{row.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span className="ml-2">{row.phone}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${userStatus[row.id] === "Banned" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                            {userStatus[row.id]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Account Created:</span>
                          <span className="ml-2">
                            {row.createdAt 
                              ? new Date(row.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        {userStatus[row.id] === "Unbanned" ? (
                          <>
                            <button
                              className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
                                updatingUsers.has(row.id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : "bg-red-500 text-white hover:bg-red-600"
                              } text-white`}
                              onClick={() => handleToggleStatus(row.id)}
                              disabled={updatingUsers.has(row.id)}
                            >
                              {updatingUsers.has(row.id) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              )}
                              {updatingUsers.has(row.id) ? 'Waiting...' : 'Ban'}
                            </button>
                            <span className="text-sm text-gray-500">
                              {updatingUsers.has(row.id) 
                                ? 'Processing...' 
                                : 'Click to ban this user'
                              }
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">
                            This user has been permanently banned
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <span className="font-medium text-gray-600">Additional Info:</span>
                        <p className="text-gray-500 text-sm mt-1">Click on this row to expand/collapse user details.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                {loading ? "Loading..." : "No users found"}
              </td>
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
                setExpandedUserId(null); // Close expanded details when changing rows per page
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
              onClick={() => {
                setPage(page - 1);
                setExpandedUserId(null); // Close expanded details when changing page
              }}
              disabled={page === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${p === page ? 'bg-gray-200 font-bold' : ''}`}
                onClick={() => {
                  setPage(p);
                  setExpandedUserId(null); // Close expanded details when changing page
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => {
                setPage(page + 1);
                setExpandedUserId(null); // Close expanded details when changing page
              }}
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