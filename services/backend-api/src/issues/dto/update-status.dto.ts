import { IsString, IsEnum } from 'class-validator';
import { IssueStatus } from '@prisma/client';

/**
 * UpdateStatusDto is used in PATCH /issues/:id/status.
 *
 * - status: the new lifecycle status for the issue
 * - actorId: the ID of the user performing the status change (for the audit log)
 * - note: an optional human-readable reason for the change
 */
export class UpdateStatusDto {
  @IsEnum(IssueStatus)
  status: IssueStatus;

  @IsString()
  actorId: string;

  @IsString()
  note: string;
}
