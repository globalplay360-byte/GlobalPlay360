import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#111827] border border-[#1F2937] rounded-xl text-center">
      {icon && (
        <div className="w-16 h-16 bg-[#1F2937] text-[#9CA3AF] rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-medium text-gray-100/90 mb-2">{title}</h3>
      <p className="text-sm text-[#9CA3AF] mb-6 max-w-md leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
