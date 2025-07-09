const express = require('express');
const router = express.Router();
const {
    getExpenses,
    createExpense
} = require('../controllers/ExpensesController');

// API: /api/expenses/

// Get all expenses in a group
router.get('/:groupId', getExpenses);

// Create a new expense
router.post('/', createExpense);


module.exports = router;