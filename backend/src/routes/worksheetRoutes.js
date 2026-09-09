const express = require('express');
const router = express.Router();
const WorksheetController = require('../controllers/worksheetController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage (for uploading to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ─── PSYCHOLOGIST & ADMIN ENDPOINTS ──────────────────────────────────────────

// Upload a new worksheet for a session
router.post('/psychologist/sessions/:sessionId/upload', 
  verifyJWT, 
  requireRole('admin', 'psychologist', 'counsellor'), 
  upload.single('file'), 
  WorksheetController.uploadWorksheet
);

// Get worksheets for a session
router.get('/psychologist/sessions/:sessionId', 
  verifyJWT, 
  requireRole('admin', 'psychologist', 'counsellor'), 
  WorksheetController.getSessionWorksheets
);

// Share a worksheet
router.post('/psychologist/:worksheetId/share', 
  verifyJWT, 
  requireRole('admin', 'psychologist', 'counsellor'), 
  WorksheetController.shareWorksheet
);

// Stream original file for psychologist
router.get('/psychologist/:worksheetId/file', 
  verifyJWT, 
  requireRole('admin', 'psychologist', 'counsellor'), 
  WorksheetController.streamOriginalFile
);

// Stream completed file for psychologist
router.get('/psychologist/:worksheetId/submission-file', 
  verifyJWT, 
  requireRole('admin', 'psychologist', 'counsellor'), 
  WorksheetController.streamSubmissionFile
);

// ─── CLIENT ENDPOINTS ────────────────────────────────────────────────────────

// Verify access to a worksheet (returns metadata)
router.get('/client/:token', 
  verifyJWT, 
  WorksheetController.verifyAccess
);

// Stream original file for client
router.get('/client/:token/file', 
  verifyJWT, 
  WorksheetController.streamOriginalFileClient
);

// Submit completed worksheet
router.post('/client/:token/submit', 
  verifyJWT, 
  upload.single('file'), 
  WorksheetController.submitWorksheet
);

module.exports = router;
