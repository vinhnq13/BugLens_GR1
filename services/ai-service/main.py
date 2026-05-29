"""
main.py
=======
BugLens AI Service — FastAPI application entry point.

Run with:
    uvicorn main:app --reload --port 8000

Auto-generated API docs (Swagger UI):
    http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import AnalyzeRequest, AnalysisResult
from app.analyzer import (
    classify_category,
    predict_severity,
    build_summary,
    suggest_root_cause,
    detect_duplicates,
)
from app.test_case_generator import generate_test_cases

# ─────────────────────────────────────────────────────────────────────────────
# Application setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BugLens AI Service",
    description=(
        "Rule-based bug analysis service for the BugLens platform. "
        "Classifies bug reports, predicts severity, detects duplicates, "
        "suggests root causes, and generates test case templates."
    ),
    version="1.0.0",
)

# Allow cross-origin requests from the NestJS backend and dashboard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# GET /  — Root welcome message
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Welcome endpoint — confirms the service is running."""
    return {
        "service": "BugLens AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /health  — Health check
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """
    Health check endpoint used by Docker and the backend-api to verify
    that this service is alive and ready to accept requests.
    """
    return {
        "success": True,
        "message": "AI service is healthy",
        "data": {
            "status": "ok",
            "service": "buglens-ai-service",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /analyze  — Main analysis endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/analyze")
def analyze_issue(req: AnalyzeRequest):
    """
    Analyze a bug report and return:
    - Bug category (UI / NETWORK / BACKEND / FRONTEND / PERFORMANCE / AUTH / DATA / UNKNOWN)
    - Predicted severity (CRITICAL / HIGH / MEDIUM / LOW)
    - A short human-readable summary
    - A root cause suggestion
    - A confidence score (0.0 – 1.0)
    - Duplicate candidates (if existingIssues were provided)
    - 2-3 test case suggestions

    All logic is rule-based — no external APIs are called.
    """
    try:
        # ── Step 1: Category classification ──────────────────────────────────
        category, confidence = classify_category(req)

        # ── Step 2: Severity prediction ───────────────────────────────────────
        severity = predict_severity(req)

        # ── Step 3: One-sentence summary ──────────────────────────────────────
        summary = build_summary(req, category, severity)

        # ── Step 4: Root cause suggestion ─────────────────────────────────────
        root_cause = suggest_root_cause(req, category)

        # ── Step 5: Duplicate detection ───────────────────────────────────────
        duplicates = detect_duplicates(req, req.existingIssues or [])

        # ── Step 6: Test case generation ──────────────────────────────────────
        test_cases = generate_test_cases(req, category)

        # ── Assemble result ───────────────────────────────────────────────────
        result = AnalysisResult(
            category=category,
            predictedSeverity=severity,
            summary=summary,
            rootCauseSuggestion=root_cause,
            confidenceScore=confidence,
            duplicateCandidates=duplicates,
            testCaseSuggestions=test_cases,
        )

        return {
            "success": True,
            "message": "Issue analyzed successfully",
            "data": result.model_dump(),
        }

    except Exception as exc:  # pragma: no cover
        # Surface unexpected errors clearly during development.
        raise HTTPException(status_code=500, detail=str(exc)) from exc
