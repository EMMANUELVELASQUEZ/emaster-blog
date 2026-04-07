import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { Plus } from 'lucide-react';

export default function MyPostsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-posts'], queryFn: () => postsAPI.getMyPosts({}) });
  const posts = data?.data?.data || [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mis Posts</h1>
        <Link to="/dashboard/editor" className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-500 text-white text-sm font-medium rounded-xl"><Plus size={16}/>Nuevo</Link>
      </div>
      {isLoading ? <div className="h-32 rounded-2xl bg-white/[0.03] animate-pulse"/> : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-600"><Link to="/dashboard/editor" className="text-green-500">Crear primer post →</Link></div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-200 text-sm font-medium">{p.title}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
