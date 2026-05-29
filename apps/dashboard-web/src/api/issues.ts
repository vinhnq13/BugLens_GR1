import { apiClient } from './client';
import { DEFAULT_USER_ID } from '../config';

export interface Issue {
  id: string;
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  title: string;
  description?: string;
  status: string;
  severity: string;
  priority: string;
  category: string;
  url?: string;
  browser?: string;
  os?: string;
  viewport?: string;
  errorMessage?: string;
  stackTrace?: string;
  consoleLogs?: string;
  networkLogs?: string;
  environment: string;
  sprintName?: string;
  releaseVersion?: string;
  commitHash?: string;
  component?: string;
  packageName?: string;
  className?: string;
  methodName?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string };
  comments?: Comment[];
  events?: IssueEvent[];
  aiAnalysis?: AIAnalysis;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
}

export interface IssueEvent {
  id: string;
  eventType: string;
  metadata: string;
  createdAt: string;
  actor: { id: string; name: string; email: string };
}

export interface AIAnalysis {
  id: string;
  category: string;
  severity: string;
  rootCause: string;
  fixSuggestion: string;
  confidenceScore: number;
  isDuplicate: boolean;
  duplicateCandidates: any[];
  testCaseSuggestions: TestCaseSuggestion[];
}

export interface TestCaseSuggestion {
  id: string;
  title: string;
  steps: string;
  expectedResult: string;
}

export interface GetIssuesParams {
  status?: string;
  severity?: string;
  environment?: string;
  keyword?: string;
}

export async function getIssues(params: GetIssuesParams = {}): Promise<Issue[]> {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.severity) query.append('severity', params.severity);
  if (params.environment) query.append('environment', params.environment);
  if (params.keyword) query.append('keyword', params.keyword);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiClient<Issue[]>(`/issues${queryString}`);
}

export async function getIssueById(id: string): Promise<Issue> {
  return apiClient<Issue>(`/issues/${id}`);
}

export async function updateIssueStatus(id: string, status: string): Promise<Issue> {
  return apiClient<Issue>(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      actorId: DEFAULT_USER_ID,
      note: `Status updated to ${status}`
    }),
  });
}

export async function addIssueComment(id: string, content: string): Promise<Comment> {
  return apiClient<Comment>(`/issues/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, authorId: DEFAULT_USER_ID }),
  });
}

export async function analyzeIssueWithAi(id: string): Promise<AIAnalysis> {
  return apiClient<AIAnalysis>(`/issues/${id}/analyze`, {
    method: 'POST',
  });
}

export async function getAiAnalysis(id: string): Promise<AIAnalysis | null> {
  return apiClient<AIAnalysis | null>(`/issues/${id}/ai-analysis`);
}
