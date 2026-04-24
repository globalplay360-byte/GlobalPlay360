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

export default function PrelaunchPage() {
  /**
   * Per defecte intentem reproduir el vídeo. Només el desactivem si l'usuari
   * ha marcat explícitament `prefers-reduced-motion: reduce`.
   *
   * Abans ho bloquejàvem també si `navigator.connection.saveData === true`,
   * però a Android molts navegadors (Chrome, Samsung Internet, Opera) tenen
   * Data Saver activat per defecte, cosa que amagava el vídeo a gran part
   * del públic mòbil. Per una landing pre-launch on el vídeo és el punt
   * visual central, ho sobreescrivim: el cost real és mínim perquè el
   * <video> porta `preload="metadata"` (només baixa header, no el MP4 sencer
   * fins que entra en viewport i comença reproducció).
   */
  const [shouldPlayVideo, setShouldPlayVideo] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldPlayVideo(!mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setShouldPlayVideo(!e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    // min-h-[100svh] en lloc de min-h-screen: evita el problema clàssic de `100vh` a mòbil
    // (la barra d'URL de Chrome/Safari es recompta diferent i pot fer que el contingut
    // quedi parcialment fora de viewport visible).
    <div className="relative min-h-[100svh] overflow-hidden bg-[#020617] text-white">
      {shouldPlayVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50"
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
          className="absolute inset-0 h-full w-full bg-cover bg-center opacity-50"
          aria-hidden="true"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.44))]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.34)_0%,rgba(2,6,23,0.08)_45%,rgba(2,6,23,0.38)_100%)]" />

      <div className="absolute right-6 top-8 z-20 sm:right-10 lg:right-16 xl:right-20">
        <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md sm:text-sm">
          Proximamente
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-20 xl:px-24">
        <header className="h-8" aria-hidden="true">
          <div />
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-16 lg:py-20">
          <div className="prelaunch-logo-shell flex flex-col items-center justify-center text-center">
            <div className="prelaunch-logo-core">
              <Logo className="h-64 w-auto text-[#FFC107] sm:h-80 lg:h-[30rem] xl:h-[34rem]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
