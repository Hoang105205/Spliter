const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getAllLend,
    createExpense,
    getAllOwe,
    getUserExpenses
} = require('../controllers/ExpensesController');

// API: /api/expenses/

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

module.exports = router;