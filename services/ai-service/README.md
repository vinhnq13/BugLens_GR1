# services/ai-service

**BugLens AI Service** — A FastAPI Python service providing automated bug analysis capabilities.

## Purpose

This service receives bug report data from the backend API and returns AI-generated analysis including:

- **Bug Category Classification** — UI, Logic, Performance, Security, etc.
- **Severity Prediction** — Critical, High, Medium, Low
- **Duplicate Detection** — Check if a similar issue already exists
- **Root Cause Suggestion** — Probable cause based on error message and stack trace
- **Test Case Generation** — Suggested test steps to reproduce and verify the fix

## Planned Tech Stack

| Technology | Role |
|---|---|
| FastAPI | Python web framework |
| Python 3.11 | Runtime |
| Pydantic | Request/response validation |
| scikit-learn / transformers | ML models for classification |
| sentence-transformers | Text embeddings for duplicate detection |
| uvicorn | ASGI server |

## Planned Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/analyze` | Full analysis of a single bug report |
| `POST` | `/classify` | Bug category classification only |
| `POST` | `/severity` | Severity prediction only |
| `POST` | `/duplicate` | Duplicate detection against existing issues |
| `GET` | `/health` | Health check |

## API Base URL

```
http://localhost:8000
```

FastAPI auto-docs available at:
```
http://localhost:8000/docs
```

## Getting Started (Phase 3)

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> ⚠️ Implementation begins in **Phase 3** of the development plan.
