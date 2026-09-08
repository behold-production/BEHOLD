const StorageService = require('../services/storageService');
const { uploadPrivateToCloudinary, getPrivateDownloadUrl } = require('../utils/cloudinaryHelper');
const WhatsAppService = require('../services/whatsappService');
const crypto = require('crypto');
const request = require('request');

const WorksheetController = {
  // ─── PSYCHOLOGIST ENDPOINTS ──────────────────────────────────────────────────

  async uploadWorksheet(req, res, next) {
    try {
      const { sessionId, clientId, optionalMessage } = req.body;
      const psychologistId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Verify the session belongs to this psychologist and client
      const session = await StorageService.findById('sessions', sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      
      // Admin bypass or strict psychologist check
      if (req.user.role !== 'admin' && session.counsellorId !== psychologistId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to upload to this session' });
      }

      if (session.userId !== clientId) {
        return res.status(400).json({ success: false, message: 'Session does not belong to the specified client' });
      }

      // Upload to Cloudinary (private)
      const uploadResult = await uploadPrivateToCloudinary(req.file.buffer, 'behold_worksheets');

      // Create Worksheet record
      const secureAccessToken = crypto.randomBytes(16).toString('hex');

      const worksheet = await StorageService.create('worksheets', {
        worksheetId: `ws_${Date.now()}`,
        clientId,
        psychologistId: session.counsellorId,
        sessionId,
        originalFileName: req.file.originalname,
        storageKey: uploadResult.public_id,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        optionalMessage: optionalMessage || '',
        status: 'DRAFT',
        secureAccessToken
      });

      res.status(201).json({ success: true, data: worksheet });
    } catch (error) {
      console.error('[uploadWorksheet] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload worksheet' });
    }
  },

  async shareWorksheet(req, res, next) {
    try {
      const { worksheetId } = req.params;
      
      const worksheet = await StorageService.findOne('worksheets', { worksheetId });
      if (!worksheet) {
        return res.status(404).json({ success: false, message: 'Worksheet not found' });
      }

      // Verify authorization
      if (req.user.role !== 'admin' && worksheet.psychologistId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Get Client info for WhatsApp
      const client = await StorageService.findById('users', worksheet.clientId);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }

      // Update status
      const updatedWorksheet = await StorageService.update('worksheets', worksheet.id, {
        status: 'SHARED',
        sharedAt: new Date()
      });

      // Generate Link
      const domain = process.env.FRONTEND_URL || 'https://www.behold.co.in';
      const secureLink = `${domain}/activity-sheet/${worksheet.secureAccessToken}`;

      // Dispatch WhatsApp Notification (do not await its success to block response)
      if (client.phone) {
        WhatsAppService.sendWorksheetNotification(client.phone, {
          clientName: client.name || 'Client',
          secureLink
        }).catch(err => console.error('[Share Worksheet WA Error]', err));
      }

      res.status(200).json({ success: true, data: updatedWorksheet });
    } catch (error) {
      console.error('[shareWorksheet] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to share worksheet' });
    }
  },

  async getSessionWorksheets(req, res, next) {
    try {
      const { sessionId } = req.params;
      
      const session = await StorageService.findById('sessions', sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      if (req.user.role !== 'admin' && session.counsellorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const worksheets = await StorageService.findAll('worksheets', { sessionId });
      res.status(200).json({ success: true, data: worksheets });
    } catch (error) {
      console.error('[getSessionWorksheets] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch worksheets' });
    }
  },

  async streamOriginalFile(req, res, next) {
    try {
      const { worksheetId } = req.params;
      const worksheet = await StorageService.findOne('worksheets', { worksheetId });
      
      if (!worksheet) return res.status(404).send('Worksheet not found');
      if (req.user.role !== 'admin' && worksheet.psychologistId !== req.user.id) {
        return res.status(403).send('Unauthorized');
      }

      const downloadUrl = getPrivateDownloadUrl(worksheet.storageKey, 'pdf');
      request(downloadUrl).pipe(res);
    } catch (error) {
      console.error('[streamOriginalFile] Error:', error);
      res.status(500).send('Error streaming file');
    }
  },

  async streamSubmissionFile(req, res, next) {
    try {
      const { worksheetId } = req.params;
      const worksheet = await StorageService.findOne('worksheets', { worksheetId });
      
      if (!worksheet || !worksheet.submissionStorageKey) return res.status(404).send('Submission not found');
      if (req.user.role !== 'admin' && worksheet.psychologistId !== req.user.id) {
        return res.status(403).send('Unauthorized');
      }

      const downloadUrl = getPrivateDownloadUrl(worksheet.submissionStorageKey, 'pdf');
      request(downloadUrl).pipe(res);
    } catch (error) {
      console.error('[streamSubmissionFile] Error:', error);
      res.status(500).send('Error streaming file');
    }
  },

  // ─── CLIENT ENDPOINTS ────────────────────────────────────────────────────────

  async verifyAccess(req, res, next) {
    try {
      const { token } = req.params;
      const worksheet = await StorageService.findOne('worksheets', { secureAccessToken: token });
      
      if (!worksheet || worksheet.status === 'DRAFT') {
        return res.status(404).json({ success: false, message: 'Worksheet not found or unavailable' });
      }

      if (worksheet.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You do not have permission to view this worksheet' });
      }

      // Safe metadata to return
      const safeData = {
        worksheetId: worksheet.worksheetId,
        sessionId: worksheet.sessionId,
        originalFileName: worksheet.originalFileName,
        optionalMessage: worksheet.optionalMessage,
        status: worksheet.status,
        sharedAt: worksheet.sharedAt,
        completedAt: worksheet.completedAt,
        submissionFileName: worksheet.submissionFileName
      };

      res.status(200).json({ success: true, data: safeData });
    } catch (error) {
      console.error('[verifyAccess] Error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async streamOriginalFileClient(req, res, next) {
    try {
      const { token } = req.params;
      const worksheet = await StorageService.findOne('worksheets', { secureAccessToken: token });
      
      if (!worksheet || worksheet.status === 'DRAFT') return res.status(404).send('Worksheet not found');
      if (worksheet.clientId !== req.user.id) return res.status(403).send('Unauthorized');

      const downloadUrl = getPrivateDownloadUrl(worksheet.storageKey, 'pdf');
      request(downloadUrl).pipe(res);
    } catch (error) {
      console.error('[streamOriginalFileClient] Error:', error);
      res.status(500).send('Error streaming file');
    }
  },

  async submitWorksheet(req, res, next) {
    try {
      const { token } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const worksheet = await StorageService.findOne('worksheets', { secureAccessToken: token });
      if (!worksheet || worksheet.status === 'DRAFT') {
        return res.status(404).json({ success: false, message: 'Worksheet not found' });
      }

      if (worksheet.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (worksheet.status === 'SUBMITTED') {
        return res.status(400).json({ success: false, message: 'Worksheet is already submitted' });
      }

      const uploadResult = await uploadPrivateToCloudinary(req.file.buffer, 'behold_worksheet_submissions');

      const updatedWorksheet = await StorageService.update('worksheets', worksheet.id, {
        status: 'SUBMITTED',
        submissionStorageKey: uploadResult.public_id,
        submissionFileName: req.file.originalname,
        completedAt: new Date()
      });

      // Send notification to psychologist (best effort)
      const psychologist = await StorageService.findById('counsellors', worksheet.psychologistId);
      const client = await StorageService.findById('users', worksheet.clientId);
      if (psychologist && psychologist.phone) {
        const text = `Hi ${psychologist.name},\n\nClient ${client.name} has submitted the completed activity sheet for session ${worksheet.sessionId}.\n\nYou can review it in your BEHOLD dashboard.`;
        WhatsAppService._dispatch(psychologist.phone, text).catch(e => console.error('[Psychologist Notification Error]', e));
      }

      res.status(200).json({ success: true, data: { status: 'SUBMITTED', completedAt: updatedWorksheet.completedAt } });
    } catch (error) {
      console.error('[submitWorksheet] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit worksheet' });
    }
  }
};

module.exports = WorksheetController;
