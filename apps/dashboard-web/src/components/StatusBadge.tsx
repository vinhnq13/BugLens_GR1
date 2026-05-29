import React from 'react';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  let bgColor = '#e2e8f0';
  let color = '#475569';

  switch (status) {
    case 'NEW':
      bgColor = '#dbeafe';
      color = '#1d4ed8';
      break;
    case 'TRIAGED':
      bgColor = '#fef3c7';
      color = '#b45309';
      break;
    case 'IN_PROGRESS':
      bgColor = '#ffedd5';
      color = '#c2410c';
      break;
    case 'RESOLVED':
    case 'VERIFIED':
      bgColor = '#d1fae5';
      color = '#047857';
      break;
    case 'CLOSED':
      bgColor = '#f1f5f9';
      color = '#334155';
      break;
  }

  return (
    <span className="badge" style={{ backgroundColor: bgColor, color }}>
      {status}
    </span>
  );
};
