import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, Eye, Heart, Users, TrendingUp, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#00FF94', '#00FF94', '#00FF94', '#00FF94', '#c4b5fd'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'violet' }) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon size={18} className={`text-${color}-400`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value ?? '—'}</p>
    <p className="text-sm text-slate-400">{label}</p>
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user, isAdmin, isAuthor } = useAuthStore();
  const isAdminOrEditor = ['admin', 'editor'].includes(user?.role);

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardAPI.getAdminMetrics,
    enabled: isAdminOrEditor,
  });

  const { data: authorData, isLoading: authorLoading } = useQuery({
    queryKey: ['dashboard', 'author'],
    queryFn: dashboardAPI.getAuthorMetrics,
    enabled: !isAdminOrEditor,
  });

  const metrics = isAdminOrEditor ? adminData?.data?.data : authorData?.data?.data;
  const isLoading = isAdminOrEditor ? adminLoading : authorLoading;

  const overview = metrics?.overview;
  const postsByDay = metrics?.postsByDay || [];
  const postsByCategory = metrics?.postsByCategory || [];
  const recentPosts = metrics?.recentPosts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        {isAuthor() && (
          <Link to="/dashboard/editor"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus size={16} /> Nuevo post
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Posts" value={overview?.totalPosts} sub={`${overview?.publishedPosts} publicados`} />
          <StatCard icon={Eye} label="Vistas totales" value={overview?.totalViews?.toLocaleString()} />
          {isAdminOrEditor ? (
            <StatCard icon={Users} label="Usuarios" value={overview?.totalUsers} sub={`+${overview?.newUsersThisMonth} este mes`} color="indigo" />
          ) : (
            <StatCard icon={Heart} label="Me gusta" value={overview?.totalLikes} color="indigo" />
          )}
          <StatCard icon={TrendingUp} label="Borradores" value={overview?.draftPosts} color="amber" />
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-6">Actividad (últimos 30 días)</h3>
          {isLoading ? (
            <div className="h-56 animate-pulse bg-white/[0.03] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={postsByDay}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="posts" name="Posts" stroke="#00FF94" fill="url(#colorPosts)" strokeWidth={2} />
                <Area type="monotone" dataKey="views" name="Vistas" stroke="#00FF94" fill="url(#colorViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-6">Posts por categoría</h3>
          {isLoading ? (
            <div className="h-48 animate-pulse bg-white/[0.03] rounded-xl" />
          ) : postsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={postsByCategory} dataKey="count" nameKey="category.name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {postsByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">Sin datos</div>
          )}
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-slate-300">Posts recientes</h3>
          <Link to="/dashboard/posts" className="text-xs text-green-500 hover:text-green-500">Ver todos</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-white/[0.03] rounded-xl" />
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div key={post._id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{post.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {post.publishedAt ? format(new Date(post.publishedAt), 'd MMM yyyy', { locale: es }) : 'No publicado'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
                  <span className="flex items-center gap-1"><Eye size={11} /> {post.views}</span>
                  <span className="flex items-center gap-1"><Heart size={11} /> {post.likes?.length || 0}</span>
                </div>
                <Link to={`/dashboard/editor/${post._id}`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-green-500 hover:bg-green-500/10 transition-colors">
                  <Edit size={13} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-600">
            <p className="text-sm mb-3">No hay posts todavía.</p>
            <Link to="/dashboard/editor" className="text-green-500 text-sm hover:underline">Crear primer post →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
