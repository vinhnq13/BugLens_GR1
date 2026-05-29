import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Issue } from '../api/issues';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  issues: Issue[];
}

export const IssueTable: React.FC<Props> = ({ issues }) => {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No issues found matching the criteria.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Environment</th>
            <th>Component</th>
            <th>Reporter</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              onClick={() => navigate(`/issues/${issue.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {issue.id.split('-')[0]}
              </td>
              <td style={{ fontWeight: 500 }}>{issue.title}</td>
              <td><StatusBadge status={issue.status} /></td>
              <td><SeverityBadge severity={issue.severity} /></td>
              <td>{issue.environment}</td>
              <td>{issue.component || '-'}</td>
              <td>{issue.reporter?.name || '-'}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {new Date(issue.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
