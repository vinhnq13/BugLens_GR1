# services/backend-api

**BugLens Backend API** — The core REST API built with NestJS and TypeScript.

## Tech Stack

| Technology | Role |
|---|---|
| NestJS | Node.js framework (modular, decorator-based) |
| TypeScript | Type safety |
| Prisma | ORM for PostgreSQL |
| @nestjs/config | Environment variable loading |
| PostgreSQL 16 | Primary database (via Docker) |
| Redis 7 | Cache / Queue (via Docker) |

## Project Structure

```
src/
├── prisma/
│   ├── prisma.service.ts   # PrismaClient wrapper with NestJS lifecycle hooks
│   └── prisma.module.ts    # Global module that exports PrismaService
├── app.module.ts           # Root module — imports ConfigModule + PrismaModule
├── app.controller.ts       # Default health-check controller
├── app.service.ts          # Default service
└── main.ts                 # Application entry point

prisma/
├── schema.prisma           # Database schema (models + enums)
└── seed.ts                 # Demo seed data script
```

## Modules (Planned)

| Module | Responsibility |
|---|---|
| `PrismaModule` ✅ | Database connection — globally provided |
| `IssueModule` 🔜 | CRUD for bug reports, status transitions |
| `ProjectModule` 🔜 | Project creation and management |
| `CommentModule` 🔜 | Developer comments on issues |
| `AIModule` 🔜 | Integration with ai-service |
| `AnalyticsModule` 🔜 | Aggregated stats for dashboard charts |

## Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default values match the `docker-compose.yml` configuration:

```env
DATABASE_URL="postgresql://buglens:buglens123@localhost:5432/buglens_db?schema=public"
AI_SERVICE_URL="http://localhost:8000"
PORT=3000
```

## Installation

```bash
npm install
```

## Start Infrastructure

Make sure PostgreSQL and Redis are running:

```bash
# From the project root (BugLens_GR1/)
docker compose up -d
```

## Database Migration

Run the Prisma migration to create all tables:

```bash
npm run prisma:migrate
# When prompted for a migration name, enter: init
```

Or in one shot:

```bash
npx prisma migrate dev --name init
```

## Generate Prisma Client

After modifying `prisma/schema.prisma`, regenerate the client:

```bash
npm run prisma:generate
```

## Seed Demo Data

Populate the database with demo users, project, issues, and AI analysis:

```bash
npm run prisma:seed
```

This creates:
- ✅ 2 users (Alice Tester, Bob Developer)
- ✅ 1 project (BugLens Demo Project)
- ✅ 3 realistic issues (UI, Backend, Performance)
- ✅ 1 AI analysis with 2 test case suggestions

## Prisma Studio (Database GUI)

```bash
npm run prisma:studio
# Opens browser UI at http://localhost:5555
```

## Run Development Server

```bash
npm run start:dev
# Runs on http://localhost:3000/api
```

## API Base URL

```
http://localhost:3000/api
```

## Build for Production

```bash
npm run build
```
