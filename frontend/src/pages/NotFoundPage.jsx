import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center text-center px-6">
      <div>
        <div className="text-8xl font-extrabold text-transparent bg-gradient-to-r from-green-500 to-green-600 bg-clip-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-500 text-white font-medium rounded-xl">Volver al inicio</Link>
      </div>
    </div>
  );
}
