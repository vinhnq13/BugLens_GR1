# 🔍 BugLens — AI-powered Web Bug Reporting and Analysis Platform

> **GR1 University Project** — A microservices-oriented system that lets testers report bugs via a Chrome extension and lets developers triage, classify, and resolve them through an AI-enhanced dashboard.

---

## 📖 Project Overview

BugLens allows users and testers to report bugs directly from any web application using a **Chrome browser extension**. When a bug occurs, the extension captures:

- Current page URL
- Browser & OS information
- Viewport size
- Screenshot (via `chrome.tabs.captureVisibleTab`)
- Console logs and network information (when available)
- User-provided title and description

Reports are sent to the **Backend API**, stored in **PostgreSQL**, and forwarded to the **AI Service** for automated analysis. Developers then review issues through the **Dashboard Web**, update statuses, and review AI-generated insights such as bug category, severity, root cause suggestion, and test cases.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BugLens System                           │
│                                                                 │
│  ┌───────────────┐    HTTP/REST    ┌──────────────────────────┐ │
│  │ Browser       │ ─────────────► │ Backend API              │ │
│  │ Extension     │                │ (NestJS + Prisma)        │ │
│  │ (Chrome MV3)  │                │                          │ │
│  └───────────────┘                │  ┌──────────────────┐   │ │
│                                   │  │ Issue Module     │   │ │
│  ┌───────────────┐    HTTP/REST   │  │ Project Module   │   │ │
│  │ Dashboard     │ ◄────────────► │  │ Comment Module   │   │ │
│  │ Web           │                │  │ Analytics Module │   │ │
│  │ (React + Vite)│                │  └──────────────────┘   │ │
│  └───────────────┘                │           │              │ │
│                                   │     HTTP   ▼             │ │
│  ┌───────────────┐                │  ┌──────────────────┐   │ │
│  │ Demo Target   │                │  │ AI Service       │   │ │
│  │ Web           │                │  │ (FastAPI/Python) │   │ │
│  │ (Sample App)  │                │  └──────────────────┘   │ │
│  └───────────────┘                └──────────────────────────┘ │
│                                            │                    │
│                              ┌─────────────┴─────────────┐     │
│                              │         Data Layer         │     │
│                              │  PostgreSQL 16 │ Redis 7   │     │
│                              └───────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

The project follows a **microservices-oriented architecture**. For the GR1 MVP, business logic lives in modular modules inside `backend-api`. The `ai-service` is a completely separate Python service. This design allows future extraction into independent deployable microservices.

---

## 📦 Modules

| Module | Location | Responsibility |
|---|---|---|
| **Browser Extension** | `apps/browser-extension/` | Capture bug context and submit reports |
| **Dashboard Web** | `apps/dashboard-web/` | Issue management UI for developers |
| **Demo Target Web** | `apps/demo-target-web/` | Sample buggy web app for demonstration |
| **Backend API** | `services/backend-api/` | REST API, issue/project lifecycle, AI orchestration |
| **AI Service** | `services/ai-service/` | Bug classification, severity, duplicate detection, test case gen |

---

## 🔄 MVP Flow

```
[User] opens demo-target-web
    → bug occurs on the page
    → user opens browser-extension popup
    → extension captures screenshot + context (URL, browser, OS, viewport)
    → user fills in title & description, submits
    → extension sends POST /issues to backend-api
    → backend-api saves issue to PostgreSQL
    → backend-api calls ai-service for analysis
    → ai-service returns: category, severity, duplicate flag, root cause, test case
    → backend-api stores AI result
    → developer opens dashboard-web
    → dashboard shows issue list + AI analysis panel
    → developer updates issue status (Open → In Progress → Resolved)
```

---

## 🛠️ Planned Tech Stack

| Layer | Technology |
|---|---|
| Dashboard Web | React 18 + Vite + TypeScript + Tailwind CSS |
| Browser Extension | Chrome Extension Manifest V3 + TypeScript |
| Backend API | NestJS + TypeScript |
| AI Service | FastAPI + Python 3.11 |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 🗂️ Repository Structure

```
BugLens_GR1/
├── apps/
│   ├── dashboard-web/        # React + Vite frontend dashboard
│   ├── browser-extension/    # Chrome Extension (MV3)
│   └── demo-target-web/      # Sample web app for bug demos
├── services/
│   ├── backend-api/          # NestJS REST API
│   └── ai-service/           # FastAPI AI analysis service
├── docs/
│   ├── srs/                  # Software Requirements Specification
│   ├── sdd/                  # Software Design Document
│   ├── diagrams/             # Architecture & flow diagrams
│   ├── api/                  # API documentation (OpenAPI/Swagger)
│   └── testcases/            # Test case documents
├── datasets/
│   ├── raw/                  # Raw bug report datasets
│   └── processed/            # Cleaned/labelled datasets for AI training
├── docker-compose.yml        # PostgreSQL + Redis infrastructure
├── README.md                 # This file
├── PROJECT_CONTEXT.md        # Project context and design rules
└── TASKS.md                  # Development task checklist
```

---

## 🚀 Local Development

### Prerequisites

- **Docker Desktop** (for PostgreSQL + Redis)
- **Node.js 20+** (for dashboard-web, browser-extension, backend-api)
- **Python 3.11+** (for ai-service)
- **Git**

### Step 1 — Start infrastructure

```bash
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port **5432** (db: `buglens_db`, user: `buglens`)
- Redis 7 on port **6379**

### Step 2 — Start Backend API

```bash
cd services/backend-api
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### Step 3 — Start AI Service

```bash
cd services/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

### Step 4 — Start Dashboard Web

```bash
cd apps/dashboard-web
npm install
npm run dev
# Runs on http://localhost:5173
```

### Step 5 — Load Demo Target Web

```bash
cd apps/demo-target-web
# Open index.html directly in browser, or:
npx serve .
# Runs on http://localhost:3001
```

### Step 6 — Load Browser Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `apps/browser-extension/`

---

## 📄 Documentation

See the [`docs/`](./docs/) folder for:
- SRS (Software Requirements Specification)
- SDD (Software Design Document)
- Architecture diagrams
- API documentation
- Test case documents

---

## 👥 Team

> GR1 University Project — 2026
