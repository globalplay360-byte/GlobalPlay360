import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

const heroVideoUrl =
  'https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/global_home.mp4?alt=media&token=d56dab23-e1be-4f3a-a9b6-bd7faeba7b4b';

const posterSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="55%" stop-color="#0B1120" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <radialGradient id="glow" cx="68%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.42" />
        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)" />
    <rect width="1600" height="900" fill="url(#glow)" />
    <circle cx="1300" cy="170" r="210" fill="#38BDF8" opacity="0.08" />
    <circle cx="260" cy="760" r="280" fill="#1D4ED8" opacity="0.10" />
  </svg>
`);

const posterUrl = `data:image/svg+xml;charset=UTF-8,${posterSvg}`;

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

const audienceCards = [
  {
    title: 'Soy Jugador',
    description: 'Muestra tu perfil, gana visibilidad y conecta con nuevas oportunidades deportivas.',
  },
  {
    title: 'Soy Entrenador',
    description: 'Accede a nuevos proyectos, visibiliza tu experiencia y amplía tu red profesional.',
  },
  {
    title: 'Soy Club',
    description: 'Publica necesidades reales, detecta talento y crea conexiones de valor internacional.',
  },
];

export default function PrelaunchPage() {
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as NavigatorWithConnection).connection;

    setShouldPlayVideo(!mediaQuery.matches && !connection?.saveData);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {shouldPlayVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterUrl}
          aria-hidden="true"
          src={heroVideoUrl}
        />
      ) : (
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center opacity-30"
          aria-hidden="true"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),_transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.52),rgba(2,6,23,0.92))]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.34)_45%,rgba(2,6,23,0.8)_100%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo className="h-16 w-auto text-white sm:h-20" />
          <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md sm:text-sm">
            Proximamente
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-16 lg:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-14">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#3B82F6]/30 bg-[#0F172A]/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#93C5FD] shadow-[0_0_0_1px_rgba(59,130,246,0.08)] backdrop-blur-md">
                Plataforma en preparacion privada
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
                Donde el Talento Encuentra la Oportunidad
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/88 sm:text-lg">
                Conecta con jugadores, entrenadores y clubes de todo el mundo. Desarrolla tu carrera
                deportiva con Global Play 360.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                {audienceCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-full border border-white/14 bg-white/8 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(2,6,23,0.28)] backdrop-blur-md"
                  >
                    {card.title}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="inline-flex items-center justify-center rounded-xl bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.28)]">
                  Informaremos proximamente
                </div>
                <p className="text-sm leading-6 text-slate-300/78">
                  Estamos cerrando informacion legal, pasarela de pago en modo live y ultimos detalles
                  de lanzamiento para abrir la plataforma al publico.
                </p>
              </div>
            </div>

            <aside className="flex items-end lg:justify-end">
              <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.92))] p-6 shadow-[0_24px_90px_rgba(2,6,23,0.48)] backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/8 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#93C5FD]">Global Play 360</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Lanzamiento controlado
                    </h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Pre-launch
                  </div>
                </div>

                <div className="space-y-4">
                  {audienceCards.map((card, index) => (
                    <article
                      key={card.title}
                      className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4ED8]/30 text-sm font-semibold text-[#BFDBFE]">
                          0{index + 1}
                        </div>
                        <h3 className="text-lg font-medium text-white">{card.title}</h3>
                      </div>
                      <p className="text-sm leading-6 text-slate-300/82">{card.description}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-[#0B1120]/80 p-5 text-sm leading-6 text-slate-300/78">
                  El clip temporal ya está reducido a aproximadamente 1,47 MB y la landing evita la
                  reproducción automática en dispositivos con ahorro de datos o movimiento reducido.
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
