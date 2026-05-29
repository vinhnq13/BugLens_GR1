import { apiClient } from './client';
import type { Issue } from './issues';

export interface AnalyticsOverview {
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issuesByCategory: Record<string, number>;
  issuesByEnvironment: Record<string, number>;
  recentIssues: Issue[];
}

export async function getOverview(): Promise<AnalyticsOverview> {
  return apiClient<AnalyticsOverview>('/analytics/overview');
}
