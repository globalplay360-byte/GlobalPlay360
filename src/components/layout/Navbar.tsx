import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Banner Superior Daurat */}
      <div className="bg-[#FFC107] text-[#020C1B] py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center text-xs sm:text-sm font-medium gap-2 text-center">
          <span className="flex items-center gap-2">
            <span>👑</span> 
            <strong>Miembros Fundadores – Acceso Gratuito</strong>
            <span className="hidden md:inline text-black/50">•</span>
          </span>
          <span className="md:ml-2 font-medium">
            ¡Sé uno de los primeros 100 miembros en unirse y obtén acceso Premium gratis hasta el 1 de julio de 2026!
          </span>
          <Link to="/register" className="ml-0 md:ml-4 bg-[#0A192F] text-white px-4 py-1.5 rounded-full text-xs hover:bg-[#172A45] transition-colors whitespace-nowrap mt-2 md:mt-0">
            Reclama tu Estatus
          </Link>
        </div>
      </div>

      <nav className="bg-[#020C1B] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Links Izquierda */}
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="text-[#0070F3] text-2xl">🏆</span> Global Play 360
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Inicio
                </Link>
                <Link to="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button className="text-xs font-semibold bg-[#2D2D2D] text-white px-2 py-1 rounded">ES</button>
                <button className="text-xs font-semibold text-white/50 hover:text-white px-2 py-1">EN</button>
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm text-white/70 hover:text-[#FFC107] transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <span className="text-sm font-medium text-white">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium px-5 py-2 bg-[#0070F3] text-white rounded hover:bg-[#0051B3] transition-colors"
                  >
                    Registro
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
