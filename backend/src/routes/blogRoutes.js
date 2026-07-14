const express = require('express');
const BlogController = require('../controllers/blogController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', BlogController.getPublishedBlogs);
router.get('/:slug', BlogController.getBlogBySlug);

// Admin routes (require authentication and admin role)
router.get('/admin/all', verifyJWT, requireRole('admin'), BlogController.getAllBlogsAdmin);
router.post('/', verifyJWT, requireRole('admin'), upload.single('coverImage'), BlogController.createBlog);
router.put('/:id', verifyJWT, requireRole('admin'), upload.single('coverImage'), BlogController.updateBlog);
router.delete('/:id', verifyJWT, requireRole('admin'), BlogController.deleteBlog);

module.exports = router;
