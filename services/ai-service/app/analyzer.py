"""
app/analyzer.py
===============
Rule-based bug analysis engine for BugLens AI Service.

Design philosophy
-----------------
- Zero external API calls, zero internet dependency.
- No heavy ML libraries — just Python's standard library + difflib.
- Every decision is deterministic and easy to explain in a GR1 report.
- Each analysis step is its own function so you can test/explain each part
  independently.

Analysis pipeline
-----------------
  classify_category()    → pick UI / NETWORK / BACKEND / FRONTEND / PERFORMANCE / AUTH / DATA
  predict_severity()     → LOW / MEDIUM / HIGH / CRITICAL
  build_summary()        → one-sentence human-readable summary
  suggest_root_cause()   → short paragraph based on category + code hints
  detect_duplicates()    → compare against existingIssues with difflib
  (test cases are handled in test_case_generator.py)
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import List, Optional

from app.models import AnalyzeRequest, DuplicateCandidate, ExistingIssue


# ─────────────────────────────────────────────────────────────────────────────
# Helper: collect all text from the request into a single lowercase string.
# This makes keyword matching simpler — we don't have to check each field
# individually every time.
# ─────────────────────────────────────────────────────────────────────────────

def _all_text(req: AnalyzeRequest) -> str:
    """Return a single lowercase string of all relevant text fields."""
    parts = [
        req.title or "",
        req.description or "",
        req.errorMessage or "",
        req.stackTrace or "",
        req.consoleLogs or "",
        req.networkLogs or "",
        req.component or "",
        req.packageName or "",
        req.className or "",
        req.methodName or "",
        req.url or "",
    ]
    return " ".join(parts).lower()


def _contains_any(text: str, keywords: List[str]) -> bool:
    """Return True if text contains at least one keyword (case-insensitive)."""
    return any(kw in text for kw in keywords)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Category classification
# ─────────────────────────────────────────────────────────────────────────────

# Keyword lists for each category.
# Order matters: the first category that matches wins, so put more specific
# patterns (BACKEND, AUTH) before the generic ones (FRONTEND, UI).

_CATEGORY_RULES = [
    # AUTH: login/logout/session/token problems
    (
        "AUTH",
        ["cannot login", "login failed", "unauthorized", "401", "403",
         "jwt", "token expired", "authentication", "permission denied",
         "access denied", "session expired"],
    ),
    # BACKEND: server-side / database errors
    (
        "BACKEND",
        ["database", "prisma", "sql", "query", "500", "internal server error",
         "db error", "connection refused", "orm", "migration", "relation",
         "foreign key", "constraint", "transaction"],
    ),
    # NETWORK: HTTP / API call failures
    (
        "NETWORK",
        ["fetch", "axios", "cors", "network", "404", "502", "503",
         "timeout", "request failed", "api call", "http error",
         "connection reset", "net::err", "xmlhttprequest"],
    ),
    # PERFORMANCE: slow / high latency
    (
        "PERFORMANCE",
        ["slow", "latency", "performance", "5s", "10s", "freeze",
         "hang", "unresponsive", "memory leak", "high cpu", "fps",
         "lag", "load time", "render time"],
    ),
    # UI: visual / layout issues
    (
        "UI",
        ["button", "layout", "modal", "dialog", "screen", "css",
         "style", "display", "responsive", "overflow", "scroll",
         "z-index", "padding", "margin", "color", "font", "animation",
         "render", "ui", "component", "form", "input", "dropdown"],
    ),
    # DATA: data validation / integrity issues
    (
        "DATA",
        ["validation", "invalid", "required field", "missing field",
         "data loss", "corrupt", "wrong value", "nan", "null pointer",
         "undefined", "type mismatch"],
    ),
    # FRONTEND: JavaScript errors not caught by more specific rules
    (
        "FRONTEND",
        ["typeerror", "referenceerror", "syntaxerror", "uncaught",
         "is not a function", "is not defined", "cannot read",
         "cannot set", "null", "undefined"],
    ),
]


def classify_category(req: AnalyzeRequest) -> tuple[str, float]:
    """
    Return (category_name, confidence_score).

    Each matched rule adds to the confidence score.
    The category with the most keyword hits wins.
    If nothing matches, returns ("UNKNOWN", 0.3).
    """
    text = _all_text(req)
    scores: dict[str, int] = {}

    for category, keywords in _CATEGORY_RULES:
        hit_count = sum(1 for kw in keywords if kw in text)
        if hit_count > 0:
            scores[category] = hit_count

    if not scores:
        return "UNKNOWN", 0.3

    # Pick the category with the highest keyword hit count
    best_category = max(scores, key=lambda c: scores[c])
    total_hits = scores[best_category]

    # Confidence: 0.5 base + 0.05 per extra hit, capped at 0.95
    confidence = min(0.5 + (total_hits - 1) * 0.05, 0.95)
    return best_category, round(confidence, 2)


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Severity prediction
# ─────────────────────────────────────────────────────────────────────────────

_CRITICAL_KEYWORDS = [
    "crash", "critical", "cannot login", "data loss", "security breach",
    "payment", "production down", "outage", "data corruption",
]
_HIGH_KEYWORDS = [
    "error", "exception", "fail", "broken", "not working", "timeout",
    "500", "403", "401", "uncaught", "typeerror", "referenceerror",
]
_LOW_KEYWORDS = [
    "cosmetic", "typo", "color", "font", "spacing", "minor", "style",
    "padding", "margin", "label",
]


def predict_severity(req: AnalyzeRequest) -> str:
    """
    Return one of: CRITICAL / HIGH / MEDIUM / LOW.

    If the reporter already supplied a severity we use it as the starting
    point, then upgrade it if the text contains critical-level keywords.
    """
    text = _all_text(req)

    # Critical override — regardless of reported severity
    if _contains_any(text, _CRITICAL_KEYWORDS):
        return "CRITICAL"

    # If reporter provided severity, trust it unless we have strong signal
    if req.severity:
        reported = req.severity.upper()
        if reported in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
            # Only downgrade to HIGH at minimum if we see error keywords
            if reported == "LOW" and _contains_any(text, _HIGH_KEYWORDS):
                return "HIGH"
            return reported

    # Infer from text
    if _contains_any(text, _HIGH_KEYWORDS):
        return "HIGH"
    if _contains_any(text, _LOW_KEYWORDS):
        return "LOW"
    return "MEDIUM"


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — One-sentence summary
# ─────────────────────────────────────────────────────────────────────────────

def build_summary(req: AnalyzeRequest, category: str, severity: str) -> str:
    """Build a concise one-line summary combining the reported title and analysis."""
    title = (req.title or "An issue").strip()
    env = req.environment or "unknown environment"
    comp = f" in component '{req.component}'" if req.component else ""
    return (
        f"[{severity}] {title}{comp} — classified as {category} issue "
        f"(environment: {env})."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Root cause suggestion
# ─────────────────────────────────────────────────────────────────────────────

# Template strings per category.
# {component}, {class_name}, {method} are filled in from the request.
_ROOT_CAUSE_TEMPLATES = {
    "FRONTEND": (
        "A JavaScript runtime error was detected. "
        "This typically occurs when the code tries to access a property or "
        "call a method on an undefined or null value. "
        "Check variable initialization in {method_hint} and ensure all "
        "async data is loaded before rendering."
    ),
    "BACKEND": (
        "A server-side or database error was detected. "
        "Possible causes include an unhandled exception in {method_hint}, "
        "a failed database query, or a missing null-check on data returned "
        "from the ORM. Review server logs and verify database constraints."
    ),
    "NETWORK": (
        "An HTTP request failed or timed out. "
        "Check whether the API endpoint is reachable, CORS headers are "
        "correctly configured, and network timeout settings are appropriate "
        "for slow connections. Also verify that the server returns the "
        "expected response format."
    ),
    "PERFORMANCE": (
        "A performance bottleneck was detected. "
        "Likely causes include expensive computations on the main thread, "
        "large un-paginated data sets, unoptimized database queries, or "
        "unnecessary re-renders in {component_hint}. "
        "Profile with browser DevTools and consider memoization or pagination."
    ),
    "UI": (
        "A visual or layout issue was detected in {component_hint}. "
        "This is often caused by conflicting CSS rules, missing responsive "
        "breakpoints, or a parent container with overflow hidden. "
        "Inspect the element in browser DevTools and review recent CSS changes."
    ),
    "AUTH": (
        "An authentication or authorization failure was detected. "
        "Possible causes: expired JWT token, incorrect role-based access "
        "control configuration, or a session that was invalidated on the "
        "server. Verify token expiry handling and refresh logic in "
        "{component_hint}."
    ),
    "DATA": (
        "A data validation or integrity error was detected. "
        "The application may be receiving unexpected null/undefined values "
        "or a type mismatch. Add defensive null-checks and input validation "
        "before processing data in {method_hint}."
    ),
    "UNKNOWN": (
        "The issue could not be automatically classified with high confidence. "
        "Review the stack trace and error message manually. "
        "Check recent code changes and verify that all dependencies are "
        "up to date."
    ),
}


def suggest_root_cause(req: AnalyzeRequest, category: str) -> str:
    """Fill in the category template with code-location hints from the request."""
    template = _ROOT_CAUSE_TEMPLATES.get(category, _ROOT_CAUSE_TEMPLATES["UNKNOWN"])

    # Build helpful location hints
    method_hint = (
        f"{req.className}.{req.methodName}()"
        if req.className and req.methodName
        else req.methodName or req.className or "the relevant function"
    )
    component_hint = req.component or req.packageName or "the affected component"

    return template.format(method_hint=method_hint, component_hint=component_hint)


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Duplicate detection using difflib SequenceMatcher
# ─────────────────────────────────────────────────────────────────────────────

_SIMILARITY_THRESHOLD = 0.45  # Issues above this score are flagged as candidates


def _text_similarity(a: str, b: str) -> float:
    """
    Return a similarity ratio between 0.0 and 1.0 using difflib.
    SequenceMatcher finds the longest common subsequence — no ML needed.
    """
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _issue_fingerprint(title: str, description: Optional[str], error: Optional[str]) -> str:
    """
    Create a short text fingerprint for an issue by combining its most
    distinctive fields. This is what we compare with SequenceMatcher.
    """
    return " ".join(filter(None, [title, description, error]))


def detect_duplicates(
    req: AnalyzeRequest,
    existing_issues: List[ExistingIssue],
) -> List[DuplicateCandidate]:
    """
    Compare the incoming issue against a list of existing issues and return
    those whose text similarity score exceeds the threshold.

    Results are sorted by similarity score descending and capped at 5.
    """
    if not existing_issues:
        return []

    incoming_fp = _issue_fingerprint(
        req.title or "",
        req.description,
        req.errorMessage,
    )

    candidates: List[DuplicateCandidate] = []
    for existing in existing_issues:
        existing_fp = _issue_fingerprint(
            existing.title,
            existing.description,
            existing.errorMessage,
        )
        score = _text_similarity(incoming_fp, existing_fp)

        if score >= _SIMILARITY_THRESHOLD:
            reason = _explain_similarity(req, existing, score)
            candidates.append(
                DuplicateCandidate(
                    issueId=existing.issueId,
                    similarityScore=round(score, 3),
                    reason=reason,
                )
            )

    # Sort by score descending, return top 5
    candidates.sort(key=lambda c: c.similarityScore, reverse=True)
    return candidates[:5]


def _explain_similarity(
    req: AnalyzeRequest,
    existing: ExistingIssue,
    score: float,
) -> str:
    """Generate a short human-readable reason for why two issues are similar."""
    if score >= 0.8:
        return (
            f"Very high text similarity ({score:.0%}). "
            "This issue appears to be nearly identical to an existing report."
        )
    if score >= 0.6:
        return (
            f"High text similarity ({score:.0%}) in title and description. "
            "Both issues likely describe the same underlying problem."
        )
    return (
        f"Moderate text similarity ({score:.0%}). "
        "These issues share significant overlapping keywords — "
        "review manually to confirm whether they are duplicates."
    )
