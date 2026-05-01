import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'ca', label: 'CA', name: 'Català' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === (i18n.resolvedLanguage || i18n.language || 'en')) || LANGUAGES[0];

  // Tancar el desplegable en fer clic fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Idioma actual: ${currentLang.label}`}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-gray-100 hover:border-[#3B82F6]/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]"
      >
        <span>{currentLang.label}</span>
        <svg 
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-[#111827] border border-[#1F2937] rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
          {LANGUAGES.map((lng) => (
            <button
              key={lng.code}
              onClick={() => {
                i18n.changeLanguage(lng.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors ${
                currentLang.code === lng.code 
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6]' 
                  : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-gray-100'
              }`}
            >
              <span className="w-5 font-bold">{lng.label}</span>
              <span>{lng.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
