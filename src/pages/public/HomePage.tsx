import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-[#0B1120] text-white">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[100vh] flex flex-col justify-center items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[#0B1120] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-transparent to-[#0B1120] opacity-80" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-semibold mb-5 leading-tight tracking-tight text-white">
            Donde el Talento Encuentra la <br /> Oportunidad
          </h1>
          <p className="text-lg md:text-xl font-light text-[#E2E8F0] mb-10 max-w-[600px] leading-relaxed">
            Conecta con jugadores, entrenadores y clubes de todo el mundo.
            Desarrolla tu carrera deportiva con Global Play 360.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?type=jugador" className="flex items-center justify-center gap-2 bg-[#0070F3] hover:bg-[#0051B3] text-white px-7 py-3.5 rounded-md font-medium transition-colors w-full sm:w-auto text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Soy Jugador
            </Link>
            <Link to="/register?type=entrenador" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 px-7 py-3.5 rounded-md font-medium transition-all w-full sm:w-auto text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Soy Entrenador
            </Link>
            <Link to="/register?type=club" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 px-7 py-3.5 rounded-md font-medium transition-all w-full sm:w-auto text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Soy Club
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Cómo Funciona */}
      <section className="py-24 px-4 bg-[#0A192F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cómo Funciona</h2>
            <p className="text-[#8892B0] text-lg max-w-2xl mx-auto">Únete a miles de atletas, entrenadores y clubes que ya están construyendo su futuro.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#020C1B] rounded-xl p-8 border border-white/10 relative overflow-hidden group hover:border-[#0070F3] transition-colors">
              <div className="text-5xl font-black text-white/5 absolute -top-4 -right-2">01</div>
              <svg className="w-10 h-10 mb-6 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <h3 className="text-xl font-bold mb-3 text-white">Crea tu Perfil</h3>
              <p className="text-[#8892B0] text-sm leading-relaxed">Muestra tus habilidades, estadísticas y videos destacados.</p>
            </div>
            
            <div className="bg-[#020C1B] rounded-xl p-8 border border-white/10 relative overflow-hidden group hover:border-[#0070F3] transition-colors">
              <div className="text-5xl font-black text-white/5 absolute -top-4 -right-2">02</div>
              <svg className="w-10 h-10 mb-6 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <h3 className="text-xl font-bold mb-3 text-white">Descubre Oportunidades</h3>
              <p className="text-[#8892B0] text-sm leading-relaxed">Encuentra ofertas de clubes y perfiles compatibles fácilmente.</p>
            </div>

            <div className="bg-[#020C1B] rounded-xl p-8 border border-white/10 relative overflow-hidden group hover:border-[#0070F3] transition-colors">
              <div className="text-5xl font-black text-white/5 absolute -top-4 -right-2">03</div>
              <svg className="w-10 h-10 mb-6 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="text-xl font-bold mb-3 text-white">Conecta y Aplica</h3>
              <p className="text-[#8892B0] text-sm leading-relaxed">Envía mensajes directos y aplica a posiciones abiertas.</p>
            </div>

            <div className="bg-[#020C1B] rounded-xl p-8 border border-white/10 relative overflow-hidden group hover:border-[#0070F3] transition-colors">
              <div className="text-5xl font-black text-white/5 absolute -top-4 -right-2">04</div>
              <svg className="w-10 h-10 mb-6 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <h3 className="text-xl font-bold mb-3 text-white">Sube de Nivel</h3>
              <p className="text-[#8892B0] text-sm leading-relaxed">Acelera tu carrera profesional en el mundo del deporte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pricing / Gratis vs Premium */}
      <section className="py-24 px-4 bg-[#020C1B]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Gratis vs Premium</h2>
            <p className="text-[#8892B0] text-lg max-w-2xl mx-auto">Elige el plan que se adapte a tus metas y acelera tu carrera.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Free Plan */}
            <div className="bg-[#0A192F] rounded-2xl p-8 border border-white/10 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Plan Gratuito</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-white">0€</span>
                  <span className="text-[#8892B0]">/mes</span>
                </div>
                <p className="text-[#8892B0] text-sm">Visibilidad básica para atletas aspirantes</p>
              </div>
              
              <ul className="space-y-4 mb-8 text-sm text-[#E2E8F0]">
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Perfil Básico</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Búsqueda Limitada</li>
                <li className="flex items-center gap-3 opacity-40"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg> <s className="line-through">Mensajería Ilimitada</s></li>
                <li className="flex items-center gap-3 opacity-40"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg> <s className="line-through">Prioridad de Búsqueda</s></li>
                <li className="flex items-center gap-3 opacity-40"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg> <s className="line-through">Herramientas de Video y PDF</s></li>
              </ul>
              
              <Link to="/register" className="block w-full py-3 px-4 text-center rounded-lg border border-white/20 text-white hover:bg-white/5 font-semibold transition-colors">
                Registrarse Plan Gratuito
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-[#112240] to-[#0A192F] rounded-2xl p-8 border-2 border-[#0070F3] shadow-[0_0_30px_rgba(0,112,243,0.15)] relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0070F3] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                MÁS POPULAR
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Plan Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-[#0070F3]">25€</span>
                  <span className="text-[#8892B0]">/mes</span>
                </div>
                <p className="text-[#8892B0] text-sm">Herramientas profesionales para carreras serias</p>
              </div>
              
              <ul className="space-y-4 mb-8 text-sm text-[#E2E8F0]">
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Perfil Mejorado</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Búsqueda Ilimitada</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#0070F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Mensajería Ilimitada</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#FFC107]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Prioridad de Búsqueda y Soporte</li>
                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#FFC107]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Herramientas de Video y PDF</li>
              </ul>
              
              <Link to="/pricing" className="block w-full py-3 px-4 text-center rounded-lg bg-[#0070F3] text-white hover:bg-[#0051B3] font-semibold transition-colors shadow-lg">
                Actualizar Ahora
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Social & Community CTA */}
      <section className="py-20 px-4 bg-[#0A192F] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Síguenos en Redes Sociales</h2>
          <p className="text-[#8892B0] text-lg mb-8 max-w-xl mx-auto">
            Únete a nuestra comunidad y mantente al día con las últimas oportunidades y noticias deportivas.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="w-12 h-12 rounded-full bg-[#020C1B] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#0070F3] transition-all">
              {/* Fake X / Twitter icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="w-12 h-12 rounded-full bg-[#020C1B] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#0070F3] transition-all">
              {/* Fake Instagram icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
