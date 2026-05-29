import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AiService is responsible for making HTTP calls to the Python AI Service.
 *
 * It uses the built-in Node.js fetch API (available since Node 18 / ES2023).
 * The AI Service URL is read from the AI_SERVICE_URL environment variable
 * so the same backend code works in both local and Docker environments.
 *
 * Docker note:
 *   - Local dev (backend on Windows): AI_SERVICE_URL=http://localhost:8000
 *   - Docker backend container:       AI_SERVICE_URL=http://host.docker.internal:8000
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // The base URL of the Python FastAPI AI service.
  // Defaults to localhost:8000 if not set in .env.
  private readonly aiServiceUrl: string;

  constructor(private readonly config: ConfigService) {
    this.aiServiceUrl = this.config.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
    this.logger.log(`AI Service URL: ${this.aiServiceUrl}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Health check — used to verify connectivity before analysis
  // ──────────────────────────────────────────────────────────────────────────

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5-second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /analyze — Send issue data to AI service, receive analysis result
  // ──────────────────────────────────────────────────────────────────────────

  async analyze(payload: Record<string, unknown>): Promise<AiAnalysisResponse> {
    this.logger.log(`Calling AI Service at ${this.aiServiceUrl}/analyze`);

    let response: Response;

    try {
      response = await fetch(`${this.aiServiceUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30-second timeout for analysis
      });
    } catch (error: unknown) {
      // Network-level error (e.g. ECONNREFUSED — AI service not running)
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`AI Service unreachable: ${message}`);
      throw new ServiceUnavailableException(
        `AI Service is not reachable at ${this.aiServiceUrl}. ` +
        `Make sure the AI service is running. Error: ${message}`,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`AI Service returned HTTP ${response.status}: ${body}`);
      throw new ServiceUnavailableException(
        `AI Service returned an error (HTTP ${response.status}): ${body}`,
      );
    }

    const json = await response.json() as AiServiceEnvelope;
    return json.data;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Type definitions for the AI service response
// These mirror the Pydantic models in services/ai-service/app/models.py
// ──────────────────────────────────────────────────────────────────────────────

/** The outer envelope returned by every AI service endpoint. */
interface AiServiceEnvelope {
  success: boolean;
  message: string;
  data: AiAnalysisResponse;
}

/** Shape of the data.* fields from POST /analyze */
export interface AiAnalysisResponse {
  category: string;
  predictedSeverity: string;
  summary: string;
  rootCauseSuggestion: string;
  confidenceScore: number;
  duplicateCandidates: AiDuplicateCandidate[];
  testCaseSuggestions: AiTestCaseSuggestion[];
}

export interface AiDuplicateCandidate {
  issueId: string;
  similarityScore: number;
  reason: string;
}

export interface AiTestCaseSuggestion {
  title: string;
  steps: string[];
  expectedResult: string;
}
