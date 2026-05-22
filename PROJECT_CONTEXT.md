# BugLens GR1 Project Context

## Project Name
BugLens - AI-powered Web Bug Reporting and Analysis Platform

## Vietnamese Name
BugLens: Hệ thống hỗ trợ thu thập, quản lý và phân tích lỗi cho ứng dụng web.

## Goal
Build a system that allows users/testers to report bugs directly from a web application using a Chrome browser extension. The system automatically collects error context including current URL, browser information, operating system, viewport size, screenshot, error message, stack trace, console logs, and network information when available.

The collected bug reports are stored in a backend system and displayed on a visual dashboard. Developers can track, classify, assign, and resolve bugs through a lifecycle workflow. The system integrates AI techniques to classify bugs, detect duplicate issues, suggest root causes, and generate test cases to verify bug fixes.

## Architecture Direction
The project follows a microservices-oriented architecture. For the GR1 MVP, business services can be implemented as modules inside a modular backend-api, while AI is implemented as a separate ai-service. The design should allow future extraction into independent microservices.

## Tech Stack
- Dashboard Web: React + Vite + TypeScript + Tailwind CSS
- Browser Extension: Chrome Extension Manifest V3 + JavaScript/TypeScript
- Backend API: NestJS + TypeScript
- AI Service: FastAPI + Python
- Database: PostgreSQL
- Cache/Queue: Redis
- ORM: Prisma
- Container: Docker Compose
- CI/CD: GitHub Actions

## Main Modules
1. Browser Extension
2. Dashboard Web
3. Backend API
4. AI Analysis Service
5. Database Layer
6. DevOps / CI-CD

## MVP Flow
User opens demo web app -> bug occurs -> user opens extension -> extension captures screenshot and context -> sends bug report to backend -> backend saves issue -> AI analyzes issue -> dashboard displays issue and AI result -> developer updates status and reviews generated test case.

## Required Features

### Browser Extension
- Popup bug report form
- Capture current tab URL
- Capture screenshot
- Collect browser/userAgent
- Collect viewport
- Submit report to backend

### Backend API
- Project management
- Issue management
- Comment management
- Status workflow
- AI analysis integration
- Analytics API

### AI Analysis
- Bug category classification
- Severity prediction
- Duplicate detection
- Root cause suggestion
- Test case generation

### Dashboard
- Overview dashboard
- Issue list
- Issue detail
- Screenshot preview
- AI analysis panel
- Status update
- Analytics charts

## Important Design Rule
Keep the code beginner-friendly, modular, and easy to explain in a GR1 defense.
Do not over-engineer the implementation.
Do not implement features outside the current mission unless explicitly requested.