/**
 * BugLens Database Seed Script
 *
 * Populates the database with realistic demo data for local development
 * and project defense demonstrations.
 *
 * Run with: npm run prisma:seed
 */

import { PrismaClient, UserRole, ProjectRole, IssueStatus, IssueSeverity, IssuePriority, IssueCategory, Environment } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── 1. Create Users ─────────────────────────────────────────────────────────

  const tester = await prisma.user.upsert({
    where: { email: 'tester@buglens.dev' },
    update: {},
    create: {
      email: 'tester@buglens.dev',
      name: 'Alice Tester',
      role: UserRole.TESTER,
    },
  });

  const developer = await prisma.user.upsert({
    where: { email: 'developer@buglens.dev' },
    update: {},
    create: {
      email: 'developer@buglens.dev',
      name: 'Bob Developer',
      role: UserRole.DEVELOPER,
    },
  });

  console.log(`✅ Users created: ${tester.name}, ${developer.name}`);

  // ── 2. Create Demo Project ───────────────────────────────────────────────────

  const project = await prisma.project.upsert({
    where: { slug: 'buglens-demo' },
    update: {},
    create: {
      name: 'BugLens Demo Project',
      description: 'A sample project used to demonstrate the BugLens bug reporting workflow.',
      slug: 'buglens-demo',
      isActive: true,
    },
  });

  console.log(`✅ Project created: ${project.name}`);

  // ── 3. Assign Members to Project ────────────────────────────────────────────

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: tester.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: tester.id,
      role: ProjectRole.TESTER,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: developer.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: developer.id,
      role: ProjectRole.DEVELOPER,
    },
  });

  console.log(`✅ Project members assigned`);

  // ── 4. Create Sample Issues ──────────────────────────────────────────────────

  const issue1 = await prisma.issue.create({
    data: {
      projectId: project.id,
      reporterId: tester.id,
      assigneeId: developer.id,
      title: 'Login button unresponsive on Safari mobile',
      description:
        'When accessing the login page on Safari (iOS 17), tapping the "Sign In" button does not trigger any action. No network request is made and no error appears in the console.',
      status: IssueStatus.NEW,
      severity: IssueSeverity.HIGH,
      priority: IssuePriority.HIGH,
      category: IssueCategory.UI,
      url: 'https://demo.buglens.dev/login',
      browser: 'Safari 17.0',
      os: 'iOS 17.0',
      viewport: '390x844',
      errorMessage: null,
      stackTrace: null,
      consoleLogs: JSON.stringify([
        { level: 'warn', message: 'Touch event listener added to passive element', timestamp: '2026-05-22T10:00:01Z' },
      ]),
      networkLogs: JSON.stringify([]),
      environment: Environment.PRODUCTION,
      sprintName: 'Sprint 1',
      releaseVersion: '1.0.0',
      component: 'LoginForm',
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      projectId: project.id,
      reporterId: tester.id,
      title: 'Dashboard crashes with TypeError when project list is empty',
      description:
        'The main dashboard throws an uncaught TypeError in the console when a user has no projects assigned. The page goes blank and the user cannot navigate elsewhere without refreshing.',
      status: IssueStatus.TRIAGED,
      severity: IssueSeverity.CRITICAL,
      priority: IssuePriority.URGENT,
      category: IssueCategory.BACKEND,
      url: 'https://demo.buglens.dev/dashboard',
      browser: 'Chrome 124.0',
      os: 'Windows 11',
      viewport: '1920x1080',
      errorMessage: "TypeError: Cannot read properties of undefined (reading 'map')",
      stackTrace:
        "TypeError: Cannot read properties of undefined (reading 'map')\n  at Dashboard.render (Dashboard.tsx:45:22)\n  at processChild (/node_modules/react-dom/cjs/react-dom.development.js:3990:14)\n  at resolve (/node_modules/react-server-dom-webpack/cjs/react-server-dom-webpack.development.js:282:5)",
      consoleLogs: JSON.stringify([
        { level: 'error', message: "TypeError: Cannot read properties of undefined (reading 'map')", timestamp: '2026-05-22T09:30:00Z' },
      ]),
      networkLogs: JSON.stringify([
        { method: 'GET', url: '/api/projects', status: 200, responseTime: 123, response: '[]' },
      ]),
      environment: Environment.STAGING,
      sprintName: 'Sprint 1',
      releaseVersion: '1.0.0',
      component: 'Dashboard',
      className: 'DashboardComponent',
      methodName: 'render',
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      projectId: project.id,
      reporterId: tester.id,
      title: 'API response time exceeds 5s on issue list endpoint',
      description:
        'GET /api/issues consistently takes over 5 seconds to return on the staging environment when the project has more than 500 issues. The dashboard becomes unusable during this time.',
      status: IssueStatus.IN_PROGRESS,
      severity: IssueSeverity.MEDIUM,
      priority: IssuePriority.MEDIUM,
      category: IssueCategory.PERFORMANCE,
      url: 'https://demo.buglens.dev/issues',
      browser: 'Firefox 125.0',
      os: 'macOS 14.3',
      viewport: '1440x900',
      errorMessage: null,
      stackTrace: null,
      consoleLogs: JSON.stringify([
        { level: 'warn', message: 'API call took 5321ms', timestamp: '2026-05-22T11:15:00Z' },
      ]),
      networkLogs: JSON.stringify([
        { method: 'GET', url: '/api/issues?projectId=123&limit=50', status: 200, responseTime: 5321, response: '[...]' },
      ]),
      environment: Environment.STAGING,
      sprintName: 'Sprint 1',
      releaseVersion: '1.0.0',
      component: 'IssueList',
      packageName: 'buglens-backend-api',
    },
  });

  console.log(`✅ Issues created: ${issue1.title}`);
  console.log(`✅ Issues created: ${issue2.title}`);
  console.log(`✅ Issues created: ${issue3.title}`);

  // ── 5. Create AI Analysis for Issue 2 (critical crash) ──────────────────────

  const aiAnalysis = await prisma.aIAnalysis.create({
    data: {
      issueId: issue2.id,
      category: 'BACKEND',
      severity: 'CRITICAL',
      rootCause:
        'The Dashboard component calls `.map()` on the `projects` state variable without checking for null or undefined. When the API returns an empty array `[]`, the component correctly handles it, but if the API call fails or returns undefined, the state is never initialized, causing the TypeError.',
      fixSuggestion:
        "Add a null check before calling `.map()`: `(projects ?? []).map(...)`. Additionally, add error boundary handling in the Dashboard component.",
      confidenceScore: 0.88,
      isDuplicate: false,
      analysisModel: 'buglens-classifier-v1',
      rawResponse: JSON.stringify({
        category: 'BACKEND',
        severity: 'CRITICAL',
        confidence: 0.88,
        root_cause:
          'Null/undefined state variable used without guard before array method call.',
        fix_suggestion: 'Add null coalescing operator or optional chaining before `.map()` call.',
      }),

      // Nested: Test Case Suggestions
      testCaseSuggestions: {
        create: [
          {
            title: 'Dashboard renders correctly when user has no projects',
            precondition: 'User is logged in and has zero projects assigned.',
            steps:
              '1. Log in as a user with no projects.\n2. Navigate to /dashboard.\n3. Observe the page content and browser console.',
            expectedResult: 'Dashboard should display an empty state message (e.g., "No projects yet") without any JavaScript errors.',
            priority: 'HIGH',
          },
          {
            title: 'Dashboard handles API failure gracefully',
            precondition: 'User is logged in. The /api/projects endpoint is unreachable (simulate with network throttling).',
            steps:
              '1. Open DevTools → Network → set to Offline mode.\n2. Navigate to /dashboard.\n3. Observe the page behavior.',
            expectedResult: 'Dashboard should show an error message or skeleton loader, not a blank page or uncaught error.',
            priority: 'HIGH',
          },
        ],
      },
    },
  });

  console.log(`✅ AI Analysis created for issue: "${issue2.title}"`);
  console.log(`   - Root cause: ${aiAnalysis.rootCause?.substring(0, 60)}...`);
  console.log(`   - Test cases: 2 generated`);

  // ── 6. Create Issue Events (audit log) ──────────────────────────────────────

  await prisma.issueEvent.create({
    data: {
      issueId: issue2.id,
      actorId: tester.id,
      eventType: 'ISSUE_CREATED',
      metadata: JSON.stringify({ message: 'Issue reported via browser extension' }),
    },
  });

  await prisma.issueEvent.create({
    data: {
      issueId: issue2.id,
      actorId: developer.id,
      eventType: 'STATUS_CHANGED',
      metadata: JSON.stringify({ from: 'NEW', to: 'TRIAGED' }),
    },
  });

  console.log(`✅ Issue events created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`   Users:    2`);
  console.log(`   Projects: 1`);
  console.log(`   Issues:   3`);
  console.log(`   AI Analyses: 1 (with 2 test cases)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
