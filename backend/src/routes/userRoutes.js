const express = require('express');
const UserController = require('../controllers/userController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', verifyJWT, requireRole('user'), UserController.getProfile);
router.put('/profile', verifyJWT, requireRole('user'), UserController.updateProfile);
router.get('/dashboard', verifyJWT, requireRole('user'), UserController.getDashboard);
router.get('/test-results', verifyJWT, requireRole('user'), UserController.getMyTestResults);

// Counsellor search and details (accessible by users, and optionally others)
router.get('/counsellors', UserController.searchCounsellors);
router.get('/counsellors/:id', UserController.getCounsellorDetails);

module.exports = router;
