import useAuthStore from '../context/authStore';
export default function ProfilePage() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xl font-bold text-white">{user?.name?.charAt(0)}</div>
        <div>
          <p className="font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 capitalize mt-1 inline-block">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}
