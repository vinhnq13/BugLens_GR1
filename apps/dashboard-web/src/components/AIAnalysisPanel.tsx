import React from 'react';
import type { AIAnalysis } from '../api/issues';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  analysis: AIAnalysis | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const AIAnalysisPanel: React.FC<Props> = ({ analysis, onAnalyze, isAnalyzing }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>AI Analysis Insights</h3>
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : (analysis ? 'Re-analyze' : 'Analyze with AI')}
        </button>
      </div>

      {!analysis && !isAnalyzing && (
        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          This issue has not been analyzed by AI yet. Click "Analyze with AI" to generate insights.
        </div>
      )}

      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Category</div>
              <div style={{ fontWeight: 600 }}>{analysis.category || 'UNKNOWN'}</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Predicted Severity</div>
              <div><SeverityBadge severity={analysis.severity || 'MEDIUM'} /></div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Confidence</div>
              <div style={{ fontWeight: 600 }}>{Math.round((analysis.confidenceScore || 0) * 100)}%</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Fix Suggestion</div>
            <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              {analysis.fixSuggestion || 'No suggestion available.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Root Cause Hypothesis</div>
            <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              {analysis.rootCause || 'No root cause suggestion available.'}
            </div>
          </div>

          {analysis.duplicateCandidates && analysis.duplicateCandidates.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--warning)' }}>Potential Duplicates</div>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                {analysis.duplicateCandidates.map(dup => (
                  <li key={dup.id || dup.candidateId}>
                    Issue ID: {dup.candidateId} ({(dup.similarityScore * 100).toFixed(0)}% match)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.testCaseSuggestions && analysis.testCaseSuggestions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Test Cases</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.testCaseSuggestions.map((tc, idx) => {
                  let stepsList: string[] = [];
                  try {
                    stepsList = JSON.parse(tc.steps);
                  } catch {
                    stepsList = [tc.steps];
                  }

                  return (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{tc.title}</div>
                      <ol style={{ paddingLeft: '1.5rem', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        {stepsList.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                      <div style={{ fontSize: '0.875rem' }}>
                        <strong>Expected:</strong> {tc.expectedResult}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
