const { Expenses, expenseItems, Groups } = require('../schemas');
const { logActivity } = require('../services/activityService.js');
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

//Get all amount of lent for a user
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
                    else if (item.is_paid === 'no') {
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

//Get all amount of owe for a user, group by month, và trả về unPaidOwe tổng
const getAllOwe = async (req, res) => {
    const userId = Number(req.params.userId); // Ensure userId is a number
    try {
        const expenses = await Expenses.findAll({
            where: {
                paidbyId: { [Op.ne]: userId } // paidbyId khác với userId
            },
            include: [{
                model: expenseItems,
                as: 'items',
                required: false
            }],
        });

        // Object lưu tổng owe từng tháng: { '07/2025': số tiền, ... }
        const monthlyOwe = {};
        let unPaidOwe = 0;

        expenses.forEach(expense => {
            const date = expense.createdAt;
            const d = new Date(date);
            const monthKey = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

            let oweInExpense = 0;

            if (expense.items && expense.items.length > 0) {
                expense.items.forEach(item => {
                    if (item.userId === userId) {
                        oweInExpense += Number(item.shared_amount || 0);
                    }
                    else if (item.is_paid === 'no') {
                        unPaidOwe += Number(item.shared_amount || 0);
                    }
                });
            }

            monthlyOwe[monthKey] = (monthlyOwe[monthKey] || 0) + oweInExpense;
        });

        res.status(200).json({ 
            monthlyOwe,    // Tổng số tiền đã nợ từng tháng
            unPaidOwe      // Tổng số tiền nợ chưa trả
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
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
        const unpaidExpenses = userExpenses.filter(expense => expense.is_paid === 'no').length;
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

module.exports = {
    getExpenses,
    createExpense,
    getAllLend,
    getUserExpenses,
    getAllOwe
};