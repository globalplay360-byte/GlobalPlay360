import { Link } from 'react-router-dom';

interface PremiumLockCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function PremiumLockCard({ 
  title = "Exclusiu per a usuaris Premium", 
  description = "Actualitza el teu pla per desbloquejar aquesta funcionalitat i interactuar directament amb aquest perfil.",
  className = ""
}: PremiumLockCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-[#111827] border border-[#1F2937] rounded-xl text-center shadow-lg relative overflow-hidden group ${className}`}>
      {/* Fons subtil per donar profunditat */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3B82F6]/5 to-transparent pointer-events-none" />
      
      <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 z-10">{title}</h3>
      <p className="text-[#9CA3AF] mb-6 max-w-md z-10">{description}</p>
      
      <Link
        to="/pricing"
        className="z-10 inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8] text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:shadow-[#3B82F6]/20"
      >
        Millora el teu Pla
      </Link>
    </div>
  );
}
