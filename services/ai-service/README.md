# services/ai-service

**BugLens AI Service** — A FastAPI Python microservice that provides
rule-based bug analysis for the BugLens platform.

---

## Overview

This service receives a bug report payload from the backend API and returns:

| Output | Method |
|--------|--------|
| Bug category (UI / NETWORK / BACKEND / FRONTEND / PERFORMANCE / AUTH / DATA) | Keyword matching on title, description, errorMessage, stackTrace |
| Predicted severity (CRITICAL / HIGH / MEDIUM / LOW) | Keyword matching with reporter's severity as a hint |
| One-sentence summary | Template filled with category + severity + component |
| Root cause suggestion | Per-category template filled with className/methodName |
| Confidence score (0.0 – 1.0) | Number of keyword hits for the winning category |
| Duplicate candidates | `difflib.SequenceMatcher` text similarity (threshold 0.45) |
| 2-3 test case suggestions | Deterministic templates per category |

**No external APIs. No internet. No paid services. Pure Python.**

---

## Tech Stack

| Technology | Role |
|------------|------|
| FastAPI | Python web framework |
| Python 3.11 | Runtime |
| Pydantic v2 | Request/response validation |
| `difflib` (stdlib) | Text similarity for duplicate detection |
| uvicorn | ASGI server |

---

## File Structure

```
services/ai-service/
├── main.py                     # FastAPI app — endpoints: GET /, GET /health, POST /analyze
├── requirements.txt            # pip dependencies
├── Dockerfile                  # Container definition
├── README.md                   # This file
└── app/
    ├── __init__.py
    ├── models.py               # Pydantic request/response schemas
    ├── analyzer.py             # Category, severity, summary, root cause, duplicate detection
    └── test_case_generator.py  # Test case template generation
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| POST | `/analyze` | Full rule-based analysis of a bug report |

Swagger UI (auto-generated): **http://localhost:8000/docs**

---

## Getting Started — Local Development

### Option A: Run directly with Python

```bash
# 1. Navigate to this service directory
cd services/ai-service

# 2. (Recommended) Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload --port 8000
```

The API is now available at **http://localhost:8000**.

### Option B: Run with Docker Compose

```bash
# From the project root
docker compose up ai-service --build
```

---

## Sample curl Commands

### Health check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "success": true,
  "message": "AI service is healthy",
  "data": { "status": "ok", "service": "buglens-ai-service" }
}
```

---

### Analyze a bug report (minimal)

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issueId": "abc-123",
    "title": "Login button unresponsive on mobile",
    "description": "Clicking login does nothing on iOS Safari",
    "errorMessage": "TypeError: Cannot read properties of null (reading 'click')",
    "component": "LoginForm",
    "environment": "PRODUCTION"
  }'
```

---

### Analyze with duplicate detection

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issueId": "new-999",
    "title": "Page crashes on slow network",
    "description": "App becomes unresponsive when network is slow",
    "errorMessage": "Network timeout after 5s",
    "url": "https://app.example.com/dashboard",
    "browser": "Chrome 120",
    "os": "Windows 11",
    "environment": "PRODUCTION",
    "existingIssues": [
      {
        "issueId": "old-001",
        "title": "Application freezes on slow connection",
        "description": "App hangs when network is slow"
      },
      {
        "issueId": "old-002",
        "title": "Button not working",
        "description": "Submit button does not respond"
      }
    ]
  }'
```

---

## Analysis Logic Summary (for GR1 report)

### 1. Category Classification (`analyzer.py › classify_category`)
- 8 keyword lists, one per category (AUTH, BACKEND, NETWORK, PERFORMANCE, UI, DATA, FRONTEND, UNKNOWN)
- All text fields are concatenated and lowercased
- The category whose keyword list gets the most hits wins
- Confidence = 0.5 base + 0.05 per extra hit (max 0.95)

### 2. Severity Prediction (`analyzer.py › predict_severity`)
- Critical keywords (crash, data loss, cannot login) → always CRITICAL
- Otherwise: reporter's severity is used as a starting hint
- Downgrade LOW → HIGH if high-severity error keywords are detected

### 3. Duplicate Detection (`analyzer.py › detect_duplicates`)
- Uses Python's built-in `difflib.SequenceMatcher`
- Compares title + description + errorMessage as a single "fingerprint"
- Returns issues with similarity ≥ 0.45, sorted by score descending
- No database access needed — the backend sends existing issue summaries

### 4. Test Case Generation (`test_case_generator.py`)
- TC-1: Always — reproduce the exact bug (browser, URL, component steps)
- TC-2: Category-specific edge case (responsive test for UI, null-check for FRONTEND, etc.)
- TC-3: Always — verify the fix works with regression steps

---

> ⚠️ Backend-to-AI-service integration is implemented in **Mission 5**.
> This service can be tested independently via the curl commands above.
