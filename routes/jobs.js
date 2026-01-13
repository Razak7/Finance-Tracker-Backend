const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const WorkEntry = require('../models/WorkEntry');
const SalaryPayment = require('../models/SalaryPayment');
const auth = require('../middleware/auth');

// Get all jobs for user
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create job
router.post('/', auth, async (req, res) => {
    try {
        const { name, hourlyRate } = req.body;

        const job = new Job({
            user: req.user.userId,
            name,
            hourlyRate: hourlyRate || 0
        });

        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update job
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, hourlyRate } = req.body;

        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        job.name = name || job.name;
        job.hourlyRate = hourlyRate || job.hourlyRate;

        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Also delete related work entries and salary payments
        await WorkEntry.deleteMany({ job: job._id });
        await SalaryPayment.deleteMany({ job: job._id });

        await job.deleteOne();
        res.json({ message: 'Job and related data removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get job statistics
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job || job.user.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const workEntries = await WorkEntry.find({ job: job._id });
        const salaryPayments = await SalaryPayment.find({ job: job._id });

        const totalEarned = workEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const totalReceived = salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const pending = totalEarned - totalReceived;

        res.json({
            job,
            totalEarned,
            totalReceived,
            pending,
            workEntriesCount: workEntries.length,
            paymentsCount: salaryPayments.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;