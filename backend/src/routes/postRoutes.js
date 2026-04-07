const express = require('express');
const router = express.Router();
const {
  getPosts, getPost, createPost, updatePost, deletePost,
  toggleLike, toggleBookmark, addComment, getMyPosts,
} = require('../controllers/postController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public
router.get('/', getPosts);
router.get('/my', protect, getMyPosts);
router.get('/:slug', optionalAuth, getPost);

// Private - authors+
router.post('/', protect, authorize('author', 'editor', 'admin'), createPost);
router.put('/:id', protect, authorize('author', 'editor', 'admin'), updatePost);
router.delete('/:id', protect, authorize('author', 'editor', 'admin'), deletePost);

// Interactions
router.put('/:id/like', protect, toggleLike);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comments', protect, addComment);

module.exports = router;
