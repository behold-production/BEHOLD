const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

// Simple middleware to protect cron routes from arbitrary execution
// Using a basic secret token via header or query param
const protectCron = (req, res, next) => {
  const secret = process.env.CRON_SECRET || 'behold-default-cron-secret-2026';
  const providedSecret = req.headers['x-cron-secret'] || req.query.secret;

  if (providedSecret !== secret) {
    return res.status(403).json({ success: false, message: 'Unauthorized cron request' });
  }
  next();
};

// Route: GET /api/cron/reminders
router.get('/reminders', protectCron, cronController.sendDailyReminders);

module.exports = router;
