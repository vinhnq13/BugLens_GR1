import { IsString } from 'class-validator';

/**
 * AddCommentDto is used in POST /issues/:id/comments.
 *
 * - authorId: the user who is writing the comment
 * - content: the comment body text
 *
 * Note: the Prisma Comment model uses the field name "body" — we map
 * the incoming "content" field to "body" inside IssuesService.
 */
export class AddCommentDto {
  @IsString()
  authorId: string;

  @IsString()
  content: string;
}
