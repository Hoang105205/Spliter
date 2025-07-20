const { Expenses, expenseItems, Groups } = require('../schemas');
const { Op } = require('sequelize');


const getExpenses = async (req, res) => {
    const groupId = Number(req.params.groupId); // Ensure groupId is a number
    try {
        const expenses = await Expenses.findAll({
            where: {
                groupId: groupId 
            },
            include: [{
                model: expenseItems,
                as: 'items',
                required: false
            }],
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createExpense = async (req, res) => {
    const { title, expDate, description, amount, paidbyId, groupId, members } = req.body;
    try {
        const newExpense = await Expenses.create({
            title,
            expDate,
            description,
            amount,
            paidbyId,
            groupId
        });

        const ExpenseItems = members.map(member => ({
            expenseId: newExpense.id,
            groupId: groupId, // Ensure each item has groupId
            userId: member.memberId, // Assuming member has id
            shared_amount: member.amount, // Assuming member has amount
            is_paid: member.memberId === paidbyId ? 'yes' : 'no'
        }));
        await expenseItems.bulkCreate(ExpenseItems);

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


//Get all amount of lent for a user, group by month, và trả về unpaidLend tổng
const getAllLend = async (req, res) => {
    const userId = Number(req.params.userId); // Ensure userId is a number
    try {
        const expenses = await Expenses.findAll({
            where: {
                paidbyId: userId
            },
            include: [{
                model: expenseItems,
                as: 'items',
                required: false
            }],
        });

        // Object lưu tổng lend từng tháng: { '07/2025': số tiền, ... }
        const monthlyLend = {};
        let unpaidLend = 0; // Tổng số tiền chưa được trả

        expenses.forEach(expense => {
            const date = expense.createdAt;
            const d = new Date(date);
            const monthKey = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

            // Tính tổng tiền cho vay trong expense này
            let totalPaidbyAmount = 0;

            if (expense.items && expense.items.length > 0) {
                expense.items.forEach(item => {
                    if (item.userId === userId) {
                        totalPaidbyAmount += Number(item.shared_amount || 0);
                    }
                    else if (item.is_paid === 'no' || item.is_paid === 'pending') {
                        unpaidLend += Number(item.shared_amount || 0);
                    }
                });
            }

            // Tổng tiền của expense
            const totalExpenseAmount = Number(expense.amount || 0);

            // Tổng lend = tổng tiền expense - phần của paidbyId
            const lend = totalExpenseAmount - totalPaidbyAmount;

            // Cộng dồn vào từng tháng
            monthlyLend[monthKey] = (monthlyLend[monthKey] || 0) + lend;
        });

        res.status(200).json({ 
            monthlyLend,      // Tổng số tiền cho vay từng tháng
            unpaidLend        // Tổng số tiền cho vay chưa được trả
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all amount of owe for a user, group by month, và trả về unPaidOwe tổng (tối ưu: lọc expenseItems trước, lấy expense theo expenseId)
const getAllOwe = async (req, res) => {
    const userId = Number(req.params.userId); // Ensure userId is a number
    try {
        //Lấy tất cả expenseItem của user này
        const items = await expenseItems.findAll({
            where: { userId }
        });

        //Lọc ra các expenseId mà user tham gia
        const expenseIds = items.map(item => item.expenseId);

        if (expenseIds.length === 0) {
            return res.status(200).json({ monthlyOwe: {}, unPaidOwe: 0 });
        }

        //Lấy các Expense theo danh sách expenseId, paidbyId khác userId
        const expenses = await Expenses.findAll({
            where: {
                id: expenseIds,
                paidbyId: { [Op.ne]: userId }
            }
        });

        // Build lookup Expense theo id để truy nhanh
        const expenseMap = {};
        expenses.forEach(expense => {
            expenseMap[expense.id] = expense;
        });

        // Tính toán tổng hợp
        const monthlyOwe = {};
        let unPaidOwe = 0;

        items.forEach(item => {
            const expense = expenseMap[item.expenseId];
            if (!expense) return; // Nếu expense không phải của user (do paidbyId lọc ở trên)

            const date = expense.createdAt;
            const d = new Date(date);
            const monthKey = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

            monthlyOwe[monthKey] = (monthlyOwe[monthKey] || 0) + Number(item.shared_amount || 0);

            if (item.is_paid === 'no' || item.is_paid === 'pending') {
                unPaidOwe += Number(item.shared_amount || 0);
            }
        });

        res.status(200).json({ 
            monthlyOwe,    // Tổng số tiền đã nợ từng tháng
            unPaidOwe      // Tổng số tiền nợ chưa trả
        });
    } catch (error) {
        console.error('Error fetching owe items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserExpenses = async (req, res) => {
    const UserId = Number(req.params.userId); // Ensure userId is a number
    try {
        const userExpenses = await expenseItems.findAll({
            where: {
                userId: UserId
            }
        });

        //Count paid and unpaid expenses
        const unpaidExpenses = userExpenses.filter(expense => expense.is_paid === 'no' || expense.is_paid === 'pending').length;
        const paidExpenses = userExpenses.filter(expense => expense.is_paid === 'yes').length;

        res.status(200).json({
            unpaidExpenses,
            paidExpenses
        });
    } catch (error) {
        console.error('Error fetching user expenses:', error);
        throw new Error('Internal server error');
    }
};

const updateExpenseItemStatus = async (req, res) => {
    const { expenseId, itemId, userId, status } = req.body; // Nhận expenseId, itemId, userId và status từ client
    try {
        const expenseItem = await expenseItems.findOne({
            where: {
                id: itemId,
                expenseId: expenseId,
                userId: userId
            }
        });

        if (!expenseItem) {
            return res.status(404).json({ message: 'Expense item not found' });
        }

        // Cập nhật trạng thái is_paid
        await expenseItem.update({ is_paid: status });

        res.status(200).json({ message: 'Expense item status updated successfully', updatedItem: expenseItem });
    } catch (error) {
        console.error('Error updating expense item status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get details of a specific expense by expenseId
const getExpensesById = async (req, res) => {
    const expenseId = Number(req.params.id); // Ensure expenseId is a number
    try {
        const expense = await Expenses.findByPk(expenseId, {
            include: [{
                model: expenseItems,
                as: 'items',
                required: false
            }],
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(expense);
    } catch (error) {
        console.error('Error fetching expense details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    getAllLend,
    getUserExpenses,
    getAllOwe,
    updateExpenseItemStatus,
    getExpensesById
};