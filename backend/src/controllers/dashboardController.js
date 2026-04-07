const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get admin dashboard metrics
// @route   GET /api/v1/dashboard/metrics
// @access  Private (admin, editor)
exports.getAdminMetrics = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalUsers,
    newUsersThisMonth,
    totalViews,
    recentPosts,
    topPosts,
    postsByCategory,
    postsByDay,
  ] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Post.find({ status: 'published' })
      .sort('-createdAt')
      .limit(5)
      .populate('author', 'name avatar')
      .select('title slug views likesCount commentsCount createdAt'),
    Post.find({ status: 'published' })
      .sort('-views')
      .limit(5)
      .populate('author', 'name')
      .select('title slug views likes comments'),
    Post.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmpty: true } },
      { $limit: 8 },
    ]),
    Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          posts: { $sum: 1 },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        newUsersThisMonth,
        totalViews: totalViews[0]?.total || 0,
      },
      recentPosts,
      topPosts,
      postsByCategory,
      postsByDay,
    },
  });
});

// @desc    Get author dashboard metrics
// @route   GET /api/v1/dashboard/author
// @access  Private (author+)
exports.getAuthorMetrics = asyncHandler(async (req, res) => {
  const authorId = req.user._id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalPosts, publishedPosts, draftPosts, viewsAgg, myPosts, postsByDay] =
    await Promise.all([
      Post.countDocuments({ author: authorId }),
      Post.countDocuments({ author: authorId, status: 'published' }),
      Post.countDocuments({ author: authorId, status: 'draft' }),
      Post.aggregate([
        { $match: { author: authorId } },
        { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: { $size: '$likes' } } } },
      ]),
      Post.find({ author: authorId })
        .sort('-createdAt')
        .limit(5)
        .populate('category', 'name slug')
        .select('title slug status views likes comments publishedAt'),
      Post.aggregate([
        { $match: { author: authorId, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            posts: { $sum: 1 },
            views: { $sum: '$views' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: viewsAgg[0]?.views || 0,
        totalLikes: viewsAgg[0]?.likes || 0,
      },
      recentPosts: myPosts,
      postsByDay,
    },
  });
});
