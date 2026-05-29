import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  IssueSeverity,
  IssuePriority,
  Environment,
} from '@prisma/client';

/**
 * CreateIssueDto defines the shape of the request body
 * when a client submits a new bug report via POST /issues.
 *
 * All fields except projectId, reporterId, and title are optional
 * because the browser extension may not always capture every piece
 * of context (e.g. some pages don't produce network logs).
 */
export class CreateIssueDto {
  // ── Required ──────────────────────────────────────────────────────────────

  @IsString()
  projectId: string;

  @IsString()
  reporterId: string;

  @IsString()
  title: string;

  // ── Optional metadata ──────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IssueSeverity)
  severity?: IssueSeverity;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  // ── Browser context ────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  viewport?: string;

  @IsOptional()
  @IsString()
  screenshotBase64?: string;

  // ── Error context ──────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  stackTrace?: string;

  @IsOptional()
  @IsString()
  consoleLogs?: string;

  @IsOptional()
  @IsString()
  networkLogs?: string;

  // ── Environment metadata ───────────────────────────────────────────────────

  @IsOptional()
  @IsEnum(Environment)
  environment?: Environment;

  @IsOptional()
  @IsString()
  sprintName?: string;

  @IsOptional()
  @IsString()
  releaseVersion?: string;

  @IsOptional()
  @IsString()
  commitHash?: string;

  @IsOptional()
  @IsString()
  pullRequestUrl?: string;

  // ── Code location hints ────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsString()
  packageName?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsString()
  methodName?: string;
}
