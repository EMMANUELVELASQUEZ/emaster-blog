const Post = require('../models/Post');
const { asyncHandler } = require('../middleware/errorHandler');

// Query helper with filtering, sorting, pagination
const buildQuery = (queryStr) => {
  let query = { ...queryStr };
  const exclude = ['page', 'limit', 'sort', 'fields', 'search'];
  exclude.forEach((f) => delete query[f]);

  // Advanced filters: gte, gt, lte, lt
  query = JSON.parse(
    JSON.stringify(query).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`)
  );
  return query;
};

// @desc    Get all published posts (public)
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort = '-publishedAt', search, category, tag, author, featured } = req.query;

  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = { $in: [tag.toLowerCase()] };
  if (author) filter.author = author;
  if (featured === 'true') filter.featured = true;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-content -comments'),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
      hasNext: skip + posts.length < total,
      hasPrev: Number(page) > 1,
    },
  });
});

// @desc    Get single post by slug
// @route   GET /api/v1/posts/:slug
// @access  Public (optionalAuth for likes/bookmarks)
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name avatar bio socialLinks')
    .populate('category', 'name slug color')
    .populate('comments.user', 'name avatar');

  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found.' });
  }

  // Increment views (non-blocking)
  Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();

  // Add user-specific data if logged in
  let userInteractions = {};
  if (req.user) {
    userInteractions = {
      isLiked: post.likes.includes(req.user._id),
      isBookmarked: post.bookmarks.includes(req.user._id),
    };
  }

  res.json({ success: true, data: { ...post.toJSON(), ...userInteractions } });
});

// @desc    Create post
// @route   POST /api/v1/posts
// @access  Private (author, editor, admin)
exports.createPost = asyncHandler(async (req, res) => {
  req.body.author = req.user._id;
  if (req.body.status === 'published') {
    req.body.publishedAt = new Date();
  }

  const post = await Post.create(req.body);
  await post.populate('author', 'name avatar');
  await post.populate('category', 'name slug color');

  res.status(201).json({ success: true, data: post });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private (owner or admin/editor)
exports.updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const isOwner = post.author.toString() === req.user._id.toString();
  const isPrivileged = ['admin', 'editor'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ success: false, error: 'Not authorized to update this post.' });
  }

  if (req.body.status === 'published' && !post.publishedAt) {
    req.body.publishedAt = new Date();
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  })
    .populate('author', 'name avatar')
    .populate('category', 'name slug color');

  res.json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private (owner or admin)
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const isOwner = post.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized.' });
  }

  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted successfully.' });
});

// @desc    Toggle like on post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const userId = req.user._id;
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }
  await post.save({ validateBeforeSave: false });

  res.json({ success: true, data: { isLiked: !isLiked, likesCount: post.likes.length } });
});

// @desc    Toggle bookmark on post
// @route   PUT /api/v1/posts/:id/bookmark
// @access  Private
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const userId = req.user._id;
  const isBookmarked = post.bookmarks.includes(userId);

  if (isBookmarked) post.bookmarks.pull(userId);
  else post.bookmarks.push(userId);

  await post.save({ validateBeforeSave: false });
  res.json({ success: true, data: { isBookmarked: !isBookmarked } });
});

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
  if (!post.allowComments) {
    return res.status(403).json({ success: false, error: 'Comments are disabled.' });
  }

  post.comments.push({ user: req.user._id, content: req.body.content });
  await post.save({ validateBeforeSave: false });
  await post.populate('comments.user', 'name avatar');

  const newComment = post.comments[post.comments.length - 1];
  res.status(201).json({ success: true, data: newComment });
});

// @desc    Get user's own posts (author dashboard)
// @route   GET /api/v1/posts/my
// @access  Private
exports.getMyPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { author: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});
