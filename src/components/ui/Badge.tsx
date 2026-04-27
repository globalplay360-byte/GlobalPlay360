import React from 'react';
import { useTranslation } from 'react-i18next';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeBaseProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  variant?: BadgeVariant;
}

interface BadgeStatusProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Estat semàntic: el component mapeja status → variant + i18n. */
  status: string;
}

type BadgeProps = BadgeBaseProps | BadgeStatusProps;

const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide border';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[#1F2937]/50 text-[#9CA3AF] border-[#1F2937]',
  primary: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
  success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  submitted: 'primary',
  open: 'primary',
  in_review: 'info',
  accepted: 'success',
  rejected: 'danger',
  closed: 'danger',
};

function isStatusBadge(props: BadgeProps): props is BadgeStatusProps {
  return 'status' in props && typeof (props as BadgeStatusProps).status === 'string';
}

const formatStatusFallback = (s: string) =>
  s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export const Badge: React.FC<BadgeProps> = (props) => {
  const { t } = useTranslation();

  if (isStatusBadge(props)) {
    const { status, className = '', ...rest } = props;
    const variant = STATUS_VARIANT[status] ?? 'default';
    return (
      <span className={`${baseStyles} ${variants[variant]} ${className}`} {...rest}>
        {t(`status.${status}`, formatStatusFallback(status))}
      </span>
    );
  }

  const { children, variant = 'default', className = '', ...rest } = props;
  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </span>
  );
};
