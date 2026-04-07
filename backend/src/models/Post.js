const mongoose = require('mongoose');
const slugify = require('slugify');

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isApproved: { type: Boolean, default: true },
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      url: String,
      alt: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'scheduled'],
      default: 'draft',
    },
    publishedAt: Date,
    scheduledAt: Date,
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // minutes
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    featured: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: comments count
PostSchema.virtual('commentsCount').get(function () {
  return this.comments?.length || 0;
});

// Virtual: likes count
PostSchema.virtual('likesCount').get(function () {
  return this.likes?.length || 0;
});

// Auto-generate slug before save
PostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) +
      '-' + Date.now().toString(36);
  }
  // Calculate read time (avg 200 words/min)
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(words / 200);
  }
  // Auto-generate excerpt if empty
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  }
  next();
});

// Text search index
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
PostSchema.index({ slug: 1 });
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
