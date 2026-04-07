// dashboard routes
const express = require('express');
const router = express.Router();
const { getAdminMetrics, getAuthorMetrics } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/metrics', protect, authorize('admin', 'editor'), getAdminMetrics);
router.get('/author', protect, authorize('author', 'editor', 'admin'), getAuthorMetrics);

module.exports = router;
