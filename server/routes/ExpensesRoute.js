const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getAllLend,
    createExpense,
    getAllOwe,
    getUserExpenses,
    updateExpenseItemStatus,
    getExpensesById,
    getAllExpenses,
} = require('../controllers/ExpensesController');

// API: /api/expenses/

// Get all expenses for admin (must be first before parameterized routes)
router.get('/all', getAllExpenses);

// Get all expenses in a group
router.get('/:groupId', getExpenses);

// Get all lendings for a user
router.get('/allLend/:userId', getAllLend);

//Get all owe for a user
router.get('/allOwe/:userId', getAllOwe);

// Create a new expense
router.post('/', createExpense);

// Get all expenses for a user
router.get('/allExpenses/:userId', getUserExpenses);

// Update the status of an expense item
router.put('/updateStatus', updateExpenseItemStatus);

// Get expense details by ID
router.get('/detail/:id', getExpensesById);

module.exports = router;