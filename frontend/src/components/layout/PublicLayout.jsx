import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Terminal, LogIn, LayoutDashboard, LogOut, User, ChevronDown, Github, Youtube } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesion cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: '#e2ffe8' }}>
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={scrolled ? { background: 'rgba(3,10,5,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,255,148,0.1)' } : {}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,255,148,0.1)', border: '1px solid rgba(0,255,148,0.3)' }}>
                <Terminal size={15} style={{ color: '#00FF94' }} />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#00FF94', textShadow: '0 0 20px rgba(0,255,148,0.4)' }}>
                Emaster<span style={{ color: '#e2ffe8' }}>Blog</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[['/', 'inicio'], ['/blog', 'blog']].map(([to, label]) => (
                <NavLink key={to} to={to} end
                  style={({ isActive }) => ({
                    padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem',
                    fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: isActive ? '#00FF94' : '#6aad78',
                    background: isActive ? 'rgba(0,255,148,0.08)' : 'transparent',
                    transition: 'all 0.2s',
                  })}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(0,255,148,0.15)', border: '1px solid rgba(0,255,148,0.3)', color: '#00FF94', fontFamily: 'JetBrains Mono, monospace' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: '#a3d4aa' }}>{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} style={{ color: '#6aad78' }} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden"
                      style={{ background: '#060f08', border: '1px solid rgba(0,255,148,0.15)', boxShadow: '0 0 30px rgba(0,255,148,0.1)' }}>
                      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,255,148,0.08)' }}>
                        <p className="text-xs" style={{ color: '#6aad78' }}>Conectado como</p>
                        <p className="text-sm font-medium truncate" style={{ color: '#e2ffe8' }}>{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm"
                        style={{ color: '#a3d4aa' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,148,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <LayoutDashboard size={14} style={{ color: '#00FF94' }} /> Dashboard
                      </Link>
                      <Link to="/dashboard/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm"
                        style={{ color: '#a3d4aa' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,148,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <User size={14} style={{ color: '#00FF94' }} /> Perfil
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm"
                        style={{ color: '#ff6b6b' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <LogOut size={14} /> Cerrar sesion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 text-sm transition-colors"
                    style={{ color: '#6aad78', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00FF94'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6aad78'}>
                    <LogIn size={14} /> entrar
                  </Link>
                  <Link to="/register" className="btn-neon px-4 py-2 text-sm">&gt;_ iniciar</Link>
                </>
              )}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" style={{ color: '#00FF94' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-4 py-4 space-y-2"
            style={{ background: '#060f08', borderTop: '1px solid rgba(0,255,148,0.08)' }}>
            {[['/', 'Inicio'], ['/blog', 'Blog']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm"
                style={{ color: '#a3d4aa', fontFamily: 'JetBrains Mono, monospace' }}>{label}</Link>
            ))}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm"
                style={{ color: '#ff6b6b' }}>Cerrar sesion</button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm" style={{ color: '#a3d4aa' }}>Iniciar sesion</Link>
            )}
          </div>
        )}
      </nav>

      <main><Outlet /></main>

      <footer style={{ borderTop: '1px solid rgba(0,255,148,0.08)', marginTop: '6rem' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={16} style={{ color: '#00FF94' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00FF94' }}>
                  Emaster<span style={{ color: '#e2ffe8' }}>Blog</span>
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: '#6aad78' }}>
                Blog de Emmanuel Velasquez — Ing. en Desarrollo de Software. Veracruz, Mexico
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/EMMANUELVELASQUEZ" target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg transition-all"
                  style={{ color: '#6aad78', border: '1px solid rgba(0,255,148,0.12)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00FF94'; e.currentTarget.style.borderColor = 'rgba(0,255,148,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6aad78'; e.currentTarget.style.borderColor = 'rgba(0,255,148,0.12)'; }}>
                  <Github size={16} />
                </a>
                <a href="https://youtube.com/@elgranemaster5528e" target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg transition-all"
                  style={{ color: '#6aad78', border: '1px solid rgba(0,255,148,0.12)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00FF94'; e.currentTarget.style.borderColor = 'rgba(0,255,148,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6aad78'; e.currentTarget.style.borderColor = 'rgba(0,255,148,0.12)'; }}>
                  <Youtube size={16} />
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#00FF94', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Stack</h4>
              <ul className="space-y-2">
                {['React 18', 'Node.js + Express', 'MongoDB', 'JWT Auth', 'Tailwind CSS'].map(tech => (
                  <li key={tech} className="flex items-center gap-2 text-sm" style={{ color: '#6aad78' }}>
                    <span style={{ color: '#00FF94' }}>▸</span> {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(0,255,148,0.06)' }}>
            <p style={{ color: '#3a6644', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
              2026 EmasterBlog
            </p>
            <p style={{ color: '#3a6644', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
              print("Programar se escribe programando")
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
