import React from 'react';

type InfoItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

type AboutCardProps = {
  title: string;
  items: InfoItem[];
  className?: string;
};

export const AboutCard: React.FC<AboutCardProps> = ({
  title,
  items,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-gray-400 mt-0.5">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-medium text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
