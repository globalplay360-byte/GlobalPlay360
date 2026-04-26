import { Logo } from '@/components/ui/Logo';

export default function PrelaunchPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0A192F',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.06)',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        Proximamente
      </div>

      <Logo
        style={{
          width: 'min(70vw, 22rem)',
          height: 'auto',
          color: '#FFC107',
          display: 'block',
        }}
      />
    </div>
  );
}
