import React, { useEffect, useState } from "react";
import Sort from "./sort";
import BlockText from "./block_text";
import { useActivity } from "../../hooks/useActivity";
import { useUser } from "../../hooks/useUser";

const AdminActivityList = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Loading states for individual users
  const [updatingUsers, setUpdatingUsers] = useState(new Set());
  
  // Local state for each user's status
  const { findAllUsers, updateStatus } = useUser();
  const [sortType, setSortType] = React.useState("latest");
  const { activities, fetchAllActivities } = useActivity();

  // Fetch all users' activities on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await findAllUsers();
        await fetchAllActivities(users);
      } catch (err) {

      }
    };
    fetchUsers();
  }, [findAllUsers, fetchAllActivities]);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users = await findAllUsers();
        fetchAllActivities(users);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [findAllUsers, fetchAllActivities]);

  // Checkbox state
  const [selected, setSelected] = useState([]);

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // State for expanded user row
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Filter by title (case insensitive)
   let filteredActivities = activities.filter(
    c => c.title.toLowerCase().includes(search.toLowerCase())
  ); 

  // Sort logic
  if (sortConfig.key) {
    filteredActivities = [...filteredActivities].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'userId') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } 
      else if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      else if (sortConfig.key === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalRows = filteredActivities.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedCustomers = filteredActivities.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
              {selected.length} activitie{selected.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex-1 flex justify-end gap-2">
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
            placeholder="Search user's ID"
            className="border pl-9 pr-3 py-2 rounded w-48"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setExpandedUserId(null); // Close expanded details when searching
            }}
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
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('userId')}>
              <span className="inline-flex items-center">
                User ID
                <span className="ml-1">
                  {sortConfig.key === 'userId' ? (
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('title')}>
              <span className="inline-flex items-center">
                Title
                <span className="ml-1">
                  {sortConfig.key === 'title' ? (
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
              <span className="inline-flex items-center">
                Create at
                <span className="ml-1">
                  {sortConfig.key === 'createdAt' ? (
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
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
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={ev => { ev.stopPropagation(); handleSelectRow(row.id); }}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </td>
                <td className="px-4 py-2 text-center">{row.userId}</td>
                <td className="px-4 py-2 text-left">{row.title}</td>
                <td className="px-4 py-2 text-left">
                  {new Date(row.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</td>
                <td className="px-4 py-2 text-left">  {row.description.length > 40
                                                        ? row.description.slice(0, 40) + '...'
                                                        : row.description}</td>
              </tr>
              {expandedUserId === row.id && (
                <tr>
                  <td colSpan={6} className="bg-blue-50 border-t border-b border-blue-200 animate-fade-in">
                    <div className="p-4">
                      <div className="font-semibold text-gray-700 mb-3">Activity Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">User ID:</span>
                          <span className="ml-2">{row.userId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Title:</span>
                          <span className="ml-2">{row.title}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Type:</span>
                          <span className="ml-2">{row.activityType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Create at:</span>
                          <span className="ml-2">
                          {new Date(row.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="text-sm mt-1">{row.description}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                {loading ? "Loading..." : "No activities found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-end px-4 py-2 border-t bg-white text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-left gap-2">
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
              {[5, 10].map(n => (
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
            {Array.from({ length: 3 }, (_, i) => page - 1 + i)
              .filter(p => p >= 1 && p <= totalPages)
              .map(p => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${p === page ? 'bg-gray-200 font-bold' : ''}`}
                  onClick={() => {
                    setPage(p);
                    setExpandedUserId(null);
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

export default AdminActivityList;