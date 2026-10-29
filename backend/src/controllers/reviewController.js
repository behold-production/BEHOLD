const Review = require('../models/Review');

// The public list is response-cached; drop it whenever a review changes state.
const flushReviewCache = () => {
  try {
    require('../middleware/cacheMiddleware').invalidateResponseCache('/api/reviews');
  } catch (err) {
    console.error('[Review Cache] flush failed:', err.message);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { name, role, rating, comment } = req.body;
    const userId = req.user.id;

    if (!name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }

    const review = await Review.create({
      userId,
      name,
      role: role || 'Student',
      rating: Number(rating),
      comment,
      isApproved: false // Requires admin approval
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    next(error);
  }
};

exports.getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    flushReviewCache();
    res.status(200).json({ success: true, message: 'Review approved', data: review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    flushReviewCache();
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
