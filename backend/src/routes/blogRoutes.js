const express = require('express');
const BlogController = require('../controllers/blogController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Admin routes MUST be registered before generic /:slug route to prevent matching 'admin' as a slug
router.get('/admin/all', verifyJWT, requireRole('admin'), BlogController.getAllBlogsAdmin);
router.post('/', verifyJWT, requireRole('admin'), BlogController.createBlog);
router.put('/:id', verifyJWT, requireRole('admin'), BlogController.updateBlog);
router.delete('/:id', verifyJWT, requireRole('admin'), BlogController.deleteBlog);

// Public routes
router.get('/', BlogController.getPublishedBlogs);
router.get('/:slug', BlogController.getBlogBySlug);

module.exports = router;
