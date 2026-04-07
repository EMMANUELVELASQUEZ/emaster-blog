import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function PostPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['post', slug], queryFn: () => postsAPI.getOne(slug) });
  const post = data?.data?.data;
  if (isLoading) return <div className="pt-24 max-w-3xl mx-auto px-6"><div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse"/></div>;
  if (!post) return <div className="pt-24 text-center text-slate-500"><Link to="/blog" className="text-green-500">← Volver</Link></div>;
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8"><ArrowLeft size={14}/>Volver al blog</Link>
      <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">{post.title}</h1>
      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</div>
    </div>
  );
}
