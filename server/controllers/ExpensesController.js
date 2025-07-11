const { Expenses, expenseItems } = require('../schemas');
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
            is_paid: member.memberId === paidbyId // Set paid to true if this member paid
        }));
        await expenseItems.bulkCreate(ExpenseItems);

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
} 


module.exports = {
    getExpenses,
    createExpense
};