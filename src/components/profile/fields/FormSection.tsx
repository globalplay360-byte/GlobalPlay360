import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-5 rounded-md bg-[#FFC107] shadow-sm shadow-[#FFC107]/30" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
