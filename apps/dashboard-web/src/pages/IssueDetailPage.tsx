import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, updateIssueStatus, addIssueComment, analyzeIssueWithAi, getAiAnalysis } from '../api/issues';
import type { Issue } from '../api/issues';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { ArrowLeft, MessageSquare, Save } from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for actions
  const [statusDraft, setStatusDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue(id);
    }
  }, [id]);

  const loadIssue = async (issueId: string) => {
    setLoading(true);
    try {
      const data = await getIssueById(issueId);
      setIssue(data);
      setStatusDraft(data.status);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!issue || statusDraft === issue.status) return;
    setIsUpdatingStatus(true);
    try {
      await updateIssueStatus(issue.id, statusDraft);
      // Reload issue to get new status and event
      await loadIssue(issue.id);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !commentDraft.trim()) return;
    setIsAddingComment(true);
    try {
      await addIssueComment(issue.id, commentDraft);
      setCommentDraft('');
      await loadIssue(issue.id);
    } catch (err: any) {
      alert(`Failed to add comment: ${err.message}`);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!issue) return;
    setIsAnalyzing(true);
    try {
      const aiResult = await analyzeIssueWithAi(issue.id);
      // Update local state with new analysis
      setIssue(prev => prev ? { ...prev, aiAnalysis: aiResult } : null);
    } catch (err: any) {
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefreshAI = async () => {
    if (!issue) return;
    setIsAnalyzing(true);
    try {
      const aiResult = await getAiAnalysis(issue.id);
      if (aiResult) {
         setIssue(prev => prev ? { ...prev, aiAnalysis: aiResult } : null);
      }
    } catch (err: any) {
      alert(`Failed to fetch latest AI analysis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div>Loading issue...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>Error: {error}</div>;
  if (!issue) return <div>Issue not found</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px' }}>
      <div>
        <button onClick={() => navigate('/issues')} className="btn btn-secondary" style={{ marginBottom: '1rem', border: 'none', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Issues
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{issue.title}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>ID: {issue.id}</span>
              <span>Reported by {issue.reporter?.name || 'Unknown'} on {new Date(issue.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}
            >
              <option value="NEW">New</option>
              <option value="TRIAGED">Triaged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus || statusDraft === issue.status}
            >
              <Save size={16} /> Update Status
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Description Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Description</h3>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {issue.description || 'No description provided.'}
            </div>
            
            {issue.errorMessage && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--danger)' }}>Error Message</h4>
                <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {issue.errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Panel */}
          <AIAnalysisPanel
            analysis={issue.aiAnalysis || null}
            onAnalyze={handleAnalyzeWithAI}
            isAnalyzing={isAnalyzing}
          />
          {issue.aiAnalysis && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem' }}>
              <button className="btn btn-secondary" onClick={handleRefreshAI} disabled={isAnalyzing} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Refresh from DB
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Comments ({issue.comments?.length || 0})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {issue.comments?.map(comment => (
                <div key={comment.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{comment.author.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>{comment.body}</div>
                </div>
              ))}
              {(!issue.comments || issue.comments.length === 0) && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>No comments yet.</div>
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={!commentDraft.trim() || isAddingComment}>
                  {isAddingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column - Context & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Properties Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Properties</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</span>
                <StatusBadge status={issue.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Severity</span>
                <SeverityBadge severity={issue.severity} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Priority</span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.priority}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Category</span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Environment</span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.environment}</span>
              </div>
            </div>
          </div>

          {/* Context Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Browser Context</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>URL</div>
                <div style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>{issue.url || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Browser</div>
                <div style={{ fontSize: '0.875rem' }}>{issue.browser || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>OS</div>
                <div style={{ fontSize: '0.875rem' }}>{issue.os || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Viewport</div>
                <div style={{ fontSize: '0.875rem' }}>{issue.viewport || '-'}</div>
              </div>
            </div>
          </div>

          {/* Code Location Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Code Location</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Component</div>
                <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{issue.component || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Package / Class</div>
                <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {issue.packageName ? `${issue.packageName} > ` : ''}
                  {issue.className || '-'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Method</div>
                <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>{issue.methodName || '-'}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
