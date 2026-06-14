const express = require('express');
const UserController = require('../controllers/userController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', verifyJWT, requireRole('user'), UserController.getProfile);
router.put('/profile', verifyJWT, requireRole('user'), UserController.updateProfile);
router.get('/dashboard', verifyJWT, requireRole('user'), UserController.getDashboard);
router.get('/test-results', verifyJWT, requireRole('user'), UserController.getMyTestResults);

// CIGI Aptitude Test Results File Upload and Management
const upload = require('../middleware/uploadMiddleware');
router.post('/cigi-results', verifyJWT, requireRole('user'), upload.single('file'), UserController.addCigiResult);
router.delete('/cigi-results/:resultId', verifyJWT, requireRole('user'), UserController.deleteCigiResult);
router.put('/profile-pic', verifyJWT, requireRole('user'), upload.single('profilePic'), UserController.updateProfilePic);

// Counsellor search and details (accessible by users, and optionally others)
router.get('/counsellors', UserController.searchCounsellors);
router.get('/counsellors/:id', UserController.getCounsellorDetails);

module.exports = router;
