import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { GetIssuesDto } from './dto/get-issues.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignIssueDto } from './dto/assign-issue.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { Prisma } from '@prisma/client';

/**
 * IssuesService handles all business logic related to bug issues.
 *
 * It talks to the database through PrismaService.
 * The controller calls these methods and returns the results.
 */
@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // POST /issues — Create a new bug report
  // ──────────────────────────────────────────────────────────────────────────

  async createIssue(dto: CreateIssueDto) {
    // Create the issue and its first audit event in a single transaction
    // so both succeed or both fail together.
    const issue = await this.prisma.$transaction(async (tx) => {
      // Step 1: Insert the issue row
      const newIssue = await tx.issue.create({
        data: {
          projectId: dto.projectId,
          reporterId: dto.reporterId,
          title: dto.title,
          description: dto.description,
          severity: dto.severity,
          priority: dto.priority,
          url: dto.url,
          browser: dto.browser,
          os: dto.os,
          viewport: dto.viewport,
          screenshotBase64: dto.screenshotBase64,
          errorMessage: dto.errorMessage,
          stackTrace: dto.stackTrace,
          consoleLogs: dto.consoleLogs,
          networkLogs: dto.networkLogs,
          environment: dto.environment,
          sprintName: dto.sprintName,
          releaseVersion: dto.releaseVersion,
          commitHash: dto.commitHash,
          pullRequestUrl: dto.pullRequestUrl,
          component: dto.component,
          packageName: dto.packageName,
          className: dto.className,
          methodName: dto.methodName,
          // status defaults to NEW in the schema
        },
      });

      // Step 2: Write the audit log entry
      await tx.issueEvent.create({
        data: {
          issueId: newIssue.id,
          actorId: dto.reporterId,
          eventType: 'ISSUE_CREATED',
          metadata: JSON.stringify({ title: newIssue.title }),
        },
      });

      return newIssue;
    });

    return issue;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /issues — List issues with optional filters
  // ──────────────────────────────────────────────────────────────────────────

  async getIssues(filters: GetIssuesDto) {
    // Build the Prisma where clause dynamically based on which filters
    // were supplied in the query string.
    const where: Prisma.IssueWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.category) where.category = filters.category;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.environment) where.environment = filters.environment;

    // Keyword search across multiple text columns using OR
    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { errorMessage: { contains: filters.keyword, mode: 'insensitive' } },
        { component: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    const issues = await this.prisma.issue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return issues;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /issues/:id — Get full issue detail
  // ──────────────────────────────────────────────────────────────────────────

  async getIssueById(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        reporter: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        events: {
          include: {
            actor: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        aiAnalysis: {
          include: {
            duplicateCandidates: true,
            testCaseSuggestions: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    return issue;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PATCH /issues/:id/status — Update issue lifecycle status
  // ──────────────────────────────────────────────────────────────────────────

  async updateStatus(id: string, dto: UpdateStatusDto) {
    // Verify the issue exists before updating
    const existing = await this.prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Update the status
      const updatedIssue = await tx.issue.update({
        where: { id },
        data: { status: dto.status },
      });

      // Write audit log with old and new status values
      await tx.issueEvent.create({
        data: {
          issueId: id,
          actorId: dto.actorId,
          eventType: 'STATUS_CHANGED',
          metadata: JSON.stringify({
            from: existing.status,
            to: dto.status,
            note: dto.note,
          }),
        },
      });

      return updatedIssue;
    });

    return updated;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PATCH /issues/:id/assign — Assign issue to a developer
  // ──────────────────────────────────────────────────────────────────────────

  async assignIssue(id: string, dto: AssignIssueDto) {
    const existing = await this.prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedIssue = await tx.issue.update({
        where: { id },
        data: { assigneeId: dto.assigneeId },
      });

      await tx.issueEvent.create({
        data: {
          issueId: id,
          actorId: dto.actorId,
          eventType: 'ISSUE_ASSIGNED',
          metadata: JSON.stringify({
            previousAssigneeId: existing.assigneeId,
            newAssigneeId: dto.assigneeId,
          }),
        },
      });

      return updatedIssue;
    });

    return updated;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /issues/:id/comments — Add a comment to an issue
  // ──────────────────────────────────────────────────────────────────────────

  async addComment(id: string, dto: AddCommentDto) {
    const existing = await this.prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Note: the Prisma schema uses "body" for the comment text.
      // The DTO uses "content" to match the API spec — we map it here.
      const comment = await tx.comment.create({
        data: {
          issueId: id,
          authorId: dto.authorId,
          body: dto.content,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.issueEvent.create({
        data: {
          issueId: id,
          actorId: dto.authorId,
          eventType: 'COMMENT_ADDED',
          metadata: JSON.stringify({ commentId: comment.id }),
        },
      });

      return comment;
    });

    return result;
  }
}
