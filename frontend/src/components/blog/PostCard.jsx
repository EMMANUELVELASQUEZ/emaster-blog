import { Link } from 'react-router-dom';
import { Eye, Heart, Clock, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PostCard({ post, compact = false }) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: es })
    : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es });

  return (
    <article className="group flex flex-col rounded-2xl bg-white/[0.03] border border-white/5 hover:border-green-500/25 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">
      {/* Cover */}
      {post.coverImage?.url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      {!post.coverImage?.url && (
        <div className="aspect-[16/9] bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center">
          <span className="text-4xl opacity-20">📝</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category + time */}
        <div className="flex items-center justify-between mb-3">
          {post.category && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: `${post.category.color}20`,
                color: post.category.color,
                border: `1px solid ${post.category.color}30`,
              }}>
              {post.category.name}
            </span>
          )}
          <span className="text-xs text-slate-600 ml-auto">{timeAgo}</span>
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`} className="block mb-2">
          <h3 className="font-semibold text-slate-100 group-hover:text-green-500 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {!compact && post.excerpt && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-[10px] font-bold text-white">
                {post.author?.name?.charAt(0)}
              </div>
            )}
            <span className="text-xs text-slate-500">{post.author?.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {post.readTime}m
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={11} /> {post.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={11} /> {post.likes?.length || post.likesCount || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
