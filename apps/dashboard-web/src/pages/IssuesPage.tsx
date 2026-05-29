import React, { useEffect, useState } from 'react';
import { getIssues } from '../api/issues';
import type { Issue, GetIssuesParams } from '../api/issues';
import { IssueTable } from '../components/IssueTable';
import { Search } from 'lucide-react';

export const IssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GetIssuesParams>({
    status: '',
    severity: '',
    environment: '',
    keyword: '',
  });

  const fetchIssues = async () => {
    setLoading(true);
    try {
      // Clean up empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await getIssues(activeFilters);
      setIssues(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only refetch when we explicitly submit or when mounting
    fetchIssues();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>All Issues</h1>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Search titles, descriptions..."
                style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}>
              <option value="">All</option>
              <option value="NEW">New</option>
              <option value="TRIAGED">Triaged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Severity</label>
            <select name="severity" value={filters.severity} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}>
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Environment</label>
            <select name="environment" value={filters.environment} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}>
              <option value="">All</option>
              <option value="PRODUCTION">Production</option>
              <option value="STAGING">Staging</option>
              <option value="TESTING">Testing</option>
              <option value="DEVELOPMENT">Development</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Filter</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading issues...</div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
        ) : (
          <IssueTable issues={issues} />
        )}
      </div>
    </div>
  );
};
