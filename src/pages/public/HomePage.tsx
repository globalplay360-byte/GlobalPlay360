import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-[#0B1120] text-white">
      {/* Hero Section */}
      <section className="relative w-full h-[100vh] flex flex-col justify-center items-center overflow-hidden pt-16">
        
        <div className="absolute inset-0 bg-[#0B1120] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-transparent to-[#0B1120] opacity-80" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Donde el Talento Encuentra la <br />Oportunidad
          </h1>
          <p className="text-lg md:text-xl text-[#8892B0] mb-10 max-w-2xl">
            Conecta con jugadores, entrenadores y clubes de todo el mundo. <br />
            Desarrolla tu carrera deportiva con Global Play 360.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?type=jugador" className="flex items-center justify-center gap-2 bg-[#0070F3] hover:bg-[#0051B3] text-white px-8 py-3 rounded font-medium transition-colors w-full sm:w-auto">
              <span className="text-xl mb-1"></span> Soy Jugador
            </Link>
            <Link to="/register?type=entrenador" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 px-8 py-3 rounded font-medium transition-all w-full sm:w-auto">
              <span className="text-xl mb-1"></span> Soy Entrenador
            </Link>
            <Link to="/register?type=club" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 px-8 py-3 rounded font-medium transition-all w-full sm:w-auto">
              <span className="text-xl mb-1"></span> Soy Club
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#0A192F]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6">
            <span className="text-4xl block mb-4"></span>
            <h3 className="text-xl font-bold mb-3 text-white">Red Global</h3>
            <p className="text-[#8892B0]">Oportunidades internacionales para jugadores y entrenadores.</p>
          </div>
          <div className="p-6">
            <span className="text-4xl block mb-4"></span>
            <h3 className="text-xl font-bold mb-3 text-white">Scouting Pro</h3>
            <p className="text-[#8892B0]">Estadísticas detalladas y análisis de talento para clubes.</p>
          </div>
          <div className="p-6">
            <span className="text-4xl block mb-4"></span>
            <h3 className="text-xl font-bold mb-3 text-white">Conexión Directa</h3>
            <p className="text-[#8892B0]">Comunicación sin intermediarios entre profesionales.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
