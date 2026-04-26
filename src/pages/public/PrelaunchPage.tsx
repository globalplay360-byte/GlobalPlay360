import { Logo } from '@/components/ui/Logo';

const heroVideoUrl =
  'https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/global_home.mp4?alt=media&token=d56dab23-e1be-4f3a-a9b6-bd7faeba7b4b';

const wrapperStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
  background: '#020617',
};

const videoStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.5,
  zIndex: 0,
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  background: 'linear-gradient(180deg, rgba(2,6,23,0.20) 0%, rgba(2,6,23,0.50) 100%)',
  pointerEvents: 'none',
};

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  boxSizing: 'border-box',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  zIndex: 3,
  padding: '0.45rem 0.9rem',
  borderRadius: 9999,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.08)',
  fontSize: '0.65rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.25em',
  color: 'rgba(255,255,255,0.85)',
  WebkitBackdropFilter: 'blur(10px)',
  backdropFilter: 'blur(10px)',
};

const logoStyle: React.CSSProperties = {
  width: 'min(70vw, 22rem)',
  height: 'auto',
  color: '#FFC107',
  display: 'block',
  filter: 'drop-shadow(0 18px 50px rgba(255,193,7,0.25))',
};

export default function PrelaunchPage() {
  return (
    <div style={wrapperStyle}>
      <video
        style={videoStyle}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        src={heroVideoUrl}
      />
      <div style={overlayStyle} />
      <div style={badgeStyle}>Proximamente</div>
      <div style={contentStyle}>
        <Logo style={logoStyle} />
      </div>
    </div>
  );
}
