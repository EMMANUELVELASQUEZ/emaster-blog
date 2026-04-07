import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, PenSquare, User, LogOut,
  Rss, Menu, X, ChevronRight, Bell, Settings
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/posts', icon: FileText, label: 'Mis Posts' },
  { to: '/dashboard/editor', icon: PenSquare, label: 'Nuevo Post', roles: ['author', 'editor', 'admin'] },
  { to: '/dashboard/profile', icon: User, label: 'Perfil' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const canAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex font-sans text-slate-100">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0a0f1e] border-r border-white/5 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shrink-0">
            <Rss size={15} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-base whitespace-nowrap overflow-hidden">
              Blog<span className="text-green-500">Platform</span>
            </span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors z-10"
        >
          <ChevronRight size={12} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.filter(canAccess).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-green-500/15 text-green-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`
              }
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-2 py-3 border-t border-white/5 shrink-0">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title={!sidebarOpen ? 'Cerrar sesión' : ''}
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top bar */}
        <header className="h-16 bg-[#030712]/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Panel de Control</p>
            <h1 className="text-sm font-semibold text-slate-200">Bienvenido, {user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
            </button>
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Ver sitio
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
