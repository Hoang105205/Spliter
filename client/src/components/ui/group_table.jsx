import React, { useState, useEffect } from "react";
import { useGroup } from "../../hooks/useGroup";

export default function GroupTable() {
  const [search, setSearch] = useState("");
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupMembers, setGroupMembers] = useState({}); // Store members for each group
  const [memberCounts, setMemberCounts] = useState({}); // Cache member counts separately
  const [loadingMembers, setLoadingMembers] = useState({}); // Track loading state for members
  
  const { fetchAllGroups, getGroupmember, deleteGroup } = useGroup();


  // Fetch groups on mount (optimized - no upfront member counting)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const groups = await fetchAllGroups();
        setGroupsData(groups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [fetchAllGroups]);

  // Optimized function to fetch member count only when needed
  const fetchMemberCount = async (groupId) => {
    // Return cached count if available
    if (memberCounts[groupId] !== undefined) {
      return memberCounts[groupId];
    }
    
    // Return cached member length if we have full member data
    if (groupMembers[groupId]) {
      const count = groupMembers[groupId].length;
      setMemberCounts(prev => ({ ...prev, [groupId]: count }));
      return count;
    }
    
    try {
      const members = await getGroupmember(groupId);
      const count = members ? members.length : 0;
      setMemberCounts(prev => ({ ...prev, [groupId]: count }));
      return count;
    } catch (error) {
      console.error(`Failed to fetch member count for group ${groupId}:`, error);
      const fallbackCount = groupsData.find(g => g.id === groupId)?.memberCount || 0;
      setMemberCounts(prev => ({ ...prev, [groupId]: fallbackCount }));
      return fallbackCount;
    }
  };

  // Checkbox state
  const [selected, setSelected] = useState([]);

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // State for expanded group row
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  
  // State for showing all members in expanded groups
  const [showAllMembers, setShowAllMembers] = useState({});

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Filter by group name (case insensitive)
  let filteredGroups = groupsData.filter(
    g => g.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort logic
  if (sortConfig.key) {
    filteredGroups = [...filteredGroups].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'id' || sortConfig.key === 'memberCount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalRows = filteredGroups.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedGroups = filteredGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Batch fetch member counts for visible groups (performance optimization)
  useEffect(() => {
    const fetchVisibleGroupCounts = async () => {
      const groupsNeedingCounts = paginatedGroups.filter(group => 
        memberCounts[group.id] === undefined && !loadingMembers[group.id]
      );
      
      if (groupsNeedingCounts.length > 0 && !loading) {
        // Fetch counts for up to 5 groups at a time to avoid overwhelming the server
        const batchSize = 5;
        for (let i = 0; i < groupsNeedingCounts.length; i += batchSize) {
          const batch = groupsNeedingCounts.slice(i, i + batchSize);
          batch.forEach(group => {
            fetchMemberCount(group.id); // This is async but we don't await to allow parallel execution
          });
        }
      }
    };

    // Only fetch if we have groups and not currently loading
    if (paginatedGroups.length > 0 && !loading) {
      // Small delay to avoid fetching on every state change
      const timeoutId = setTimeout(fetchVisibleGroupCounts, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [paginatedGroups, memberCounts, loading]);

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
    setExpandedGroupId(null); // Close expanded details
  };

  const isAllSelected = selected.length === paginatedGroups.length && paginatedGroups.length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedGroups.map(g => g.id));
    } else {
      setSelected([]);
    }
    setExpandedGroupId(null); // Close expanded details
  };

  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setExpandedGroupId(null); // Close expanded details
  };

  // Optimized toggle expanded row
  const handleExpandRow = async (id) => {
    const isExpanding = expandedGroupId !== id;
    setExpandedGroupId(prev => (prev === id ? null : id));
    
    // Only fetch members if we don't have them already and we're expanding
    if (isExpanding && !groupMembers[id]) {
      setLoadingMembers(prev => ({ ...prev, [id]: true }));
      try {
        const members = await getGroupmember(id);
        const memberData = members || [];
        setGroupMembers(prev => ({ ...prev, [id]: memberData }));
        // Update member count cache when we fetch full member data
        setMemberCounts(prev => ({ ...prev, [id]: memberData.length }));
      } catch (error) {
        console.error("Failed to fetch group members:", error);
        setGroupMembers(prev => ({ ...prev, [id]: [] }));
        setMemberCounts(prev => ({ ...prev, [id]: 0 }));
      } finally {
        setLoadingMembers(prev => ({ ...prev, [id]: false }));
      }
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
  }, [selected.length, showBar]);

  // Toggle show all members for a specific group
  const toggleShowAllMembers = (groupId) => {
    setShowAllMembers(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    
    setConfirmModal({
      show: true,
      title: 'Delete Groups',
      message: `Are you sure you want to delete ${selected.length} group${selected.length > 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        
        const successfulDeletes = [];
        const failedDeletes = [];
        
        for (const groupId of selected) {
          try {
            const success = await deleteGroup(groupId);
            if (success) {
              successfulDeletes.push(groupId);
            } else {
              failedDeletes.push(groupId);
            }
          } catch (error) {
            console.error(`Failed to delete group ${groupId}:`, error);
            failedDeletes.push(groupId);
          }
        }
        
        // Remove successfully deleted groups from local state
        if (successfulDeletes.length > 0) {
          setGroupsData(prev => prev.filter(group => !successfulDeletes.includes(group.id)));
          setSelected([]);
          setExpandedGroupId(null);
          
          // Clear cached data for deleted groups
          setGroupMembers(prev => {
            const updated = { ...prev };
            successfulDeletes.forEach(id => delete updated[id]);
            return updated;
          });
          setMemberCounts(prev => {
            const updated = { ...prev };
            successfulDeletes.forEach(id => delete updated[id]);
            return updated;
          });
        }
        
        console.log(`Delete completed: ${successfulDeletes.length} successful, ${failedDeletes.length} failed`);
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false });
      },
      loading: false
    });
  };

  const handleDeleteSingleGroup = async (groupId, groupName) => {
    setConfirmModal({
      show: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        
        try {
          const success = await deleteGroup(groupId);
          if (success) {
            setGroupsData(prev => prev.filter(group => group.id !== groupId));
            setExpandedGroupId(null);
            setGroupMembers(prev => {
              const updated = { ...prev };
              delete updated[groupId];
              return updated;
            });
            setMemberCounts(prev => {
              const updated = { ...prev };
              delete updated[groupId];
              return updated;
            });
            console.log(`Group ${groupId} deleted successfully`);
          }
        } catch (error) {
          console.error(`Failed to delete group ${groupId}:`, error);
          alert('Failed to delete group. Please try again.');
        }
        
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false });
      },
      loading: false
    });
  };

  // Optimized MemberCountBadge component with lazy loading
  const MemberCountBadge = ({ groupId, fallbackCount }) => {
    const [displayCount, setDisplayCount] = useState(memberCounts[groupId] || fallbackCount || 0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      // If we don't have cached count and it's not the fallback, fetch it
      if (memberCounts[groupId] === undefined && !isLoading) {
        setIsLoading(true);
        fetchMemberCount(groupId).then(count => {
          setDisplayCount(count);
          setIsLoading(false);
        });
      } else if (memberCounts[groupId] !== undefined) {
        setDisplayCount(memberCounts[groupId]);
      }
    }, [groupId, memberCounts[groupId], fallbackCount]);

    return (
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
        {isLoading ? '...' : displayCount}
      </span>
    );
  };

  // Reusable Delete Button Component
  const DeleteButton = ({ onClick, children, className = "" }) => {
    return (
      <button
        onClick={onClick}
        className={`group relative px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg border border-red-600 hover:border-red-700 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <svg className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-active:opacity-20 transition-opacity duration-100"></div>
      </button>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!confirmModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{confirmModal.message}</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false })}
                disabled={confirmModal.loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                disabled={confirmModal.loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {confirmModal.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow bg-white relative">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading groups...</span>
          </div>
        </div>
      )}
      
      {/* Notification bar for selected groups */}
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
              {selected.length} group{selected.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex-1 flex justify-end gap-2">
            {/* Delete button */}
            <DeleteButton onClick={handleDeleteSelected}>
              Delete
            </DeleteButton>
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
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in {
          animation: scale-in 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .group-name-column {
          width: 250px !important;
          min-width: 250px !important;
          max-width: 250px !important;
        }
        .group-name-cell {
          width: 250px !important;
          min-width: 250px !important;
          max-width: 250px !important;
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
        .col-members {
          width: 120px !important;
        }
        .col-created {
          width: 180px !important;
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
            placeholder="Search group name."
            className="border pl-9 pr-3 py-2 rounded w-64"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setExpandedGroupId(null); // Close expanded details when searching
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
            <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none group-name-column" onClick={() => handleSort('name')}>
              <span className="inline-flex items-center">
                Group Name
                <span className="ml-1">
                  {sortConfig.key === 'name' ? (
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
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none col-members" onClick={() => handleSort('memberCount')}>
              <span className="inline-flex items-center">
                Members
                <span className="ml-1">
                  {sortConfig.key === 'memberCount' ? (
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
            <th className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none col-created" onClick={() => handleSort('createdAt')}>
              <span className="inline-flex items-center">
                Created At
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
          </tr>
        </thead>
        <tbody>
          {paginatedGroups.length > 0 ? paginatedGroups.map((row, idx) => (
            <React.Fragment key={row.id}>
              <tr
                className={`${idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"} transition cursor-pointer`}
                onClick={e => {
                  // Don't expand when clicking on checkbox
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
                <td className="px-4 py-2 text-left group-name-cell" title={row.name}>
                  {row.name}
                </td>
                <td className="px-4 py-2 text-center col-members">
                  <MemberCountBadge 
                    groupId={row.id} 
                    fallbackCount={row.memberCount}
                  />
                </td>
                <td className="px-4 py-2 text-center col-created">
                  {row.createdAt 
                    ? new Date(row.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </td>
              </tr>
              {expandedGroupId === row.id && (
                <tr>
                  <td colSpan={5} className="bg-blue-50 border-t border-b border-blue-200 animate-fade-in">
                    <div className="p-4">
                      <div className="font-semibold text-gray-700 mb-3">Group Details</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">ID:</span>
                          <span className="ml-2">{row.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Group Name:</span>
                          <span className="ml-2">{row.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Total Members:</span>
                          <span className="ml-2">
                            <MemberCountBadge 
                              groupId={row.id} 
                              fallbackCount={row.memberCount}
                            />
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Created At:</span>
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
                      
                      {/* Group Members Section */}
                      <div className="mt-4">
                        <div className="font-medium text-gray-600 mb-2">Group Members:</div>
                        {loadingMembers[row.id] ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Loading members...
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {groupMembers[row.id] && groupMembers[row.id].length > 0 ? (
                              <div>
                                <div className="grid grid-cols-2 gap-2">
                                  {(() => {
                                    const members = groupMembers[row.id];
                                    const showAll = showAllMembers[row.id] || false;
                                    const displayMembers = showAll ? members : members.slice(0, 6);
                                    
                                    return displayMembers.map((member, index) => {
                                      const isCreator = member.id === row.ownerId;
                                      return (
                                        <div 
                                          key={member.id || index} 
                                          className={`flex items-center gap-2 p-2 rounded border transition-all duration-200 ${
                                            isCreator 
                                              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-md ring-2 ring-yellow-200' 
                                              : 'bg-white border-gray-200 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold relative overflow-hidden ${
                                            isCreator 
                                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg' 
                                              : 'bg-blue-500 text-white'
                                          }`}>
                                            {(member.avatarURL || member.avatar || member.profilePicture) ? (
                                              <img 
                                                src={member.avatarURL || member.avatar || member.profilePicture} 
                                                alt={member.username || 'User'} 
                                                className="w-full h-full object-cover rounded-full"
                                                onError={(e) => {
                                                  // Fallback to initial letter if image fails to load
                                                  const parent = e.target.parentElement;
                                                  e.target.remove();
                                                  const span = document.createElement('span');
                                                  span.className = 'w-full h-full flex items-center justify-center';
                                                  span.textContent = member.username?.charAt(0).toUpperCase() || 'U';
                                                  parent.appendChild(span);
                                                }}
                                              />
                                            ) : (
                                              <span className="w-full h-full flex items-center justify-center">
                                                {member.username?.charAt(0).toUpperCase() || 'U'}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${
                                              isCreator ? 'text-amber-900' : 'text-gray-900'
                                            }`}>
                                              {member.username || 'Unknown User'}
                                              {isCreator && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                  Creator
                                                </span>
                                              )}
                                            </div>
                                            <div className={`text-xs truncate ${
                                              isCreator ? 'text-amber-600' : 'text-gray-500'
                                            }`}>
                                              {member.email || 'No email'}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                                
                                {/* Show More/Less Button */}
                                {groupMembers[row.id] && groupMembers[row.id].length > 6 && (
                                  <div className="mt-3 flex justify-center">
                                    <button
                                      onClick={() => toggleShowAllMembers(row.id)}
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                    >
                                      {showAllMembers[row.id] ? (
                                        <>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                                          </svg>
                                          Show Less ({groupMembers[row.id].length - 6} hidden)
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                          </svg>
                                          Show More (+{groupMembers[row.id].length - 6} members)
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 italic">
                                No members found in this group
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-600">Additional Info:</span>
                            <p className="text-gray-500 text-sm mt-1">Click on this row to expand/collapse group details.</p>
                          </div>
                          <div className="flex gap-2">
                            <DeleteButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSingleGroup(row.id, row.name);
                              }}
                              className="text-sm py-2.5"
                            >
                              Delete
                            </DeleteButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )) : (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                {loading ? "Loading..." : "No groups found"}
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
                setExpandedGroupId(null); // Close expanded details when changing rows per page
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
                setExpandedGroupId(null); // Close expanded details when changing page
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
                    setExpandedGroupId(null);
                  }}
                >
                  {p}
                </button>
              ))}
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => {
                setPage(page + 1);
                setExpandedGroupId(null); // Close expanded details when changing page
              }}
              disabled={page === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
}
