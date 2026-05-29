import React, { useEffect, useState } from 'react';
import { getOverview } from '../api/analytics';
import type { AnalyticsOverview } from '../api/analytics';
import { StatCard } from '../components/StatCard';
import { IssueTable } from '../components/IssueTable';
import { Bug, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverview()
      .then((data) => {
        setOverview(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>Error: {error}</div>;
  if (!overview) return null;

  const newIssues = overview.issuesByStatus['NEW'] || 0;
  const criticalIssues = overview.issuesBySeverity['CRITICAL'] || 0;
  const resolvedIssues = (overview.issuesByStatus['RESOLVED'] || 0) + (overview.issuesByStatus['VERIFIED'] || 0) + (overview.issuesByStatus['CLOSED'] || 0);

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <StatCard title="Total Issues" value={overview.totalIssues} icon={<Bug size={32} />} />
        <StatCard title="New Issues" value={newIssues} icon={<Clock size={32} />} />
        <StatCard title="Critical Severity" value={criticalIssues} icon={<AlertCircle size={32} />} />
        <StatCard title="Resolved/Closed" value={resolvedIssues} icon={<CheckCircle size={32} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Issues by Category</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(overview.issuesByCategory).map(([cat, count]) => (
              <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{cat}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Issues by Environment</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(overview.issuesByEnvironment).map(([env, count]) => (
              <li key={env} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{env}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Issues</h2>
        </div>
        <IssueTable issues={overview.recentIssues} />
      </div>
    </div>
  );
};
