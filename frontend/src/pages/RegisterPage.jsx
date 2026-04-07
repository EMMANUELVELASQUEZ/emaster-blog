import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Rss } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm({ defaultValues: { role: 'reader' } });
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try { await registerUser(data); toast.success('¡Cuenta creada!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Error al registrarse'); }
  };
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><Rss size={17} className="text-white"/></div>
            <span className="font-bold text-xl">Blog<span className="text-green-500">Platform</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('name')} placeholder="Nombre completo" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"/>
            <input {...register('email')} type="email" placeholder="tu@email.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"/>
            <input {...register('password')} type="password" placeholder="Contraseña (mín. 8 chars)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"/>
            <select {...register('role')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none">
              <option value="reader">Lector</option>
              <option value="author">Autor (puede publicar)</option>
            </select>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-500 hover:bg-green-500 text-white font-semibold rounded-xl text-sm">
              {isLoading ? 'Creando...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-5">¿Ya tienes cuenta? <Link to="/login" className="text-green-500">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
