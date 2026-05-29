import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

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

  // ──────────────────────────────────────────────────────────────────────────
  // POST /issues/:id/analyze — Call AI service and persist analysis results
  // ──────────────────────────────────────────────────────────────────────────

  async analyzeIssue(id: string) {
    // Step 1: Load the issue with all context fields
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        reporter: true,
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    // Step 2: Fetch sibling issues from the same project for duplicate detection.
    // We send only a brief fingerprint (id + title + description + errorMessage)
    // so the AI service does not need database access.
    const siblings = await this.prisma.issue.findMany({
      where: {
        projectId: issue.projectId,
        id: { not: id }, // exclude the current issue
      },
      select: {
        id: true,
        title: true,
        description: true,
        errorMessage: true,
      },
      take: 50, // cap to avoid oversized payloads
    });

    // Step 3: Build the payload for POST /analyze
    const aiPayload = {
      issueId: issue.id,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      priority: issue.priority,
      url: issue.url,
      browser: issue.browser,
      os: issue.os,
      viewport: issue.viewport,
      errorMessage: issue.errorMessage,
      stackTrace: issue.stackTrace,
      consoleLogs: issue.consoleLogs,
      networkLogs: issue.networkLogs,
      environment: issue.environment,
      component: issue.component,
      packageName: issue.packageName,
      className: issue.className,
      methodName: issue.methodName,
      // Existing issues for duplicate detection
      existingIssues: siblings.map((s) => ({
        issueId: s.id,
        title: s.title,
        description: s.description,
        errorMessage: s.errorMessage,
      })),
    };

    // Step 4: Call the AI service — throws ServiceUnavailableException if down
    const aiResult = await this.aiService.analyze(aiPayload);

    // Step 5: Persist everything in one transaction
    const saved = await this.prisma.$transaction(async (tx) => {
      // 5a: Upsert AIAnalysis (upsert so re-analyzing works without errors)
      const analysis = await tx.aIAnalysis.upsert({
        where: { issueId: id },
        create: {
          issueId: id,
          category: aiResult.category,
          severity: aiResult.predictedSeverity,
          rootCause: aiResult.rootCauseSuggestion,
          fixSuggestion: aiResult.summary,
          confidenceScore: aiResult.confidenceScore,
          isDuplicate: aiResult.duplicateCandidates.length > 0,
          analysisModel: 'rule-based-v1',
          rawResponse: JSON.stringify(aiResult),
        },
        update: {
          category: aiResult.category,
          severity: aiResult.predictedSeverity,
          rootCause: aiResult.rootCauseSuggestion,
          fixSuggestion: aiResult.summary,
          confidenceScore: aiResult.confidenceScore,
          isDuplicate: aiResult.duplicateCandidates.length > 0,
          analysisModel: 'rule-based-v1',
          rawResponse: JSON.stringify(aiResult),
          analyzedAt: new Date(),
        },
      });

      // 5b: Clear old duplicate candidates, then re-insert fresh ones
      await tx.duplicateCandidate.deleteMany({ where: { analysisId: analysis.id } });
      if (aiResult.duplicateCandidates.length > 0) {
        await tx.duplicateCandidate.createMany({
          data: aiResult.duplicateCandidates.map((dc) => ({
            analysisId: analysis.id,
            candidateId: dc.issueId,
            similarityScore: dc.similarityScore,
          })),
        });
      }

      // 5c: Clear old test case suggestions, then re-insert
      await tx.testCaseSuggestion.deleteMany({ where: { analysisId: analysis.id } });
      if (aiResult.testCaseSuggestions.length > 0) {
        await tx.testCaseSuggestion.createMany({
          data: aiResult.testCaseSuggestions.map((tc) => ({
            analysisId: analysis.id,
            title: tc.title,
            steps: JSON.stringify(tc.steps), // stored as JSON string per schema
            expectedResult: tc.expectedResult,
          })),
        });
      }

      // 5d: Write audit log event
      await tx.issueEvent.create({
        data: {
          issueId: id,
          actorId: issue.reporterId, // system action attributed to the reporter
          eventType: 'AI_ANALYZED',
          metadata: JSON.stringify({
            category: aiResult.category,
            severity: aiResult.predictedSeverity,
            confidenceScore: aiResult.confidenceScore,
            duplicatesFound: aiResult.duplicateCandidates.length,
          }),
        },
      });

      // Return the fully loaded analysis with relations
      return tx.aIAnalysis.findUnique({
        where: { id: analysis.id },
        include: {
          duplicateCandidates: true,
          testCaseSuggestions: true,
        },
      });
    });

    return saved;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /issues/:id/ai-analysis — Return stored AI analysis for an issue
  // ──────────────────────────────────────────────────────────────────────────

  async getAiAnalysis(id: string) {
    // First confirm the issue exists
    const issueExists = await this.prisma.issue.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!issueExists) {
      throw new NotFoundException(`Issue with id "${id}" not found`);
    }

    // Fetch the analysis (may be null if analyze was never called)
    const analysis = await this.prisma.aIAnalysis.findUnique({
      where: { issueId: id },
      include: {
        duplicateCandidates: true,
        testCaseSuggestions: true,
      },
    });

    return analysis; // null is valid — means not yet analyzed
  }
}
