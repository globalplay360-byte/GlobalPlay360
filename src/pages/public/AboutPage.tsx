import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

const SectionContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full px-4 sm:px-8 lg:px-12 xl:px-16 ${className}`}>
    {children}
  </div>
);

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-hidden relative">
      {/* Estils d'animació injectats si volem el shine també aquí */}
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          background: linear-gradient(
            120deg,
            #3B82F6 20%,
            #93C5FD 40%,
            #FFFFFF 50%,
            #93C5FD 60%,
            #3B82F6 80%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 4s linear infinite;
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center">
        {/* Glow Effects de Fons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vw] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

        <SectionContainer className="z-10 relative">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto space-y-8"
          >
            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tighter text-white whitespace-normal md:whitespace-nowrap drop-shadow-xl"
            >
              {t('aboutPage.hero.titleL1', 'Revolutionizing the')} <br className="hidden md:block"/>
              <span className="font-bold animate-shine px-2 inline-block mt-2">
                {t('aboutPage.hero.titleL2', 'Business of Sports')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl font-normal text-white/90 mb-10 max-w-[600px] mx-auto leading-relaxed drop-shadow-md"
            >
              {t('aboutPage.hero.subtitle', 'Global Play 360 is the premier platform connecting athletes, coaches, and sports organizations worldwide. Our mission is to democratize access to sports opportunities and empower professionals to reach their full potential.')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-7 py-3.5 rounded-lg font-medium transition-all duration-200 ease-out active:scale-[0.98] w-full sm:w-auto text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {t('aboutPage.hero.ctaPrimary', 'Get Started')}
              </Link>
              <Link to="/" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 px-7 py-3.5 rounded-lg font-medium transition-all duration-200 ease-out active:scale-[0.98] w-full sm:w-auto text-sm">
                {t('aboutPage.hero.ctaSecondary', 'Back to Home')}
              </Link>
            </motion.div>
          </motion.div>
        </SectionContainer>
      </section>

      {/* --- WHO WE SERVE SECTION ---
          Graella de 3 targetes amb Hover Parallax / Glow
      */}
      <section className="py-24 relative overflow-hidden">
        {/* Premium Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover object-[center_65%] z-0"
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/nosotros.mp4?alt=media&token=05bbb516-95c2-475e-b8d3-ee2e78565b59" type="video/mp4" />
        </video>

        {/* Overlay elegant SaaS (40%) i difuminat a la part inferior per fusió */}
        <div className="absolute inset-0 bg-[#0B1120]/40 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-0" />

        <SectionContainer className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
              className="mb-20 max-w-4xl"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                {/* Animated Arrow - Visible on medium screens and up */}
                <motion.div
                  animate={{ x: [0, 15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="hidden md:flex flex-shrink-0 items-center justify-center text-[#3B82F6]"
                >
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>

                {/* Text Block */}
                <div>
                  <span className="text-[#3B82F6] font-semibold tracking-widest uppercase text-xs md:text-sm mb-3 block">
                    {t('aboutPage.serve.kicker', 'Professional sports office')}
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tighter">
                    {t('aboutPage.serve.title', 'Who We Serve')}
                  </h2>
                  <p className="text-white/80 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                    {t('aboutPage.serve.subtitle', 'Our platform is designed to meet the unique needs of every participant in the sports ecosystem.')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Grid de 3 Pilars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* For Players */}
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 rounded-2xl p-8 lg:p-10 cursor-default overflow-hidden"
              >
                {/* Glow del ratolí a la vora de la targeta */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/0 via-[#3B82F6]/5 to-[#3B82F6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 relative z-10 tracking-tight">{t('aboutPage.serve.players.title', 'For Players')}</h3>
                <p className="text-white/70 leading-relaxed relative z-10 font-light text-sm md:text-base">
                  {t('aboutPage.serve.players.desc', 'Showcase your skills with a professional profile, find open trials, connect with clubs directly, and take the next big step in your sporting career.')}
                </p>
              </motion.div>

              {/* For Coaches */}
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
                className="group relative bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 rounded-2xl p-8 lg:p-10 cursor-default overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/0 via-[#3B82F6]/5 to-[#3B82F6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 relative z-10 tracking-tight">{t('aboutPage.serve.coaches.title', 'For Coaches')}</h3>
                <p className="text-white/70 leading-relaxed relative z-10 font-light text-sm md:text-base">
                  {t('aboutPage.serve.coaches.desc', 'Discover new coaching opportunities, build your professional network, and connect with organizations looking for your specific expertise and tactical vision.')}
                </p>
              </motion.div>

              {/* For Clubs */}
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="group relative bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 rounded-2xl p-8 lg:p-10 cursor-default overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/0 via-[#3B82F6]/5 to-[#3B82F6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="text-xl md:text-2xl font-medium text-white mb-4 relative z-10 tracking-tight">{t('aboutPage.serve.clubs.title', 'For Clubs')}</h3>
                <p className="text-white/70 leading-relaxed relative z-10 font-light text-sm md:text-base">
                  {t('aboutPage.serve.clubs.desc', 'Post open positions, scout verified talent globally, manage incoming applications efficiently, and build your championship-winning team.')}
                </p>
              </motion.div>
            </div>
         </SectionContainer>
      </section>

      {/* --- LIVE METRICS SECTION --- */}
      <LiveMetricsSection />

      {/* --- TECH STACK SECTION --- */}
      <TechStackSection />

      {/* --- ARCHITECTURE & SECURITY SECTION --- */}
      <ArchitectureSection />

      {/* --- ROADMAP SECTION --- */}
      <RoadmapSection />

      {/* --- FOUNDING MEMBERS CTA --- */}
      <FoundingMembersSection />

      {/* --- CLOSING CONTACT --- */}
      <ClosingContactSection />
    </div>
  );
};

// ───────────────────────────────────────────────
// LIVE METRICS — comptadors reals des de Firestore
// ───────────────────────────────────────────────
type Counts = {
  players: number | null;
  coaches: number | null;
  clubs: number | null;
  opportunities: number | null;
};

function LiveMetricsSection() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<Counts>({
    players: null,
    coaches: null,
    clubs: null,
    opportunities: null,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchCounts = async () => {
      try {
        const usersCol = collection(db, 'users');
        const [players, coaches, clubs, opportunities] = await Promise.all([
          getCountFromServer(query(usersCol, where('role', '==', 'player'))),
          getCountFromServer(query(usersCol, where('role', '==', 'coach'))),
          getCountFromServer(query(usersCol, where('role', '==', 'club'))),
          getCountFromServer(collection(db, 'opportunities')),
        ]);
        if (cancelled) return;
        setCounts({
          players: players.data().count,
          coaches: coaches.data().count,
          clubs: clubs.data().count,
          opportunities: opportunities.data().count,
        });
      } catch {
        if (!cancelled) setCounts({ players: 0, coaches: 0, clubs: 0, opportunities: 0 });
      }
    };
    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  const metrics = [
    { value: counts.players, label: t('aboutPage.metrics.players', 'Players') },
    { value: counts.coaches, label: t('aboutPage.metrics.coaches', 'Coaches') },
    { value: counts.clubs, label: t('aboutPage.metrics.clubs', 'Clubs') },
    { value: counts.opportunities, label: t('aboutPage.metrics.opportunities', 'Opportunities') },
  ];

  return (
    <section className="relative py-24 border-y border-white/5 bg-gradient-to-b from-[#0B1120] via-[#0A1628] to-[#0B1120]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />

      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-[#3B82F6] font-semibold tracking-widest uppercase text-xs mb-3 block">
            {t('aboutPage.metrics.kicker', 'Live from Firestore')}
          </span>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">
            {t('aboutPage.metrics.title', 'Real numbers, real momentum')}
          </h2>
          <p className="text-white/70 text-base md:text-lg font-light">
            {t('aboutPage.metrics.subtitle', 'Not placeholders. These figures update in real time as our community grows.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="relative bg-[#111827]/60 border border-[#1F2937] rounded-2xl p-6 md:p-8 text-center backdrop-blur-sm"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight tabular-nums">
                <AnimatedCount value={m.value} />
                <span className="text-[#3B82F6] text-2xl md:text-3xl ml-1 font-semibold">+</span>
              </div>
              <p className="text-white/60 text-xs md:text-sm uppercase tracking-wider font-medium">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

function AnimatedCount({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  if (value === null) {
    return <span className="inline-block w-20 h-10 bg-white/5 rounded-md animate-pulse" />;
  }
  return <>{display.toLocaleString('es-ES')}</>;
}

// ───────────────────────────────────────────────
// TECH STACK — el stack modern que fa anar la plataforma
// ───────────────────────────────────────────────
function TechStackSection() {
  const { t } = useTranslation();
  const techs = [
    { name: 'React 18', role: t('aboutPage.stack.react', 'UI Framework'), color: '#61DAFB' },
    { name: 'TypeScript', role: t('aboutPage.stack.typescript', 'Type Safety'), color: '#3178C6' },
    { name: 'Vite', role: t('aboutPage.stack.vite', 'Build Tool'), color: '#A855F7' },
    { name: 'Tailwind CSS', role: t('aboutPage.stack.tailwind', 'Styling'), color: '#06B6D4' },
    { name: 'Firebase Auth', role: t('aboutPage.stack.auth', 'Authentication'), color: '#FFA000' },
    { name: 'Firestore', role: t('aboutPage.stack.firestore', 'Real-time DB'), color: '#FFA000' },
    { name: 'Cloud Functions', role: t('aboutPage.stack.functions', 'Serverless Logic'), color: '#FFA000' },
    { name: 'Firebase Storage', role: t('aboutPage.stack.storage', 'Media Files'), color: '#FFA000' },
    { name: 'Stripe', role: t('aboutPage.stack.stripe', 'Payments'), color: '#635BFF' },
    { name: 'Framer Motion', role: t('aboutPage.stack.motion', 'Animations'), color: '#EC4899' },
    { name: 'i18next', role: t('aboutPage.stack.i18n', 'Multi-language'), color: '#10B981' },
    { name: 'React Router', role: t('aboutPage.stack.router', 'Navigation'), color: '#F43F5E' },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#3B82F6] font-semibold tracking-widest uppercase text-xs mb-3 block">
            {t('aboutPage.stack.kicker', 'Engineered with care')}
          </span>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">
            {t('aboutPage.stack.title', 'Built on a modern stack')}
          </h2>
          <p className="text-white/70 text-base md:text-lg font-light">
            {t('aboutPage.stack.subtitle', 'No shortcuts. Every piece of the stack is picked for scale, speed and developer experience.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {techs.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group relative bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/40 rounded-xl p-5 overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-full h-0.5 opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${tech.color}, transparent)` }}
              />
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-lg"
                  style={{ background: tech.color, boxShadow: `0 0 10px ${tech.color}80` }}
                />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{tech.name}</p>
                  <p className="text-white/50 text-xs truncate">{tech.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ───────────────────────────────────────────────
// ARCHITECTURE & SECURITY — pilars tècnics
// ───────────────────────────────────────────────
function ArchitectureSection() {
  const { t } = useTranslation();
  const pillars = [
    {
      title: t('aboutPage.arch.stripe.title', 'Stripe-grade payments'),
      desc: t('aboutPage.arch.stripe.desc', 'Built on the same infrastructure that powers Zoom and Shopify. We never store card data on our servers.'),
      iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m3 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H10a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      accent: '#635BFF',
    },
    {
      title: t('aboutPage.arch.auth.title', 'Enterprise-grade authentication'),
      desc: t('aboutPage.arch.auth.desc', 'Firebase Auth with email verification, secure password reset and Google Sign-in. Sessions handled server-side.'),
      iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      accent: '#FFA000',
    },
    {
      title: t('aboutPage.arch.gdpr.title', 'GDPR-first by design'),
      desc: t('aboutPage.arch.gdpr.desc', 'Data hosted in europe-west1. Right to erasure implemented via Cloud Functions. Transparent privacy controls.'),
      iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      accent: '#10B981',
    },
    {
      title: t('aboutPage.arch.realtime.title', 'Real-time synchronization'),
      desc: t('aboutPage.arch.realtime.desc', 'Firestore listeners and Stripe webhooks keep every subscription, chat and application in sync across devices instantly.'),
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
      accent: '#3B82F6',
    },
  ];

  return (
    <section className="py-24 md:py-32 relative bg-[#0A1020] border-y border-white/5">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none" />

      <SectionContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#3B82F6] font-semibold tracking-widest uppercase text-xs mb-3 block">
            {t('aboutPage.arch.kicker', 'Under the hood')}
          </span>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">
            {t('aboutPage.arch.title', 'Architecture & Security')}
          </h2>
          <p className="text-white/70 text-base md:text-lg font-light">
            {t('aboutPage.arch.subtitle', 'We take infrastructure seriously so you can focus on sport.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className="group relative bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/40 rounded-2xl p-8 overflow-hidden"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
                style={{
                  background: `${p.accent}15`,
                  borderColor: `${p.accent}30`,
                  color: p.accent,
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={p.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{p.title}</h3>
              <p className="text-white/65 leading-relaxed text-sm md:text-base font-light">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ───────────────────────────────────────────────
// ROADMAP — Kanban públic (Shipped / In progress / Coming)
// ───────────────────────────────────────────────
function RoadmapSection() {
  const { t } = useTranslation();
  const columns = [
    {
      label: t('aboutPage.roadmap.shippedLabel', 'Shipped'),
      status: 'shipped' as const,
      items: [
        t('aboutPage.roadmap.shipped.1', 'Multi-sport player profiles'),
        t('aboutPage.roadmap.shipped.2', 'Opportunities marketplace'),
        t('aboutPage.roadmap.shipped.3', 'Real-time chat with paywalls'),
        t('aboutPage.roadmap.shipped.4', 'Stripe Premium subscriptions'),
        t('aboutPage.roadmap.shipped.5', 'Custom password reset & email verify'),
        t('aboutPage.roadmap.shipped.6', 'Full i18n — EN / ES / CA'),
      ],
    },
    {
      label: t('aboutPage.roadmap.progressLabel', 'In progress'),
      status: 'progress' as const,
      items: [
        t('aboutPage.roadmap.progress.1', 'Club verification badges'),
        t('aboutPage.roadmap.progress.2', 'Profile analytics dashboard'),
        t('aboutPage.roadmap.progress.3', 'Email notifications on applications'),
      ],
    },
    {
      label: t('aboutPage.roadmap.comingLabel', 'Coming soon'),
      status: 'coming' as const,
      items: [
        t('aboutPage.roadmap.coming.1', 'Native mobile apps (iOS / Android)'),
        t('aboutPage.roadmap.coming.2', 'Video highlights & AI tagging'),
        t('aboutPage.roadmap.coming.3', 'Smart matchmaking'),
        t('aboutPage.roadmap.coming.4', 'Advanced club scouting tools'),
      ],
    },
  ];

  const styles = {
    shipped: { dot: '#10B981', glow: 'rgba(16,185,129,0.15)' },
    progress: { dot: '#FFC107', glow: 'rgba(255,193,7,0.15)' },
    coming: { dot: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
  };

  return (
    <section className="py-24 md:py-32 relative">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#3B82F6] font-semibold tracking-widest uppercase text-xs mb-3 block">
            {t('aboutPage.roadmap.kicker', 'Radical transparency')}
          </span>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-4">
            {t('aboutPage.roadmap.title', 'Our public roadmap')}
          </h2>
          <p className="text-white/70 text-base md:text-lg font-light">
            {t('aboutPage.roadmap.subtitle', 'What we have shipped, what we are building and what is coming next.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {columns.map((col, i) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 lg:p-7"
            >
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: styles[col.status].dot, boxShadow: `0 0 12px ${styles[col.status].glow}` }}
                />
                <h3 className="text-white font-semibold tracking-tight text-sm uppercase">
                  {col.label}
                </h3>
                <span className="ml-auto text-white/40 text-xs tabular-nums">{col.items.length}</span>
              </div>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/75 text-sm leading-relaxed">
                    <span
                      className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                      style={{ background: styles[col.status].dot }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ───────────────────────────────────────────────
// FOUNDING MEMBERS — CTA emocional
// ───────────────────────────────────────────────
function FoundingMembersSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),rgba(59,130,246,0.05)_40%,transparent_70%)] blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFC107]/40 to-transparent" />

      <SectionContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-b from-[#112240] to-[#0A192F] border border-[#FFC107]/20 rounded-3xl p-8 md:p-14 shadow-[0_0_60px_rgba(59,130,246,0.1)]"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-xs font-semibold uppercase tracking-widest mb-6">
            <span>👑</span>
            {t('aboutPage.founding.badge', 'Founding Members · Free until July 1, 2026')}
          </span>

          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white mb-5">
            {t('aboutPage.founding.title', 'Be one of the first 100')}
          </h2>
          <p className="text-white/75 text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">
            {t('aboutPage.founding.subtitle', 'Join GlobalPlay360 as a Founding Member: unlimited Premium access, private roadmap input and early-bird pricing for life.')}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('aboutPage.founding.placeholder', 'Your email address')}
              className="flex-1 bg-[#0A192F] border border-white/10 text-white placeholder:text-white/40 rounded-lg px-5 py-3 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
            />
            <button
              type="submit"
              className="bg-[#FFC107] hover:bg-[#FFD54F] text-[#020C1B] font-bold px-7 py-3 rounded-lg text-sm transition-all active:scale-[0.98] whitespace-nowrap shadow-[0_0_20px_rgba(255,193,7,0.25)]"
            >
              {subscribed
                ? t('aboutPage.founding.success', 'Claimed ✓')
                : t('aboutPage.founding.cta', 'Claim my status')}
            </button>
          </form>

          <p className="text-xs text-white/40">
            {t('aboutPage.founding.privacy', 'No spam. Unsubscribe anytime. Pure sports community.')}
          </p>
        </motion.div>
      </SectionContainer>
    </section>
  );
}

// ───────────────────────────────────────────────
// CLOSING CONTACT — bloc final minimal
// ───────────────────────────────────────────────
function ClosingContactSection() {
  const { t } = useTranslation();
  return (
    <section className="relative py-28 md:py-36 border-t border-white/5 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/Newspaper.mp4?alt=media&token=ce8b574c-f399-4462-bc3f-2f69e59384d1" type="video/mp4" />
      </video>

      {/* Overlay molt suau (30%) i degradat elegant superior per fondre's amb la secció de dalt */}
      <div className="absolute inset-0 bg-[#0B1120]/30 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/80 via-transparent to-transparent z-0" />

      <SectionContainer className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-white mb-5">
            {t('aboutPage.closing.title', 'Partnerships, press or a bold idea?')}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto font-light">
            {t('aboutPage.closing.subtitle', 'We read every email. If GlobalPlay360 resonates with your organization, let’s build something.')}
          </p>
          <a
            href="mailto:hello@globalplay360.com"
            className="inline-flex items-center gap-3 text-white hover:text-[#3B82F6] text-base md:text-lg font-medium transition-colors group"
          >
            <span>hello@globalplay360.com</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </SectionContainer>
    </section>
  );
}

export default AboutPage;
