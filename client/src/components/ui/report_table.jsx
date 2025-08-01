import React, { useState, useEffect } from "react";
import { useReport } from "../../hooks/useReport";

export default function ReportTable() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Loading states for individual reports
  const [updatingReports, setUpdatingReports] = useState(new Set());
  
  // Use reports from zustand store directly
  const { reports, fetchAllReports, updateReportStatus } = useReport();

  // Fetch all reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        await fetchAllReports();
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [fetchAllReports]);

  // Checkbox state
  const [selected, setSelected] = useState([]);

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // State for expanded report row
  const [expandedReportId, setExpandedReportId] = useState(null);

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Filter by reporter username or reported user username (case insensitive)
  let filteredReports = reports.filter(
    r => r.reporter?.username.toLowerCase().includes(search.toLowerCase()) ||
         r.reportedUser?.username.toLowerCase().includes(search.toLowerCase()) ||
         r.reason.toLowerCase().includes(search.toLowerCase())
  );

  // Sort logic
  if (sortConfig.key) {
    filteredReports = [...filteredReports].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'id') {
        aValue = Number(a[sortConfig.key]);
        bValue = Number(b[sortConfig.key]);
      } else if (sortConfig.key === 'reporter') {
        aValue = a.reporter?.username.toLowerCase() || '';
        bValue = b.reporter?.username.toLowerCase() || '';
      } else if (sortConfig.key === 'reportedUser') {
        aValue = a.reportedUser?.username.toLowerCase() || '';
        bValue = b.reportedUser?.username.toLowerCase() || '';
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(a[sortConfig.key]);
        bValue = new Date(b[sortConfig.key]);
      } else {
        aValue = a[sortConfig.key]?.toLowerCase() || '';
        bValue = b[sortConfig.key]?.toLowerCase() || '';
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalRows = filteredReports.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedReports = filteredReports.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
    setExpandedReportId(null); // Close expanded details
  };

  const isAllSelected = selected.length === paginatedReports.length && paginatedReports.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedReports.map(r => r.id));
    } else {
      setSelected([]);
    }
    setExpandedReportId(null); // Close expanded details
  };

  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Toggle expanded row
  const handleExpandRow = (id) => {
    setExpandedReportId(prev => prev === id ? null : id);
  };

  // Update report status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Add to updating set
      setUpdatingReports(prev => new Set([...prev, id]));
      
      await updateReportStatus(id, newStatus);
      
      // Remove from updating set after completion
      setUpdatingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      // Remove from updating set on error
      setUpdatingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      console.error("Failed to update report status:", error);
      alert("Failed to update report status: " + error.message);
    }
  };

  // Animation state for notification bar
  const [showBar, setShowBar] = useState(false);
  const [barLeaving, setBarLeaving] = useState(false);

  useEffect(() => {
    if (selected.length > 0) {
      setShowBar(true);
      setBarLeaving(false);
    } else {
      if (showBar) {
        setBarLeaving(true);
        setTimeout(() => {
          setShowBar(false);
          setBarLeaving(false);
        }, 300);
      }
    }
  }, [selected.length]);

  // Resolve selected reports
  const handleResolveSelected = async () => {
    try {
      // Add all selected reports to updating set
      setUpdatingReports(prev => new Set([...prev, ...selected]));
      
      await Promise.all(selected.map(id => updateReportStatus(id, 'Resolved')));
      
      // Remove all selected reports from updating set and clear selection
      setUpdatingReports(prev => {
        const newSet = new Set(prev);
        selected.forEach(id => newSet.delete(id));
        return newSet;
      });
      setSelected([]);
    } catch (error) {
      // Remove all selected reports from updating set on error
      setUpdatingReports(prev => {
        const newSet = new Set(prev);
        selected.forEach(id => newSet.delete(id));
        return newSet;
      });
      
      console.error("Failed to resolve reports:", error);
    }
  };

  // Check if any selected reports are pending
  const selectedReports = selected.map(id => {
    const report = reports.find(r => r.id === id);
    return { id, status: report?.status || 'Pending' };
  });
  const hasPendingReports = selectedReports.some(report => report.status === "Pending");

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white relative">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading reports...</span>
          </div>
        </div>
      )}
      
      {/* Notification bar for selected reports */}
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
              {selected.length} report{selected.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex-1 flex justify-end gap-2">
            {hasPendingReports && (
              <button
                className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
                  selected.some(id => updatingReports.has(id))
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                onClick={handleResolveSelected}
                disabled={selected.some(id => updatingReports.has(id))}
              >
                {selected.some(id => updatingReports.has(id)) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {selected.some(id => updatingReports.has(id)) ? 'Waiting...' : 'Resolve'}
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
      `}</style>
      
      {/* Search bar */}
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
            placeholder="Search reports by username or reason..."
            className="border pl-9 pr-3 py-2 rounded w-80"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setExpandedReportId(null);
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
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('id')}>
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('reporter')}>
              <span className="inline-flex items-center">
                Reporter
                <span className="ml-1">
                  {sortConfig.key === 'reporter' ? (
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('reportedUser')}>
              <span className="inline-flex items-center">
                Reported User
                <span className="ml-1">
                  {sortConfig.key === 'reportedUser' ? (
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Reason</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
              <span className="inline-flex items-center">
                Date
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
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedReports.length > 0 ? paginatedReports.map((row, idx) => (
            <React.Fragment key={row.id}>
              <tr
                className={`${idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"} transition cursor-pointer`}
                onClick={e => {
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
                <td className="px-4 py-2 text-center">{row.id}</td>
                <td className="px-4 py-2 text-left">{row.reporter?.username || 'N/A'}</td>
                <td className="px-4 py-2 text-left">{row.reportedUser?.username || 'N/A'}</td>
                <td className="px-4 py-2 text-left">{row.reason.length > 50 ? row.reason.substring(0, 50) + '...' : row.reason}</td>
                <td className="px-4 py-2 text-center">
                  {new Date(row.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`w-24 px-3 py-1 rounded font-semibold inline-block ${
                      (row.status || 'Pending') === "Pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-400" :
                      (row.status || 'Pending') === "Resolved" ? "bg-green-100 text-green-700 border border-green-400" :
                      "bg-red-100 text-red-600 border border-red-400"
                    }`}
                  >
                    {row.status || 'Pending'}
                  </span>
                </td>
              </tr>
              {expandedReportId === row.id && (
                <tr>
                  <td colSpan={7} className="bg-blue-50 border-t border-b border-blue-200 animate-fade-in">
                    <div className="p-4">
                      <div className="font-semibold text-gray-700 mb-3">Report Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Report ID:</span>
                          <span className="ml-2">{row.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Reporter:</span>
                          <span className="ml-2">{row.reporter?.username} ({row.reporter?.email})</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Reported User:</span>
                          <span className="ml-2">{row.reportedUser?.username} ({row.reportedUser?.email})</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                            (row.status || 'Pending') === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            (row.status || 'Pending') === "Resolved" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-600"
                          }`}>
                            {row.status || 'Pending'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Reason:</span>
                          <p className="ml-2 mt-1 text-gray-700">{row.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Reported Date:</span>
                          <span className="ml-2">
                            {new Date(row.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      {(row.status === "Pending" || !row.status) && (
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
                              updatingReports.has(row.id) 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                            onClick={() => handleUpdateStatus(row.id, 'Resolved')}
                            disabled={updatingReports.has(row.id)}
                          >
                            {updatingReports.has(row.id) && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {updatingReports.has(row.id) ? 'Waiting...' : 'Resolve'}
                          </button>
                          <span className="text-sm text-gray-500">
                            {updatingReports.has(row.id) ? 'Processing...' : 'Click to resolve this report'}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )) : (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                {filteredReports.length === 0 && search ? 'No reports match your search.' : 'No reports found.'}
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
                setExpandedReportId(null); // Close expanded details when changing rows per page
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
                setExpandedReportId(null); // Close expanded details when changing page
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
                  setExpandedReportId(null); // Close expanded details when changing page
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => {
                setPage(page + 1);
                setExpandedReportId(null); // Close expanded details when changing page
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
