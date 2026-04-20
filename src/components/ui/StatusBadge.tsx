import { useTranslation } from 'react-i18next';

type StatusType = 'submitted' | 'in_review' | 'accepted' | 'rejected' | 'open' | 'closed' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const getBadgeStyles = () => {
    switch (status) {
      case 'submitted':
      case 'open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'in_review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
      case 'closed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatText = (text: string) => {
    return text.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()} ${className}`}
    >
      {t(`status.${status}`, formatText(status))}

    </span>
  );
}