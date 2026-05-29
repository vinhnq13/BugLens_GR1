import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IssueStatus, IssueSeverity, IssueCategory, Environment } from '@prisma/client';

/**
 * GetIssuesDto maps query-string parameters for the GET /issues endpoint.
 *
 * All fields are optional — if none are provided the full list is returned.
 * The 'keyword' field triggers a full-text search across title, description,
 * errorMessage, and component.
 */
export class GetIssuesDto {
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsEnum(IssueSeverity)
  severity?: IssueSeverity;

  @IsOptional()
  @IsEnum(IssueCategory)
  category?: IssueCategory;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(Environment)
  environment?: Environment;

  @IsOptional()
  @IsString()
  keyword?: string;
}
