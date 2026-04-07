import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Terminal, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Contrasena requerida'),
});

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(0,255,148,0.06) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,148,0.1)', border: '1px solid rgba(0,255,148,0.3)' }}>
              <Terminal size={17} style={{ color: '#00FF94' }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.2rem', color: '#00FF94' }}>
              Emaster<span style={{ color: '#e2ffe8' }}>Blog</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#e2ffe8', fontFamily: 'JetBrains Mono, monospace' }}>
            &gt;_ login
          </h1>
          <p className="text-sm" style={{ color: '#6aad78' }}>Accede a tu plataforma de contenido</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: '#060f08', border: '1px solid rgba(0,255,148,0.15)', boxShadow: '0 0 40px rgba(0,255,148,0.05)' }}>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5" style={{ color: '#6aad78' }}>email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a55' }} />
                <input {...register('email')} type="email" placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(0,255,148,0.04)', border: `1px solid ${errors.email ? '#ff6b6b' : 'rgba(0,255,148,0.15)'}`, color: '#e2ffe8', fontFamily: 'JetBrains Mono, monospace' }}
                  onFocus={e => e.target.style.borderColor = '#00FF94'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ff6b6b' : 'rgba(0,255,148,0.15)'} />
              </div>
              {errors.email && <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#ff6b6b' }}><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono" style={{ color: '#6aad78' }}>password</label>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a55' }} />
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(0,255,148,0.04)', border: `1px solid ${errors.password ? '#ff6b6b' : 'rgba(0,255,148,0.15)'}`, color: '#e2ffe8', fontFamily: 'JetBrains Mono, monospace' }}
                  onFocus={e => e.target.style.borderColor = '#00FF94'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ff6b6b' : 'rgba(0,255,148,0.15)'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a55' }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#ff6b6b' }}><AlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-neon w-full py-3 text-sm justify-center mt-2">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(3,10,5,0.3)', borderTopColor: '#030a05' }} />
                  conectando...
                </span>
              ) : '> _ iniciar sesion'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#4a7a55' }}>
            Sin cuenta?{' '}
            <Link to="/register" className="font-mono transition-colors" style={{ color: '#00FF94' }}
              onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 10px rgba(0,255,148,0.5)'}
              onMouseLeave={e => e.currentTarget.style.textShadow = ''}>
              registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
