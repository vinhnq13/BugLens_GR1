import { IsString } from 'class-validator';

/**
 * AssignIssueDto is used in PATCH /issues/:id/assign.
 *
 * - assigneeId: the developer being assigned to the issue
 * - actorId: the user performing the assignment (used for the audit log)
 */
export class AssignIssueDto {
  @IsString()
  assigneeId: string;

  @IsString()
  actorId: string;
}
