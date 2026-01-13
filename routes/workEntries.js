const express = require('express');
const router = express.Router();
const WorkEntry = require('../models/WorkEntry');
const auth = require('../middleware/auth');

// Get all work entries for user
router.get('/', auth, async (req, res) => {
    try {
        const workEntries = await WorkEntry.find({ user: req.user.userId })
            .populate('job', 'name')
            .sort({ date: -1, createdAt: -1 });
        res.json(workEntries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create work entry
router.post('/', auth, async (req, res) => {
    try {
        const { job, date, amount, notes } = req.body;

        const workEntry = new WorkEntry({
            user: req.user.userId,
            job,
            date: date || new Date(),
            amount,
            notes: notes || ''
        });

        await workEntry.save();

        // Populate job name for response
        await workEntry.populate('job', 'name');

        res.status(201).json(workEntry);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete work entry
router.delete('/:id', auth, async (req, res) => {
    try {
        const workEntry = await WorkEntry.findById(req.params.id);

        if (!workEntry) {
            return res.status(404).json({ message: 'Work entry not found' });
        }

        if (workEntry.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await workEntry.deleteOne();
        res.json({ message: 'Work entry removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;