import { PlusIcon, CrownIcon, RefreshCwIcon, SettingsIcon } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import Head_bar from "../../components/ui/headbar.jsx";
import Left_bar from "../../components/ui/leftbar.jsx";
import CalendarPopup from "../../components/ui/calendarpicker.jsx";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { motion, AnimatePresence, percent } from "framer-motion";
import { toast } from "sonner";

// Import custom hooks
import { useUser } from '../../hooks/useUser.js';
import { useGroupMember } from '../../hooks/useGroupMember.js';
import { useGroup } from "../../hooks/useGroup.js";
import { useFriend } from "../../hooks/useFriend.js";
import { useExpense } from '../../hooks/useExpense.js';
import { useNotification } from '../../hooks/useNotification.js';

// Import WebSocket context
import { WebSocketContext } from '../../websocket/WebSocketProvider.jsx';

function Dashboard_group() {
  const navigate = useNavigate();

  // Handle tab clicks
  const [activeTab, setActiveTab] = useState("group"); // or "recently", etc.

  // State to hold selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // State to store avatar URLs for each member
  const [memberAvatars, setMemberAvatars] = useState({});

  // State to control the visibility of the add group member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // State for context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    memberId: null,
  });
  
  // Fetch user data
  const { userData, findUser, getAvatar } = useUser();

  // Fetch groups that the user is a member of
  const { groups, loading, error, fetchGroups, removeMember, trigger, refreshGroups, leaveGroup } = useGroupMember();

  // Fetch group details
  const { members: groupMembers, loading: membersLoading, error: membersError, getGroupmember, renameGroup } = useGroup();

  // Use friend hook
  const { friends, loading: friendsLoading, error: friendsError, fetchFriends } = useFriend();

  // Use expense hook
  const { createExpense, getExpenses, updateExpenseItemStatus, getExpenseById } = useExpense();

  // Use notification hook
  const { notificationTrigger } = useNotification();

  /// Websocket context to handle real-time updates
  const ws = useContext(WebSocketContext);
  
  // Show modal settle up
  const [showSettleModal, setShowSettleModal] = useState(false);

  // Show modal confirm settle up
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Menu Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Show modal delete group
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Rename group modal
  const [showRenameModal, setShowRenameModal] = useState(false); // State để hiển thị modal rename
  const [newGroupName, setNewGroupName] = useState("");

  // Leave group modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // NEW EXPENSE TAB:
  // State variable
  const [searchLoading, setLoading] = useState(false);
  const [ownSelf, setOwnSelf] = useState(null);
  const [paymentSelf, setPaymentSelf] = useState(0);          // So tien minh phai tra
  const [paidMemberInfo, setPaidMemberInfo] = useState(null); // Thong tin nguoi tra tien cho expense do

  // Handle all users add by "new expense"
  // For UI:
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showPaidMemberModal, setShowPaidMemberModal] = useState(false)
  const [expenseValid, setExpenseValid] = useState(true)
  const [eachDebt, setEachDebt] = useState(0)
  const [moneyRemainder, setMoneyRemainder] = useState(0)

  const [search, setSearch] = useState("");

  const [expenseUsers, setExpenseUsers] = useState([]);               // Showing search "users"
  const [groupExpenseMembers, setGroupExpenseMembers] = useState([]); // All group members with new attribute (flag) (dua nao flag = true la co trong expense )
  const [checkedEqually, setCheckedEqually] = useState(true);
  const [splitMode, setSplitMode] = useState("equally");
  const [prevSplitMode, setPrevSplitMode] = useState(null)

  // Handle variable of the "new expense"
  const [titleExpense, setTitleExpense] = useState("")              // Title
  const [moneyExpense, setMoneyExpense] = useState(0)               // Sum of Money
  const [descriptionExpense, setDescriptionExpense] = useState("")  // Description
  const [selectedDate, setSelectedDate] = useState(new Date())      // Expense's date
  const [selectedMember, setSelectedMember] = useState([])          // Member in expense
  const [paidMember, setPaidMember] = useState()                    // Member - who paid the expense

  // State for Expenses in a specific group
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null); // Currently selected expense for details
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // State for a specific expense item
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  
  // Destructuring object 'expense' từ danh sách expenses
  // - id: ID duy nhất của chi tiêu (số nguyên, auto increment)
  // - paidbyId: ID của người trả tiền (số nguyên, tham chiếu đến bảng users)
  // - groupId: ID của nhóm liên quan (số nguyên, tham chiếu đến bảng groups)
  // - title: Tiêu đề của chi tiêu (chuỗi, không được để trống)
  // - expDate: Ngày đến hạn của chi tiêu (định dạng DATE, ISO string)
  // - description: Mô tả chi tiêu (chuỗi, có thể để trống)
  // - amount: Tổng số tiền của chi tiêu (số thực, không được để trống)
  // - createdAt: Thời gian tạo chi tiêu (timestamp, tự động bởi Sequelize)
  // - updatedAt: Thời gian cập nhật gần nhất (timestamp, tự động bởi Sequelize)
  // - items: Mảng các mục chi tiết liên quan (bao gồm thông tin thành viên và số tiền chia sẻ) ---> có các biến con

    // Destructuring mảng 'items' (nếu cần xử lý chi tiết)
    // - id: ID duy nhất của mục chi tiết (số nguyên, auto increment) (đây là unique id của expense item trong db expenseItems)
    // - expenseId: ID của chi tiêu liên quan (số nguyên, tham chiếu đến expenses) (link với id của expense - dòng 1 ở trên)
    // - groupId: ID của nhóm liên quan (số nguyên, tham chiếu đến groups) 
    // - userId: ID của thành viên liên quan (số nguyên, tham chiếu đến users)
    // - shared_amount: Số tiền mà thành viên phải trả (số thực, không được để trống)
    // - is_paid: Trạng thái đã thanh toán (boolean, mặc định false)
    // - createdAt: Thời gian tạo mục chi tiết (timestamp, tự động bởi Sequelize)
    // - updatedAt: Thời gian cập nhật gần nhất (timestamp, tự động bởi Sequelize)


  const resetAllState = () => {
    setSearch("");
    setTitleExpense("");
    setDescriptionExpense("");
    setMoneyExpense(0);
    setEachDebt(0);
    setMoneyRemainder(0);
    setExpenseUsers([]);
    setSelectedMember([ownSelf]);
    resetAllFlags();
    setCheckedEqually(true);
    setShowExpenseModal(false);
    setExpenseValid(true);
    setPaidMember(ownSelf);
    setPrevSplitMode(null);
    setSelectedDate(new Date());
  }
  
  useEffect(() => {
    if (userData.id) {
      fetchFriends(userData.id);
    }
  }, [userData.id]);

  const toggleFlag = (id) => {
    setGroupExpenseMembers((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, flag: !item.flag } : item
      )
    );

    // Make change to members in search array
    if (expenseUsers.length > 0) {
      setExpenseUsers((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, flag: !item.flag } : item
        )
      );
    }
  };

  const resetAllFlags = () => {
    setGroupExpenseMembers(prevMembers =>
      prevMembers.map(member => ({ ...member, flag: member.id === ownSelf.id }))
    );
  };

  const handleChangeMoney = (e) => {
    // Remove all non-digit characters
    const raw = e.target.value.replace(/[^\d]/g, "");
    const number = parseInt(raw, 10);

    if (!isNaN(number)) {
      setMoneyExpense(number);
    } else {
      setMoneyExpense(0);
    }
  };

  const formatWithCommas = (value) => {
    return value.toLocaleString("en-US");
  };

  const preventInvalidKey = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];

    if (
      !/^\d$/.test(e.key) && // allow digits 0–9
      !allowedKeys.includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const preventPasteInvalid = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  };

  // Check if current user is the group owner
  const isOwner = userData.id === selectedGroup?.ownerId;

  // Hợp nhất useEffect
  useEffect(() => {
    if (userData) {
      const { id, username, email } = userData;
      const trimmed = { id, username, email };
      setOwnSelf(trimmed);
      setSelectedMember([trimmed]);
      setPaidMember(trimmed);
    }
  }, [userData]);

  useEffect(() => {
    if (prevSplitMode === splitMode) return;
    if (prevSplitMode === "%" || splitMode === "%") {
      const selected = selectedMember.map(member => ({
        ...member,
        percent: 0,
        percentRaw: "",
        debt: 0,
      }));

      setSelectedMember(selected);
    }
  }, [splitMode])

  useEffect(() => {
    if (activeTab === 'group') {
      fetchGroups(userData.id);
      if (selectedGroup && activeTab === 'group') {
        const fetchGroupData = async () => {
          getGroupmember(selectedGroup.id);
          const expenses = await getExpenses(selectedGroup.id);
          if (expenses) {
            setExpenses(expenses);
          }
        };
        fetchGroupData();
      }
    }
  }, [userData.id, selectedGroup, activeTab, trigger, notificationTrigger]);

  
  // ✅ Clear selectedGroup if it no longer exists (e.g., user was kicked)
  useEffect(() => {
    if (selectedGroup && groups.length > 0) {
      const exists = groups.some(group => group.id === selectedGroup.id);
      if (!exists) {
        setSelectedGroup(null);
      }
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (selectedMember.length === 0) {
      return;
    }

    if (splitMode === "equally") {
      const amountPerPerson = Math.floor(moneyExpense / selectedMember.length);
      const remainder = moneyExpense % selectedMember.length;

      setEachDebt(amountPerPerson);

      const updated = selectedMember.map((member, index) => ({
        ...member,
        debt: amountPerPerson + (index < remainder ? 1 : 0),
      }));

      // Only update if values actually changed
      const hasChanged = updated.some((u, i) => u.debt !== selectedMember[i].debt);
      if (hasChanged) {
        setSelectedMember(updated);
      }
    }
    else if (splitMode === "%") {
      const updated = selectedMember.map((member) => ({
        ...member,
        debt: Math.round(((member.percent / 100) * moneyExpense)),
      }));

      // Only update if values actually changed
      const hasChanged = updated.some((u, i) => u.debt !== selectedMember[i].debt);
      if (hasChanged) {
        setSelectedMember(updated);
      }
    }
  }, [selectedMember.length, moneyExpense, splitMode])

  useEffect(() => {
    if (selectedMember.length === 0) {
      setExpenseValid(true);
      return;
    }

    if (splitMode === "equally") {
      setExpenseValid(true);
    }
    else if (splitMode === "%") {
      const totalPercent = selectedMember.reduce((sum, member) => {
        return sum + (member.percent || 0);
      }, 0);

      setMoneyRemainder(Number(totalPercent) - 100);

      if (Number(totalPercent) === 100) {
        setExpenseValid(true)
      }
      else {
        setExpenseValid(false)
      }
    }
    else {
      const totalSum = selectedMember.reduce((sum, member) => {
        return sum + (member.debt || 0);
      }, 0);

      setMoneyRemainder(Number(totalSum) - moneyExpense);

      if (totalSum === moneyExpense) {
        setExpenseValid(true)
      }
      else {
        setExpenseValid(false)
      }
    }
  }, [selectedMember, moneyExpense, splitMode])

  useEffect(() => {
    const selected = groupExpenseMembers
      .filter(member => member.flag === true)
      .map(({ flag, ...rest }) => ({
        ...rest,
        percent: 0,
        percentRaw: "",
        debt: 0, // or any other default value
      }));
    setSelectedMember(selected);
  }, [groupExpenseMembers]);

  useEffect(() => {
    const membersWithFlags = groupMembers.map(member => ({
      ...member,
      flag: member.id === ownSelf.id
    }));

    setGroupExpenseMembers(membersWithFlags)
  }, [groupMembers])

  // Fetch avatars for group members
  useEffect(() => {
    let isMounted = true;

    const fetchMemberAvatars = async () => {
      if (groupMembers.length > 0 && activeTab === "group") {
        const avatarPromises = groupMembers.map(async (member) => {
          try {
            const avatarUrl = await getAvatar(member.id);
            return { memberId: member.id, avatarUrl };
          } catch (error) {
            return { memberId: member.id, avatarUrl: null };
          }
        });

        const avatars = await Promise.all(avatarPromises);
        if (isMounted) {
          const newAvatars = avatars.reduce((acc, { memberId, avatarUrl }) => {
            acc[memberId] = avatarUrl;
            return acc;
          }, {});
          setMemberAvatars(newAvatars);
        }
      } else {
        if (isMounted) setMemberAvatars({});
      }
    };

    fetchMemberAvatars();

    return () => {
      isMounted = false;
    };
  }, [groupMembers, activeTab, getAvatar]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showAddMemberModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddMemberModal]);


  useEffect(() => {
    if (selectedExpense === null) {
      return;
    } 

    setPaymentSelf(selectedExpense.items.find(
                                                (item) =>
                                                    item.userId === ownSelf.id &&
                                                    ownSelf.id !== selectedExpense.paidbyId
                                              )?.shared_amount ?? 0);
    async function fetchData() {
      const paidMember = groupMembers.find(m => m.id === selectedExpense.paidbyId);
      if (paidMember !== null) {
        const temp = await findUser(paidMember.username)
        setPaidMemberInfo(temp);
      }
    }

    fetchData();
  }, [selectedExpense, refreshTrigger]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showExpenseModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showExpenseModal]);


  // Menu Settings click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettingsModal && !e.target.closest('.settings-modal')) {
        setShowSettingsModal(false);
      }
    };
    if (showSettingsModal) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showSettingsModal]);  // Handle adding a member to the group


  const handleAddMember = async (friendId) => {
    if (!selectedGroup || !isOwner) {
      toast.error("You are not authorized to add members.");
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("There is a problem. Please refresh the page.");
      return;
    }

    try {
      const message = {
        type: "ADD_GROUP_MEMBER",
        payload: {
          senderId: userData.id,
          groupId: selectedGroup.id,
          memberId: friendId,
          groupName: selectedGroup.name,
        },
      };
      ws.send(JSON.stringify(message));

      setShowAddMemberModal(false);
      toast.success("Member add request has been sent!");
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
      toast.error("Failed to add member. Please try again.");
    }
  };

  // Handle search user in "new expense"
  const handleExpenseUserSearch = () => {
    setLoading(true); // Hiển thị trạng thái loading
    setTimeout(() => {
      try {
        // Lọc trong groupExpenseMembers dựa trên search
        const filtered = groupExpenseMembers.filter((member) => {
          const isSelf = member.username === userData.username;
          const isAlreadySelected = selectedMember.some((m) => m.id === member.id);
          return (
            member.username.toLowerCase().includes(search.toLowerCase()) &&
            !isSelf &&
            !isAlreadySelected
          );
        });

        if (filtered.length > 0) {
          setExpenseUsers(filtered); // Hiển thị danh sách thành viên khớp với tìm kiếm
        } else {
          setExpenseUsers([]);
          if (groupExpenseMembers.some((m) => m.username.toLowerCase() === search.toLowerCase())) {
            toast.info("This user is already added to the expense!");
          } else if (search.toLowerCase() === userData.username.toLowerCase()) {
            toast.info("You cannot add yourself to the expense!");
          } else {
            toast.info("No matching members found in the group!");
          }
        }
      } catch (error) {
        console.error('Error filtering members:', error);
        setExpenseUsers([]); // Reset nếu có lỗi
      } finally {
        setLoading(false); // Tắt trạng thái loading
      }
    }, 500)
  };

  // Handle accept action in "new expense"
  const handleAddExpense = async () => {
    try {
      const expense = await createExpense({
        title: titleExpense,
        expDate: selectedDate,
        description: descriptionExpense,
        amount: moneyExpense,
        paidbyId: paidMember.id,
        groupId: selectedGroup.id,
        members: selectedMember.map(member => ({
          userId: member.id,
          shared_amount: member.debt || 0,
        })),
      });

      // WebSocket service
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "CREATE_EXPENSE",
            payload: {
              expenseId: expense.id, // Giả sử createExpense trả về expense với id
              groupId: selectedGroup.id,
              paidbyId: paidMember.id,
              createdbyId: userData.id,
              members: selectedMember.map(member => ({
                userId: member.id,
                shared_amount: member.debt || 0,
              })),
              amount: moneyExpense,
              title: titleExpense,
            },
          })
        );
      } else {
        console.warn('WebSocket is not open. Update may not be sent in real-time.');
      }

      toast.success('Expense added successfully!');
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    }
  };

  // Handle kick member
  const handleKickMember = async () => {
    if (!contextMenu.memberId || !isOwner) {
      toast.error("You are not authorized to kick members.");
      return;
    }

    // API here
    await removeMember(selectedGroup.id, contextMenu.memberId);

    // Tìm username của member bị kick từ groupMembers
    const memberToKick = groupMembers.find(member => member.id === contextMenu.memberId);
    const memberUsername = memberToKick ? memberToKick.username : "Unknown User";

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("There is a problem. Please refresh the page.");
      setContextMenu({ ...contextMenu, visible: false }); // Ẩn menu sau khi kick
      return;
    }

    try {
      const message = {
        type: "KICK_GROUP_MEMBER",
        payload: {
          ownerId: userData.id,
          groupId: selectedGroup.id,
          memberId: contextMenu.memberId,
          groupName: selectedGroup.name,
        },
      };
      ws.send(JSON.stringify(message));

      
    } catch (error) {
      console.error("Failed to send to server:", error);
      toast.error("Failed to send to server. Please try again.");
    }


    await getGroupmember(selectedGroup.id); // Làm mới danh sách thành viên

    
    setContextMenu({ ...contextMenu, visible: false }); // Ẩn menu sau khi kick
    toast.info(`Member ${memberUsername} has been kicked!`);
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: "DELETE_GROUP",
        payload: {
          groupId: selectedGroup.id,
          ownerId: userData.id,
          groupName: selectedGroup.name,
        },
      };
      ws.send(JSON.stringify(message));

      setSelectedGroup(null);
    }
    else {
      toast.error("Failed to delete group. Please try again.");
    }
  };

  // Handle Rename group
  const handleRenameGroup = async () => {
    if (!selectedGroup || !newGroupName.trim()) {
      toast.error("Group name cannot be empty.");
      return;
    }

    const oldName = selectedGroup.name; // Lưu tên cũ để gửi qua WebSocket
    const success = await renameGroup(selectedGroup.id, newGroupName.trim());
    if (success) {
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
          type: "RENAME_GROUP",
          payload: {
            groupId: selectedGroup.id,
            newName: newGroupName.trim(),
            oldName: oldName,
            ownerId: userData.id
          },
        };
        ws.send(JSON.stringify(message));
      }
      
      toast.success("Group renamed successfully!");
      setSelectedGroup(prev => ({ ...prev, name: newGroupName.trim() }));
      setNewGroupName(""); // Reset input field 
    } else {
      toast.error("Failed to rename group. Please try again.");
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (!selectedGroup || !userData.id) return;

    const groupId = selectedGroup.id;
    const groupName = selectedGroup.name;

    const success = await leaveGroup(selectedGroup.id, userData.id);

    if (success) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
          type: "LEAVE_GROUP",
          payload: {
            groupId: groupId,
            memberId: userData.id,
            groupName: groupName
          },
        };
        ws.send(JSON.stringify(message));
      }


      toast.info("You have left the group.");
      setSelectedGroup(null);
    } else {
      toast.error("Failed to leave group. Please try again.");
    }
  };

  // Handle Settle up
  const handleSettleUp = async () => {
    if (!selectedGroup || !selectedExpense) {
      toast.error("Please select a group and an expense to settle up.");
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("There is a problem. Please refresh the page.");
      return;
    }

    try {
      await updateExpenseItemStatus({
        expenseId: selectedExpense.id,
        itemId: selectedItem.id,
        userId: ownSelf.id,
        status: 'pending',
      });
      const updatedExpense = await getExpenseById(selectedExpense.id);
      setSelectedExpense(updatedExpense);

      // Update Expenses state
      setExpenses((prev) => {
        return prev.map((exp) =>
          exp.id === selectedExpense.id ? updatedExpense : exp
        );
      });

      const message = {
        type: "SETTLE_UP",
        payload: {
          expenseId: selectedExpense.id,
          groupId: selectedGroup.id,
          userId: userData.id,
          paidbyId: selectedExpense.paidbyId,
        },
      };

      ws.send(JSON.stringify(message));
      
      setSelectedItem(null);
      setShowSettleModal(false);
      setRefreshTrigger((prev) => prev + 1); // Kích hoạt lại useEffect
      toast.success('Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update payment status. Please try again.');
    }
  };
    

  // Handle confirm settle up
  const handleConfirmSettleUp = async (status) => {
    if (!selectedGroup || !selectedExpense || !selectedItem) {
      toast.error("Please select a group, expense, and item to settle up.");
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("There is a problem. Please refresh the page.");
      return;
    }

    try {
      if (selectedItem && ownSelf.id === selectedExpense.paidbyId) {
        await updateExpenseItemStatus({
          expenseId: selectedExpense.id,
          itemId: selectedItem.id,
          userId: selectedItem.userId,
          status, 
        });
        const updatedExpense = await getExpenseById(selectedExpense.id);
        setSelectedExpense(updatedExpense);
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === selectedExpense.id ? updatedExpense : exp
          )
        );

        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = {
            type: "UPDATE_EXPENSE_ITEM_STATUS",
            payload: {
              expenseId: selectedExpense.id,
              groupId: selectedGroup.id,
              itemId: selectedItem.id,
              userId: selectedItem.userId,
              paidId: selectedExpense.paidbyId,
              status,
            },
          };
          ws.send(JSON.stringify(message));
        }

        setShowConfirmModal(false);
        setRefreshTrigger((prev) => prev + 1);
      }
    }
    catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update payment status. Please try again.');
    }

    if (status === 'yes'){
      toast.success('Payment status updated to "Paid" successfully!');
    }
    else if (status === 'no') {
      toast.success('Payment status updated to "Not Paid" successfully!');
    }

  }

  

  // Handle context menu click
  const handleContextMenu = (e, memberId) => {
    e.preventDefault();
    if (!isOwner || memberId === userData.id) {
      setContextMenu({ ...contextMenu, visible: false }); // Đảm bảo tắt menu nếu không hợp lệ
      return;
    }

    const menuWidth = 140;
    const menuHeight = 40;
    let x = e.clientX;
    let y = e.clientY;
    const padding = 8;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - padding;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - padding;

    setContextMenu({
      visible: true,
      x,
      y,
      memberId,
    });
  };

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && !e.target.closest('.context-menu')) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    if (contextMenu.visible) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.visible]);

  return (
  <div className="page-container">
    {/* Header */}
    <div className="page-header">
      <Head_bar />
    </div>

    {/* Main Content */}
    <div className="page-main-content">
      {/* Left Sidebar */}
      <div className="page-left-sidebar"> 
        <Left_bar activeTab={activeTab} setActiveTab={setActiveTab} onGroupSelect={setSelectedGroup} />
      </div>

      {/* Center Content Area */}
      <div className="page-center-content">
        {!selectedGroup && (
          <div className="mt-6">
            <div className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-blue-900 text-[25px] flex justify-between items-center w-full mb-4">
              Please join or select a group to get started.
            </div>
            <div className="[font-family:'Roboto_Condensed',Helvetica] text-gray-900 text-[22px] flex items-center w-full mb-4">
              No groups yet? Click {" "}
              <span className="w-10 h-10 rounded-full bg-[#cccccc]/50 flex items-center justify-center text-[#5a96f0] mx-1">
                <PlusIcon className="w-5 h-5" />
              </span>{" "}
              button to create your first group!
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 1 }}
          animate={{ opacity: isReloading ? 0.3 : 1 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'group' && selectedGroup && (
            <div className="mt-4">
              <div className="flex justify-between items-center w-full mb-4">
                <h2 className="[font-family:'Roboto',Helvetica] text-3xl font-bold text-[#193865]">
                  {selectedGroup.name}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    className="h-[50px] bg-[#ed5050] hover:bg-[#ed5050]/90 rounded-[10px] [font-family:'Roboto_Condensed',Helvetica] text-white text-2xl"
                    onClick={() => {
                      setShowExpenseModal(true);
                      setSelectedDate(new Date());
                    }}
                  >
                    New expense
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[50px] text-gray-600 hover:text-gray-800"
                    onClick={async () => {
                      setIsReloading(true);
                      try {
                        const expenses = await getExpenses(selectedGroup.id);
                        if (expenses) {
                          setExpenses(expenses);
                          toast.success('Expenses refreshed successfully!');
                        }
                      } catch (error) {
                        console.error('Error refreshing expenses:', error);
                        toast.error('Failed to refresh expenses. Please try again.');
                      } finally {
                        setIsReloading(false);
                      }
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isReloading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isReloading ? Infinity : 0, ease: "linear" }}
                    >
                      <RefreshCwIcon className="w-6 h-6" />
                    </motion.div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent w-9 h-[50px] text-gray-600 hover:text-gray-800"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const mouseX = e.clientX;
                      const mouseY = e.clientY;
                      setContextMenuPosition({
                        x: mouseX,
                        y: mouseY,
                      });
                      setShowSettingsModal(true);
                    }}
                  >
                    <SettingsIcon className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow" style={{ maxHeight: "600px" }}>
                {expenses.length > 0 && (
                  <div className="mt-4">
                    {[...expenses].reverse().map((expense) => {
                      const paidByUser = groupMembers.find(member => member.id === expense.paidbyId);
                      return (
                        <div
                          key={expense.id}
                          className="p-2 mb-2 rounded-[20px] bg-white hover:bg-gray-100 border border-gray-300 cursor-pointer text-[#13183c] [font-family:'Roboto_Condensed',Helvetica] text-lg"
                          onClick={(e) => {
                            setSelectedExpense(expense);
                            setMousePosition({ x: e.clientX + 10, y: e.clientY + 10 });
                          }}
                        >
                          <p><span className="font-semibold">Title:</span> {expense.title}</p>
                          <p><span className="font-semibold">Amount:</span> {formatWithCommas(expense.amount)} ₫</p>
                          <p><span className="font-semibold">Paid by:</span> {paidByUser ? paidByUser.username : 'Unknown'}</p>
                          <p><span className="font-semibold">Due Date:</span> {new Date(expense.expDate).toLocaleDateString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {selectedExpense && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className="fixed bg-white p-4 rounded-[15px] shadow-xl min-w-[290px] z-50 text-gray-900 [font-family:'Roboto_Condensed',Helvetica]"
                    style={{
                      top: mousePosition.y > window.innerHeight / 2 ? undefined : mousePosition.y,
                      bottom: mousePosition.y > window.innerHeight / 2 ? window.innerHeight - mousePosition.y - 5 : undefined,
                      left: mousePosition.x - 6,
                      transform: "translate(0, 0)",
                    }}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSelectedExpense(null)}
                    >
                      ✕
                    </button>
                    <p className="font-semibold text-gray">Description:</p>
                    <textarea className="w-[275px] min-h-[50px] max-h-[100px] resize-none pointer-events-none focus:outline-none border-none bg-transparent">{selectedExpense.description || 'no description'}</textarea>
                    <p className="font-semibold text-black mt-2">Members:</p>
                    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow" style={{ maxHeight: "100px" }}>
                      {selectedExpense.items
                        .slice()
                        .sort((a, b) => (a.userId === ownSelf.id ? -1 : b.userId === ownSelf.id ? 1 : 0))
                        .map((item) => {
                          const member = groupMembers.find((m) => m.id === item.userId);
                          return (
                            <p key={item.id}>
                              {member ? member.username : 'Unknown'}: {`${formatWithCommas(item.shared_amount)} ₫`}
                              {ownSelf.id === selectedExpense.paidbyId ? (
                                item.userId !== ownSelf.id && (
                                  <>
                                    {item.is_paid === 'no' && (
                                      <span className="ml-4 text-yellow-500">Not Paid</span>
                                    )}
                                    {item.is_paid === 'yes' && (
                                      <span className="ml-4 text-green-500">Paid</span>
                                    )}
                                    {item.is_paid === 'pending' && (
                                      <Button
                                        className="bg-orange-500 text-white hover:bg-orange-600 rounded-[15px] ml-4 h-[22px] text-[14px]"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setShowConfirmModal(true);
                                        }}
                                      >
                                        Pending
                                      </Button>
                                    )}
                                  </>
                                )
                              ) : (
                                item.userId === ownSelf.id ? (
                                  <>
                                    {item.is_paid === 'no' && (
                                      <Button
                                        className="bg-blue-500 text-white hover:bg-blue-700 rounded-[15px] ml-4 h-[22px] text-[14px]"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setShowSettleModal(true);
                                        }}
                                      >
                                        Settle up
                                      </Button>
                                    )}
                                    {item.is_paid === 'yes' && (
                                      <span className="ml-4 text-teal-400">Settled</span>
                                    )}
                                    {item.is_paid === 'pending' && (
                                      <span className="ml-4 text-gray-500">Pending</span>
                                    )}
                                  </>
                                ) : null
                              )}
                            </p>
                          );
                        })}
                    </div>
                    <p className="mt-3"><span className="font-semibold text-gray">Paid by:</span> {groupMembers.find(m => m.id === selectedExpense.paidbyId)?.username || 'Unknown'}</p>
                    <p><span className="font-semibold text-gray">Due Date:</span> {new Date(selectedExpense.expDate).toLocaleDateString()}</p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Sidebar - Only show when group is selected */}
      {activeTab === 'group' && selectedGroup && (
        <div className="page-right-sidebar">
          <div className="bg-[#cccccc]/30 rounded-[15px] h-[38px] flex items-center justify-between px-3.5">
            <span className="[font-family:'Roboto',Helvetica] text-[#666666] text-sm sm:text-base md:text-lg lg:text-xl">
              Members
            </span>
            {isOwner && (
              <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowAddMemberModal(true)}>
                <PlusIcon className="w-6 h-6" />
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-6">
            {membersLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : membersError ? (
              <p className="text-center text-red-500">Error: {membersError}</p>
            ) : groupMembers.length > 0 ? (
              groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center relative group"
                  onContextMenu={(e) => handleContextMenu(e, member.id)}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] z-10"></div>
                  <div className="relative flex items-center z-20 px-1 py-1">
                    <Avatar className="w-[53px] h-[53px] bg-[#d9d9d9]">
                      {memberAvatars[member.id] ? (
                        <img
                          src={memberAvatars[member.id]}
                          alt={member.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback>
                          {member.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="ml-2 [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-lg">
                    {member.username}
                  </div>
                  {member.id === selectedGroup?.ownerId && (
                    <CrownIcon className="w-5 h-5 text-yellow-500 ml-2" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No members found.</p>
            )}
          </div>
        </div>
      )}

      {/* {!selectedGroup && (
        <div className="w-[269px] border-l-4 border-[#4A73A8]"/>
      )} */}
    </div>

    {/* All existing modals remain the same... */}
    
    {/* Context Menu for Kick Member */}
    {contextMenu.visible && isOwner && (
      <div
        className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 px-4 context-menu"
        style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 120, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
      >
        <button
          className="w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
          onClick={handleKickMember}
        >
          Kick Member
        </button>
      </div>
    )}

    {/* Keep all your existing modals here unchanged */}
    {/* Settle up Modal, Confirm Modal, Add Member Modal, Expense Modal, Settings Modal, etc. */}
    {/* Settle up Modal */}
    <AnimatePresence>
      {showSettleModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
      >
        <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[600px] h-[350px] flex flex-col text-gray-900">
          <h2 className="text-xl font-bold mb-2">Settle Up Payment</h2>
          <p>You owe: {formatWithCommas(paymentSelf)} ₫</p>
          <div className="mt-4 p-3 border rounded-[15px] bg-gray-50 text-">
            <p>Name: {paidMemberInfo?.username || 'Unknown'}</p>
            <p>Account Name: {paidMemberInfo?.bankAccountName || 'null'}</p>
            <p>Account Number: {paidMemberInfo?.bankAccountNumber || 'null'}</p>
            <p>Bank Name: {paidMemberInfo?.bankName || 'null'}</p>
          </div>
          <div className="mt-auto pt-2 space-x-8">
            <Button
              className="bg-blue-500 text-white px-4 py-2 w-[125px] rounded-full hover:bg-blue-600 transition-colors"
              onClick={async () => {
                await handleSettleUp();
              }}
            >
              Confirm
            </Button>
            <Button
              className="bg-gray-300 text-black px-4 py-2 w-[125px] rounded-full hover:bg-gray-400 transition-colors"
              onClick={() => setShowSettleModal(false)}
            >
              Cancel
            </Button>
          </div>  
        </div>
      </motion.div>
      )}
    </AnimatePresence>


    {/* Confirm Modal */}
    <AnimatePresence>
      {showConfirmModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1000]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] flex flex-col text-gray-900">
            <h2 className="text-xl font-bold mb-4">Confirm Payment Status</h2>
            <p>Has {groupMembers.find(m => m.id === selectedItem.userId)?.username || 'Unknown'} paid their share?</p>
            <div className="mt-6 space-x-4">
              <Button
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                onClick={async () => {
                  await handleConfirmSettleUp('yes');
                }}
              >
                Yes
              </Button>
              <Button
                className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors"
                onClick={async () => {
                  await handleConfirmSettleUp('no');
                }}
              >
                No
              </Button>
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showAddMemberModal && activeTab === "group" && selectedGroup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[700px] h-[500px] flex flex-col">
            <h2 className="text-xl font-bold mb-2">Add a Friend</h2>
            {/* Display friend list from useFriend */}
            <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow" style={{ maxHeight: "350px" }}>
              {friendsLoading ? (
                <p className="text-gray-500">Loading friends...</p>
              ) : friendsError ? (
                <p className="text-red-500">Error: {friendsError}</p>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                  >
                    <span>{friend.username}</span>
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                      onClick={() => handleAddMember(friend.id)}
                      disabled={groupMembers.some((member) => member.id === friend.id)} // Disable if already a member
                    >
                      + Member
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No friends available.</p>
              )}
            </div>
            <div className="mt-auto pt-2">
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={() => setShowAddMemberModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/*Add Expense Tab*/}
    <AnimatePresence>
      {showExpenseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] h-[500px] -translate-x-5 flex flex-col">
            <h2 className="text-xl font-bold mb-2">Split settings</h2>
            {/* Manual buttons */}
            <div className="flex gap-2">
              <Button
                className={`w-1/3 mx-auto py-2 rounded-full ${
                  !checkedEqually
                    ? (splitMode === "d"
                        ? 'hover:bg-blue-600 bg-blue-500 text-white'      // when dong is selected
                        : 'hover:bg-gray-300 bg-gray-100 text-gray-700')  // when % is selected
                    : 'hover:bg-gray-500 bg-gray-400 text-gray-100'       // when split equally is on
                }`}
                onClick={() => {
                  setCheckedEqually(false);
                  const prevSplit = splitMode;
                  setPrevSplitMode(prevSplit);
                  setSplitMode("d");
                }}
              >
                ₫
              </Button>
              <Button
                className={`[font-family:'Roboto_Condensed',Helvetica] w-1/3 mx-auto py-2 rounded-full ${
                  !checkedEqually
                    ? (splitMode === "%"
                        ? 'hover:bg-blue-600 bg-blue-500 text-white'      // when % is selected
                        : 'hover:bg-gray-300 bg-gray-100 text-gray-700')  // when dong is selected
                    : 'hover:bg-gray-500 bg-gray-400 text-gray-100'       // when split equally is on
                }`}
                onClick={() => {
                  setCheckedEqually(false);
                  const prevSplit = splitMode;
                  setPrevSplitMode(prevSplit);
                  setSplitMode("%");
                }}
              >
                %
              </Button>
              {/* Checkbox for auto split */}
              <label className="flex items-center gap-2">
                <span className="[font-family:'Roboto_Condensed',Helvetica] text-base">Split equally</span>
                <input
                  type="checkbox"
                  checked={checkedEqually}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setCheckedEqually(isChecked);
                    const prevSplit = splitMode;
                    setPrevSplitMode(prevSplit);
                    setSplitMode(isChecked ? "equally" : "d");
                  }}
                  className="accent-blue-500 w-4 h-4 rounded focus:ring-0"
                />
              </label>
            </div>
            <div className="pt-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow"
                  style={{ maxHeight: "320px" }}>
              {selectedMember.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
              >
                <span>{member.username}</span>
                <div className="flex items-center gap-1">
                  {splitMode === "%" && <input
                    size="sm"
                    value={member.percentRaw ?? member.percent?.toString() ?? ""}
                    className="text-black [font-family:'Roboto_Condensed',Helvetica] text-sm px-3 py-1 w-[48px] text-right rounded-[20px]"
                    onChange={(e) => {
                      if (splitMode !== "equally") {
                        const value = e.target.value;

                        // Allow empty input
                        if (value === "") {
                          setSelectedMember((prev) =>
                            prev.map((m) =>
                              m.id === member.id
                                ? { ...m, percentRaw: "", percent: 0, debt: 0 }
                                : m
                            )
                          );
                          return;
                        }
                        const regex = /^\d*(\.\d?)?$/;

                        if (regex.test(value)) {
                          // Valid input, update raw string
                          const newPercent = parseFloat(value);
                          if (newPercent >= 0 && newPercent <= 100 && !isNaN(newPercent)) {
                            setSelectedMember((prev) =>
                              prev.map((m) =>
                                m.id === member.id
                                  ? {
                                      ...m,
                                      percentRaw: value,
                                      percent: newPercent,
                                      debt: Math.round(((newPercent / 100) * moneyExpense)),
                                    }
                                  : m
                              )
                            );
                          }
                        }
                      }
                    }}
                  />}
                  {splitMode === "%" && <span className="[font-family:'Roboto_Condensed',Helvetica] text-sm">%</span>}
                  <input
                    size="sm"
                    value={member.debt}
                    className="text-black [font-family:'Roboto_Condensed',Helvetica] text-sm px-3 py-1 w-[105px] text-right rounded-[20px]"
                    disabled={splitMode !== "d"}
                    onChange={(e) => {
                      const newDebt = parseFloat(e.target.value) || 0;
                      setSelectedMember((prev) =>
                        prev.map((m) =>
                          m.id === member.id ? { ...m, debt: newDebt } : m
                        )
                      );
                    }}
                  />
                  <span className="[font-family:'Roboto_Condensed',Helvetica] text-sm">₫</span>
                </div>
              </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[600px] h-[530px] gap-4 flex flex-col">
            <h2 className="big-header">Add a new Expense</h2>
            <div className="flex items-center gap-4">
              <div className="flex flex-col w-full">
                <input
                  onChange={(e) => setTitleExpense(e.target.value)}
                  type="text"
                  value={titleExpense}
                  placeholder="Enter a title"
                  className="border-b border-gray-300 focus:outline-none text-center [font-family:'Roboto_Condensed',Helvetica] font-bold mb-2 text-lg"
                />
                <div className="flex items-center justify-center text-lg font-medium border-b border-dotted border-gray-400 pb-1">
                  <input
                    onPaste={preventPasteInvalid}
                    onKeyDown={preventInvalidKey}
                    onChange={handleChangeMoney}
                    type="text"
                    value={formatWithCommas(moneyExpense)}
                    placeholder="0"
                    className="text-center w-[120px] focus:outline-none"
                  />
                  <span className="ml-1">đ</span>
                </div>
                <textarea 
                      onChange={(e) => setDescriptionExpense(e.target.value)}
                      value={descriptionExpense}
                      placeholder={"Enter description of the expense"}
                      className="resize-none w-[554px] h-[92px] p-2 focus:border-0 focus:outline-none
                              [font-family:'Roboto_Condensed',Helvetica] font-normal text-[#242323] text-base">
                </textarea>
              </div>
            </div>

            {/* Paid by and split */}
            <div className="flex flex-wrap justify-center	text-sm text-gray-700 gap-x-1">
              Paid by <span onClick={() => setShowPaidMemberModal(!showAddMemberModal)} className="inline-block bg-gray-200 hover:bg-gray-300 px-2 text-sm rounded-full min-w-[50px] min-h-[10px]">{paidMember?.username || "null"}</span>
              and splited by
              <div className="relative inline-block">
                <span className="inline-block bg-gray-200 px-2 text-sm rounded-full min-w-[25px] min-h-[10px]">{selectedMember.length}</span>
                {showPaidMemberModal && (
                  <div className="absolute bottom-full left-1/2 translate-x-[-50%] mb-2 bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] h-[350px] gap-4 flex flex-col z-10">
                    <h2 className="text-xl font-bold mb-2">Select a paid Member</h2>
                    {/* Display friend list from useFriend */}
                    <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow" style={{ maxHeight: "350px" }}>
                      {selectedMember.length > 0 ? (
                        selectedMember.map((member) => (
                          <div
                            key={member.id}
                            className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                          >
                            <span>{member.username}</span>
                            <Button
                              size="sm"
                              className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"
                              onClick={() => {
                                setShowPaidMemberModal(false);
                                setPaidMember(member);
                              }}
                              disabled={paidMember?.id === member.id} // Disable if already a member
                            >
                              + Set
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No selected member.</p>
                      )}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button
                        className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                        onClick={() => setShowPaidMemberModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              due <span onClick={() => setShowDateModal(true)} className="inline-block bg-gray-200 hover:bg-gray-300 px-2 text-sm rounded-full min-w-[25px] min-h-[10px]">{selectedDate.toLocaleDateString()}</span>
              <div className="text-xs text-gray-500 mt-1 w-full">{splitMode === "equally" ? `(${formatWithCommas(eachDebt)} đ / person)` : "Custom by user"}</div>
            </div>

            {/* Buttons */}
            <div className="relative inline-block">
              <Button onClick={() => setShowDateModal(true)} className="w-1/3 mx-auto bg-gray-200 hover:bg-gray-300 pt-2 rounded-full">
                Calendar
              </Button>
              {showDateModal && (
                <div className="absolute bottom-full left-1/2 ml-8 mb-8">
                    <CalendarPopup
                      value={selectedDate}
                      onChange={setSelectedDate}
                      open={showDateModal}
                      onClose={() => setShowDateModal(false)}
                      minDate ={new Date()}
                    />
                </div>)}
            </div>
            <div className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-red-500 min-h-[18px] text-[12px]">
              {moneyExpense === 0 
              ? (titleExpense.trim() === "" 
                ? "Total bill has not been entered, title cannot be empty!" 
                : "Total bill has not been entered!")
              : (titleExpense.trim() === "" 
                ? "Title cannot be empty!" 
                : (!expenseValid 
                ? 
                `${splitMode === "%"
                  ? `Percentages don't add up correctly, ${
                      moneyRemainder < 0
                        ? `missing ${(Math.abs(moneyRemainder)).toFixed(1)} %`
                        : `excess ${(Math.abs(moneyRemainder)).toFixed(1)} %`
                    }`
                  : `Amounts don't add up correctly, ${
                      moneyRemainder < 0
                        ? `missing ${(Math.abs(moneyRemainder))} ₫`
                        : `excess ${(Math.abs(moneyRemainder))} ₫`
                    }`}` 
                : "")
                )
              }
            </div>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 pb-2 rounded-full transition-colors"
              onClick={() => { 
                handleAddExpense();
                resetAllState();
              }}
              disabled={!expenseValid || titleExpense.trim() === "" || moneyExpense === 0} // expenseValid - False -> Disable, True -> Through
            >
              Create
            </Button>
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-full transition-colors"
              onClick={() => resetAllState()}>
              Cancel
            </Button>
          </div>
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] h-[500px] translate-x-5 flex flex-col">
            <h2 className="text-xl font-bold mb-2">Add expense with Friend(s)</h2>
            <input
              type="text"
              placeholder="Enter friend's name"
              className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExpenseUserSearch();
                }
              }}
            />
            <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2 flex-grow"
                  style={{ maxHeight: "320px" }}>
              {search === "" && (groupExpenseMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                >
                  
                  <span>{member.username}</span>
                  <Button
                    size="sm"
                    className={member.flag ? "bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm rounded-[20px]" : 
                                              "bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"}
                    onClick={() => toggleFlag(member.id)}
                    disabled={member.id === paidMember.id}
                    >
                    {member.flag ? "Remove" : "Add"}
                  </Button>
                </div>
              )))}
              {search !== "" && expenseUsers.length === 0 && (
                <p className="text-gray-500">No matching users</p>
              )}
              {search !== "" && (expenseUsers.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center px-2 py-1 border rounded-[20px]"
                >
                  <span>{member.username}</span>
                  <Button
                    size="sm"
                    className={member.flag ? "bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm rounded-[20px]" : 
                                              "bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 text-sm rounded-[20px]"}
                    onClick={() => toggleFlag(member.id)}
                    disabled={member.id === paidMember.id}
                    >
                    {member.flag ? "Remove" : "Add"}
                  </Button>
                </div>
              )))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>


    {/* Settings Modal */}
    <AnimatePresence>
      {showSettingsModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 px-4 z-[2000] settings-modal"
          style={{
            top: contextMenuPosition.y > window.innerHeight / 2 ? 'auto' : `${contextMenuPosition.y}px`,
            bottom: contextMenuPosition.y > window.innerHeight / 2 ? `${window.innerHeight - contextMenuPosition.y}px` : 'auto',
            left: `${Math.min(contextMenuPosition.x, window.innerWidth - 150)}px`, // Giới hạn rìa phải
            minWidth: '120px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
        
          {isOwner ? (
            <>
              <button
                className="w-full text-left text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
                onClick={() => {
                  setShowSettingsModal(false);
                  setNewGroupName(selectedGroup.name); // Default value
                  setShowRenameModal(true); // Hiển thị modal rename
                }}
              >
                Rename Group
              </button>
              <button
                className="w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowDeleteModal(true);
                }}
              >
                Delete Group
              </button>
            </>
          ) : (
            <button
              className="w-full text-left text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 px-2 py-1 rounded font-semibold transition-colors duration-150"
              onClick={() => {
                setShowSettingsModal(false); // Đóng modal Settings
                setShowLeaveModal(true); // Mở modal Leave
              }}
            >
              Leave Group
            </button>
          )}


          <div className="mt-2">
            <Button
              className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400 transition-colors w-full"
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Delete Group Modal */}
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1000]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] flex flex-col text-gray-900">
            <h2 className="text-xl font-bold mb-4">Confirm Group Deletion</h2>
            <p className="mb-4">This is a permanent action. You cannot UNDO</p>
            <div className="mt-auto pt-2 space-x-4">
              <Button
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                onClick={async () => {
                  try {
                    await handleDeleteGroup();

                    setShowDeleteModal(false);
                  } catch (error) {
                    console.error('Error deleting group:', error);
                    toast.error('Failed to delete group. Please try again.');
                  }
                }}
              >
                Confirm
              </Button>
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>  

    {/* Rename Group Modal */}
    <AnimatePresence>
      {showRenameModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1000]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] flex flex-col text-gray-900">
            <h2 className="text-xl font-bold mb-4">Rename Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter new group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="mt-auto pt-2 space-x-4">
              <Button
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                onClick={async () => {
                  try {
                    await handleRenameGroup();

                    setShowRenameModal(false); // Đóng modal
                    setShowSettingsModal(false); // Đảm bảo Settings Modal cũng đóng
                    setNewGroupName(""); // Reset state
                  } catch (error) {
                    console.error("Error renaming group:", error);
                    toast.error("Failed to rename group. Please try again.");
                  }
                }}
                disabled={!newGroupName.trim() || newGroupName === selectedGroup.name} // Vô hiệu hóa nếu tên trống hoặc không đổi
              >
                Confirm
              </Button>
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={() => {
                  setShowRenameModal(false); // Đóng modal
                  setNewGroupName(""); // Reset state
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Leave Group Modal */}
    <AnimatePresence>
      {showLeaveModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1000]"
        >
          <div className="bg-white p-6 rounded-[20px] shadow-lg text-center w-[400px] flex flex-col text-gray-900">
            <h2 className="text-xl font-bold mb-4">Confirm Leaving Group</h2>
            <p className="mb-4">Are you sure you want to leave <strong>{selectedGroup?.name}</strong>? This action cannot be undone, and you will lose access to this group.</p>
            <div className="mt-auto pt-2 space-x-4">
              <Button
                className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors"
                onClick={async () => {
                  try {
                    await handleLeaveGroup();

                    setShowLeaveModal(false); // Đóng modal
                    setShowSettingsModal(false); // Đảm bảo Settings Modal cũng đóng
                    setSelectedGroup(null); // Reset selected group
                      
                  } catch (error) {
                    console.error("Error leaving group:", error);
                    toast.error("Failed to leave group. Please try again.");
                  }
                }}
              >
                Confirm
              </Button>
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
                onClick={() => {
                  setShowLeaveModal(false); // Đóng modal
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

  </div>
);
};
export default Dashboard_group;

  