import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const inputBase =
  'w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-gray-100 text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] hover:border-[#374151] shadow-sm transition-all duration-fast ease-out disabled:opacity-50 disabled:cursor-not-allowed';

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 mt-1 ${className}`}>
      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider pl-1">{label}</label>
      {children}
      {hint && <span className="text-[11px] text-[#6B7280] font-medium leading-tight pl-1">{hint}</span>}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${className}`} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${className}`} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} resize-y min-h-[100px] ${className}`} />;
}
