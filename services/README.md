# services/

This directory contains all **backend** services in the BugLens monorepo.

| Service | Description |
|---|---|
| `backend-api/` | NestJS REST API — issue management, project lifecycle, AI orchestration |
| `ai-service/` | FastAPI Python service — bug classification, severity prediction, duplicate detection, root cause suggestion, test case generation |

Each service is self-contained with its own dependencies and Dockerfile (added in Phase 6).
