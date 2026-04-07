// ============================================================
// BlogPage.jsx
// ============================================================
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export function BlogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-publishedAt');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['posts', page, sort, search],
    queryFn: () => postsAPI.getAll({ page, limit: 9, sort, search: search || undefined }),
    keepPreviousData: true,
  });

  const posts = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-slate-500">Artículos, tutoriales y reflexiones sobre tecnología.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar posts..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none"
        >
          <option value="-publishedAt">Más recientes</option>
          <option value="-views">Más vistos</option>
          <option value="-likes">Más valorados</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-50' : ''}`}>
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Anterior
              </button>
              <span className="text-sm text-slate-500">{page} / {pagination.pages}</span>
              <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-600">
          <p className="text-xl mb-2">No se encontraron posts</p>
          <p className="text-sm">{search ? 'Intenta con otra búsqueda.' : 'Sé el primero en publicar.'}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RegisterPage.jsx (abbreviated)
// ============================================================
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Rss, User, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const regSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['reader', 'author']),
});

export function RegisterPage() {
  const { register: reg, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(regSchema),
    defaultValues: { role: 'reader' },
  });
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Rss size={17} className="text-white" />
            </div>
            <span className="font-bold text-xl">Blog<span className="text-green-500">Platform</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
          <p className="text-slate-500 text-sm">Empieza a publicar hoy, es gratis</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', icon: User },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', icon: Mail },
              { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', icon: Lock },
            ].map(({ name, label, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input {...reg(name)} type={type} placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${errors[name] ? 'border-red-500/50' : 'border-white/10'}`} />
                </div>
                {errors[name] && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors[name].message}</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo de cuenta</label>
              <select {...reg('role')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none">
                <option value="reader">Lector</option>
                <option value="author">Autor (puede publicar)</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-green-500 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm mt-2">
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-5">
            ¿Ya tienes cuenta? <Link to="/login" className="text-green-500 hover:text-green-500">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MyPostsPage.jsx
// ============================================================
import { useState as useState2 } from 'react';
import { useQuery as useQuery2, useMutation as useMutation2, useQueryClient as useQueryClient2 } from '@tanstack/react-query';
import { postsAPI as postsAPI2 } from '../services/api';
import { Link as Link2 } from 'react-router-dom';
import { Edit2, Trash2, Plus, Eye, Heart } from 'lucide-react';
import { format as format2 } from 'date-fns';
import { es as es2 } from 'date-fns/locale';
import toast2 from 'react-hot-toast';

export function MyPostsPage() {
  const [statusFilter, setStatusFilter] = useState2('');
  const [page2, setPage2] = useState2(1);
  const qc = useQueryClient2();

  const { data, isLoading } = useQuery2({
    queryKey: ['my-posts', statusFilter, page2],
    queryFn: () => postsAPI2.getMyPosts({ status: statusFilter || undefined, page: page2 }),
  });

  const deleteMutation = useMutation2({
    mutationFn: postsAPI2.delete,
    onSuccess: () => { toast2.success('Post eliminado'); qc.invalidateQueries(['my-posts']); },
    onError: () => toast2.error('Error al eliminar'),
  });

  const posts = data?.data?.data || [];
  const pagination2 = data?.data?.pagination;

  const statusBadge = (s) => ({
    published: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    draft: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    archived: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }[s] || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mis Posts</h1>
        <Link2 to="/dashboard/editor"
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={16} /> Nuevo
        </Link2>
      </div>

      <div className="flex gap-2">
        {['', 'published', 'draft', 'archived'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage2(1); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {s === '' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : posts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-600 uppercase tracking-wider">
                {['Título', 'Estado', 'Vistas', 'Likes', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-slate-200 font-medium truncate max-w-xs">{post.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{post.views}</td>
                  <td className="px-5 py-4 text-slate-500">{post.likes?.length || 0}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {format2(new Date(post.createdAt), 'd MMM yy', { locale: es2 })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link2 to={`/dashboard/editor/${post._id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-green-500 hover:bg-green-500/10 transition-colors">
                        <Edit2 size={14} />
                      </Link2>
                      {post.status === 'published' && (
                        <Link2 to={`/blog/${post.slug}`} target="_blank"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <Eye size={14} />
                        </Link2>
                      )}
                      <button onClick={() => { if (confirm('¿Eliminar este post?')) deleteMutation.mutate(post._id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-slate-600">
            <p>No tienes posts con este filtro.</p>
            <Link2 to="/dashboard/editor" className="mt-3 inline-block text-green-500 text-sm hover:underline">
              Crear uno →
            </Link2>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// NotFoundPage.jsx
// ============================================================
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center text-center px-6">
      <div>
        <div className="text-8xl font-extrabold text-transparent bg-gradient-to-r from-green-500 to-green-600 bg-clip-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-slate-500 mb-8">La ruta que buscas no existe.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-500 text-white font-medium rounded-xl transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
