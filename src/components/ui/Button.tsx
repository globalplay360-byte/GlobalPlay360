import React, { type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-md transition-all duration-fast ease-out active:scale-[0.98] disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] focus:ring-offset-[#0B1120] disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[#3B82F6] text-gray-100 hover:bg-[#2563EB] shadow-sm',
  secondary: 'bg-[#1F2937] text-gray-100 hover:bg-gray-700 shadow-sm',
  outline: 'bg-transparent border border-[#1F2937] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-gray-100',
  ghost: 'bg-transparent text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937]/60',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className))}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
