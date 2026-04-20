import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide border';

  const variants: Record<BadgeVariant, string> = {
    default: 'bg-[#1F2937]/50 text-[#9CA3AF] border-[#1F2937]',
    primary: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
