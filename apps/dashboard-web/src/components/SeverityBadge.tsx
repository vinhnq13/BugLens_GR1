import React from 'react';

interface Props {
  severity: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity }) => {
  let bgColor = '#e2e8f0';
  let color = '#475569';

  switch (severity) {
    case 'LOW':
      bgColor = '#d1fae5';
      color = '#047857';
      break;
    case 'MEDIUM':
      bgColor = '#fef3c7';
      color = '#b45309';
      break;
    case 'HIGH':
      bgColor = '#fee2e2';
      color = '#b91c1c';
      break;
    case 'CRITICAL':
      bgColor = '#991b1b';
      color = '#ffffff';
      break;
  }

  return (
    <span className="badge" style={{ backgroundColor: bgColor, color }}>
      {severity}
    </span>
  );
};
