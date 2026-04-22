import React from 'react';

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-medium text-gray-100/90 tracking-normal">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#9CA3AF] mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
