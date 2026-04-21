import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PremiumLockCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function PremiumLockCard({
  title,
  description,
  className = ""
}: PremiumLockCardProps) {
  const { t } = useTranslation();
  const finalTitle = title || t('premiumLock.defaultTitle', 'Això és un contingut Premium');
  const finalDescription = description || t('premiumLock.defaultDesc', 'Aquest contingut és exclusiu. Millora el teu pla per tenir-hi accés.');

  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-[#111827] border border-[#1F2937] rounded-xl text-center shadow-lg relative overflow-hidden group ${className}`}>
      {/* Fons subtil per donar profunditat */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3B82F6]/5 to-transparent pointer-events-none" />
      
      <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-[1.25rem] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(59,130,246,0.35)] z-10 transform group-hover:scale-105 transition-transform duration-base">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-extrabold text-white tracking-tight mb-3 z-10">{finalTitle}</h3>
      <p className="text-[#9CA3AF] mb-6 max-w-md z-10 leading-relaxed">{finalDescription}</p>
      
      <Link
        to="/pricing"
        className="z-10 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8] text-sm font-bold tracking-wide rounded-lg transition-all duration-base active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-[#3B82F6]/30"
      >
        {t('premiumLock.upgradeButton', 'Millora el teu Pla')}
      </Link>
    </div>
  );
}

