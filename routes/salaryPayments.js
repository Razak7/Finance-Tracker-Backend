const express = require('express');
const router = express.Router();
const SalaryPayment = require('../models/SalaryPayment');
const auth = require('../middleware/auth');

// Get all salary payments for user
router.get('/', auth, async (req, res) => {
    try {
        const salaryPayments = await SalaryPayment.find({ user: req.user.userId })
            .populate('job', 'name')
            .sort({ date: -1, createdAt: -1 });
        res.json(salaryPayments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create salary payment
router.post('/', auth, async (req, res) => {
    try {
        const { job, amount, date } = req.body;

        const salaryPayment = new SalaryPayment({
            user: req.user.userId,
            job,
            amount,
            date: date || new Date()
        });

        await salaryPayment.save();

        // Populate job name for response
        await salaryPayment.populate('job', 'name');

        res.status(201).json(salaryPayment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete salary payment
router.delete('/:id', auth, async (req, res) => {
    try {
        const salaryPayment = await SalaryPayment.findById(req.params.id);

        if (!salaryPayment) {
            return res.status(404).json({ message: 'Salary payment not found' });
        }

        if (salaryPayment.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await salaryPayment.deleteOne();
        res.json({ message: 'Salary payment removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;