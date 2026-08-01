const express = require('express');
const CounsellorController = require('../controllers/counsellorController');
const UserController = require('../controllers/userController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Counsellor Listings
router.get('/', UserController.getCounsellors);
router.get('/profile', verifyJWT, requireRole('counsellor'), CounsellorController.getProfile);
router.get('/:id', UserController.getCounsellorDetails);
router.put('/profile', verifyJWT, requireRole('counsellor'), CounsellorController.updateProfile);
router.put(
  '/profile-pic',
  verifyJWT,
  requireRole('counsellor'),
  upload.single('profilePic'),
  CounsellorController.updateProfilePic
);
router.put('/availability', verifyJWT, requireRole('counsellor'), CounsellorController.updateAvailability);
router.get('/dashboard', verifyJWT, requireRole('counsellor'), CounsellorController.getDashboard);

module.exports = router;
