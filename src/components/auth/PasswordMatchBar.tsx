import { useTranslation } from 'react-i18next';

interface PasswordMatchBarProps {
  password: string;
  confirm: string;
}

export function PasswordMatchBar({ password, confirm }: PasswordMatchBarProps) {
  const { t } = useTranslation();
  if (!confirm) return null;

  const matches = password === confirm;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#9CA3AF]">
          {t('passwordMatch.label', 'Coincidència')}
        </span>
        <span className={`text-xs font-semibold ${matches ? 'text-green-500' : 'text-red-500'}`}>
          {matches
            ? t('passwordMatch.yes', 'Coincideixen')
            : t('passwordMatch.no', 'No coincideixen')}
        </span>
      </div>
      <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
        <div className={`h-full w-full transition-all duration-300 ease-in-out ${matches ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}
