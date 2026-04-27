import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Section: card amb barra groga d'accent + títol h2. Primitiu compartit
 * per a totes les zones que necessiten un panel "Dark SaaS Navy" amb header.
 */
export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section
      className={`bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-5 rounded-md bg-[#FFC107] shadow-sm shadow-[#FFC107]/30" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
