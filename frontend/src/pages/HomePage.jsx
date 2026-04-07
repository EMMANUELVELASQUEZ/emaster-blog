import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Globe, Star, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import PostCard from '../components/blog/PostCard';

const features = [
  { icon: Zap, title: 'Rendimiento óptimo', desc: 'API REST con Express y MongoDB optimizado con índices y paginación eficiente.' },
  { icon: Shield, title: 'Seguridad robusta', desc: 'JWT con refresh tokens, OAuth Google, rate limiting, sanitización de datos y Helmet.' },
  { icon: BarChart3, title: 'Dashboard analítico', desc: 'Métricas en tiempo real, gráficas con Recharts y KPIs para autores y admins.' },
  { icon: Globe, title: 'Deploy listo', desc: 'Docker + docker-compose configurado para entornos de staging y producción.' },
];

const stats = [
  { icon: Users, value: '10K+', label: 'Usuarios activos' },
  { icon: Star, value: '50K+', label: 'Posts publicados' },
  { icon: Globe, value: '99.9%', label: 'Uptime garantizado' },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: () => postsAPI.getAll({ limit: 3, sort: '-views', featured: true }),
  });

  const posts = data?.data?.data || [];

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-500 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Fullstack · React · Node.js · MongoDB
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Publica tu contenido
            <br />
            <span className="bg-gradient-to-r from-green-500 via-green-500 to-green-600 bg-clip-text text-transparent">
              sin límites
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma de blogging profesional con autenticación JWT/OAuth, editor Markdown, 
            dashboard de métricas y arquitectura fullstack lista para producción.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5">
              Empezar gratis <ArrowRight size={18} />
            </Link>
            <Link to="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-2xl transition-all border border-white/10">
              Ver el blog
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Icon size={18} className="text-green-500" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Todo lo que necesitas, <span className="text-green-500">listo</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Arquitectura profesional con las mejores prácticas de la industria implementadas desde el primer commit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <Icon size={20} className="text-green-500" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT POSTS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">Posts <span className="text-green-500">destacados</span></h2>
          <Link to="/blog" className="text-sm text-green-500 hover:text-green-500 flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600">
            <p className="text-lg">No hay posts publicados aún.</p>
            <Link to="/dashboard/editor" className="mt-4 inline-block text-green-500 hover:underline text-sm">
              Crea el primero →
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative rounded-3xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(135deg,#00FF94 25%,transparent 25%,transparent 50%,#00FF94 50%,#00FF94 75%,transparent 75%)', backgroundSize: '6px 6px' }} />
          <h2 className="relative text-3xl font-bold mb-4">¿Listo para publicar?</h2>
          <p className="relative text-slate-400 mb-8">Crea tu cuenta gratis y empieza a compartir tu conocimiento hoy.</p>
          <Link to="/register"
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-green-500/30">
            Crear cuenta gratuita <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
