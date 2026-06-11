const StorageService = require('../services/storageService');

const FeedbackController = {
  // Submit Feedback (User / Student)
  async submitFeedback(req, res, next) {
    try {
      const { sessionId, rating, comment } = req.body;
      const userId = req.user.id;

      if (!sessionId || !rating) {
        return res.status(400).json({ success: false, message: 'Session ID and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
      }

      // Check if session exists and is completed
      const session = await StorageService.findById('sessions', sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      if (session.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Can only review your own sessions' });
      }

      if (session.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Cannot submit feedback for an incomplete session' });
      }

      // Check if feedback already submitted
      const existing = await StorageService.findOne('feedbacks', { sessionId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this session' });
      }

      // Create feedback
      const newFeedback = await StorageService.create('feedbacks', {
        sessionId,
        appointmentId: session.appointmentId,
        userId,
        counsellorId: session.counsellorId,
        rating: parseInt(rating),
        comment: comment || '',
        isModerated: false
      });

      // Recalculate counsellor's rating
      const counsellorId = session.counsellorId;
      const allCounsellorReviews = await StorageService.findAll('feedbacks', { counsellorId, isModerated: false });
      
      const totalRatingsCount = allCounsellorReviews.length;
      const sumRatings = allCounsellorReviews.reduce((sum, f) => sum + f.rating, 0);
      const newAverageRating = parseFloat((sumRatings / totalRatingsCount).toFixed(1));

      await StorageService.update('counsellors', counsellorId, {
        rating: newAverageRating,
        reviewCount: totalRatingsCount
      });

      // Notify counsellor
      const student = await StorageService.findById('users', userId);
      await StorageService.create('notifications', {
        recipientId: counsellorId,
        recipientRole: 'counsellor',
        title: 'New Feedback Submitted',
        message: `Student ${student ? student.name : 'User'} submitted a ${rating}-star feedback.`,
        type: 'feedback_received',
        isRead: false
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: newFeedback
      });
    } catch (error) {
      next(error);
    }
  },

  // Get feedbacks for a counsellor
  async getCounsellorFeedbacks(req, res, next) {
    try {
      const { counsellorId } = req.params;
      const reviews = await StorageService.findAll('feedbacks', { counsellorId, isModerated: false });
      
      const populated = await Promise.all(
        reviews.map(async (r) => {
          const student = await StorageService.findById('users', r.userId);
          return {
            ...r,
            studentName: student ? student.name : 'Anonymous Student'
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: populated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = FeedbackController;
