import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AnalyticsService computes aggregated statistics for the overview dashboard.
 *
 * Each method runs a Prisma query and returns a plain object that the
 * controller will wrap in the standard { success, message, data } envelope.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // GET /analytics/overview
  // ──────────────────────────────────────────────────────────────────────────

  async getOverview() {
    // Run all queries in parallel for better performance
    const [
      totalIssues,
      issuesByStatus,
      issuesBySeverity,
      issuesByCategory,
      issuesByEnvironment,
      recentIssues,
    ] = await Promise.all([
      // 1. Total count of all issues
      this.prisma.issue.count(),

      // 2. Count grouped by status
      this.prisma.issue.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // 3. Count grouped by severity
      this.prisma.issue.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),

      // 4. Count grouped by category
      this.prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true },
      }),

      // 5. Count grouped by environment
      this.prisma.issue.groupBy({
        by: ['environment'],
        _count: { environment: true },
      }),

      // 6. Latest 10 issues for the recent activity feed
      this.prisma.issue.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          category: true,
          createdAt: true,
          project: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Reshape groupBy results into simple key→count maps for easier
    // consumption by the frontend chart components.
    const statusMap: Record<string, number> = {};
    for (const row of issuesByStatus) {
      statusMap[row.status] = row._count.status;
    }

    const severityMap: Record<string, number> = {};
    for (const row of issuesBySeverity) {
      severityMap[row.severity] = row._count.severity;
    }

    const categoryMap: Record<string, number> = {};
    for (const row of issuesByCategory) {
      categoryMap[row.category] = row._count.category;
    }

    const environmentMap: Record<string, number> = {};
    for (const row of issuesByEnvironment) {
      environmentMap[row.environment] = row._count.environment;
    }

    return {
      totalIssues,
      issuesByStatus: statusMap,
      issuesBySeverity: severityMap,
      issuesByCategory: categoryMap,
      issuesByEnvironment: environmentMap,
      recentIssues,
    };
  }
}
