import React from 'react';

type UserStatProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
};

export const UserStat: React.FC<UserStatProps> = ({
  label,
  value,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon && <span className="text-gray-500">{icon}</span>}
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};
