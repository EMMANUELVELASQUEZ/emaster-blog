import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { Search } from 'lucide-react';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-publishedAt');
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['posts', page, sort, search],
    queryFn: () => postsAPI.getAll({ page, limit: 9, sort, search: search || undefined }),
    keepPreviousData: true,
  });
  const posts = data?.data?.data || [];
  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-slate-500 mb-10">Artículos y tutoriales sobre tecnología.</p>
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">{[...Array(6)].map((_,i)=><div key={i} className="h-72 rounded-2xl bg-white/[0.03] animate-pulse"/>)}</div>
      ) : posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{posts.map(p=><PostCard key={p._id} post={p}/>)}</div>
      ) : (
        <div className="text-center py-20 text-slate-600"><p>No hay posts publicados aún.</p></div>
      )}
    </div>
  );
}
