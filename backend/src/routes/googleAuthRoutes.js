const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Counsellor = require('../models/Counsellor');
const { verifyJWT } = require('../middleware/authMiddleware');

// Initialize OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback'
  );
};

// @route   GET /api/google/url
// @desc    Get Google OAuth URL for a specific counsellor
// @access  Private (Counsellor/Admin)
router.get('/url', verifyJWT, async (req, res) => {
  try {
    const { counsellorId } = req.query;
    if (!counsellorId) {
      return res.status(400).json({ success: false, message: 'counsellorId is required' });
    }

    const oauth2Client = getOAuth2Client();
    
    // Generate an auth URL
    // We pass the counsellorId as 'state' so we can associate the token with the correct user in the callback
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      prompt: 'consent', // Force consent to ensure we always get a refresh token
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar'
      ],
      state: counsellorId
    });

    res.json({ success: true, url });
  } catch (error) {
    console.error('Error generating Google Auth URL:', error);
    res.status(500).json({ success: false, message: 'Server error generating auth URL' });
  }
});

// @route   GET /api/google/callback
// @desc    Handle Google OAuth callback, exchange code for refresh token, save to counsellor
// @access  Public (Redirected from Google)
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).send('Missing code or state parameter');
    }

    const counsellorId = state;
    const oauth2Client = getOAuth2Client();

    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Save refresh token to the counsellor's profile
      const counsellor = await Counsellor.findOne({ id: counsellorId });
      if (!counsellor) {
        return res.status(404).send('Counsellor not found');
      }

      counsellor.googleRefreshToken = tokens.refresh_token;
      await counsellor.save();
      
      // Redirect back to the frontend settings page with a success flag
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/dashboard/settings?google=success`);
    } else {
      // If we didn't get a refresh token, it means they might have previously authorized
      // and we need to force prompt: 'consent' (which we do above, so this should rarely happen)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/dashboard/settings?google=no_refresh_token`);
    }

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard/settings?google=error`);
  }
});

// @route   POST /api/google/disconnect
// @desc    Disconnect Google Calendar (remove refresh token)
// @access  Private (Counsellor/Admin)
router.post('/disconnect', verifyJWT, async (req, res) => {
  try {
    const { counsellorId } = req.body;
    if (!counsellorId) {
      return res.status(400).json({ success: false, message: 'counsellorId is required' });
    }

    const counsellor = await Counsellor.findOne({ id: counsellorId });
    if (!counsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found' });
    }

    // Optional: We could revoke the token on Google's side here
    // But simply deleting it from DB is enough to stop our app from using it
    counsellor.googleRefreshToken = '';
    await counsellor.save();

    res.json({ success: true, message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ success: false, message: 'Server error disconnecting calendar' });
  }
});

module.exports = router;
