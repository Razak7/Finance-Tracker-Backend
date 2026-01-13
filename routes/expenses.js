const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get all expenses for user
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.userId })
            .sort({ date: -1, createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get expenses by date range
router.get('/range', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const expenses = await Expense.find({
            user: req.user.userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create expense
router.post('/', auth, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        const expense = new Expense({
            user: req.user.userId,
            title,
            amount,
            category,
            date: date || new Date()
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check if expense belongs to user
        if (expense.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        expense.title = title || expense.title;
        expense.amount = amount || expense.amount;
        expense.category = category || expense.category;
        expense.date = date || expense.date;

        await expense.save();
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check if expense belongs to user
        if (expense.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;