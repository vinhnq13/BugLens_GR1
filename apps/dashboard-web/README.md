# apps/dashboard-web

**BugLens Dashboard Web** — The main frontend interface for developers and project managers.

## Purpose

This React + Vite + TypeScript application provides the visual interface for:

- Viewing all submitted bug reports in a searchable list
- Reviewing individual issue detail with screenshot preview
- Reading AI analysis results (category, severity, root cause, test cases)
- Updating issue status through the lifecycle workflow (Open → In Progress → Resolved)
- Viewing analytics and charts

## Planned Tech Stack

| Technology | Role |
|---|---|
| React 18 | UI library |
| Vite | Build tool / dev server |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Axios | HTTP client for API calls |

## Planned Pages

| Route | Page | Description |
|---|---|---|
| `/` | Overview | Summary charts and recent issues |
| `/issues` | Issue List | Filterable, searchable list of all issues |
| `/issues/:id` | Issue Detail | Full issue info + screenshot + AI analysis |
| `/projects` | Projects | Project list and management |

## Getting Started (Phase 4)

```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

> ⚠️ Implementation begins in **Phase 4** of the development plan.
