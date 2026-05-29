import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({ title, value, icon }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
      {icon && <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{icon}</div>}
    </div>
  );
};
