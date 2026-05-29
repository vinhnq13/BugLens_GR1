"""
app/models.py
=============
Pydantic models for the AI service request and response payloads.

Keeping all data shapes in one file makes it easy to understand
what information flows in and out of the /analyze endpoint.
"""

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel


# ─────────────────────────────────────────────────────────────────────────────
# Input models
# ─────────────────────────────────────────────────────────────────────────────

class ExistingIssue(BaseModel):
    """
    A brief summary of an already-stored issue used for duplicate detection.
    The backend sends these so we can compare titles/descriptions without
    the AI service needing direct database access.
    """
    issueId: str
    title: str
    description: Optional[str] = None
    errorMessage: Optional[str] = None


class AnalyzeRequest(BaseModel):
    """
    The full context of a bug report sent to POST /analyze.
    All fields except issueId are optional because the browser extension
    may not capture every piece of context on every page.
    """
    issueId: str

    # Core text fields
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None

    # Browser context
    url: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    viewport: Optional[str] = None

    # Error context
    errorMessage: Optional[str] = None
    stackTrace: Optional[str] = None
    consoleLogs: Optional[str] = None
    networkLogs: Optional[str] = None

    # Environment / release metadata
    environment: Optional[str] = None

    # Code location hints
    component: Optional[str] = None
    packageName: Optional[str] = None
    className: Optional[str] = None
    methodName: Optional[str] = None

    # Existing issues for duplicate detection (optional list)
    existingIssues: Optional[List[ExistingIssue]] = None


# ─────────────────────────────────────────────────────────────────────────────
# Output models
# ─────────────────────────────────────────────────────────────────────────────

class DuplicateCandidate(BaseModel):
    """A potential duplicate issue with a similarity score and reason."""
    issueId: str
    similarityScore: float
    reason: str


class TestCaseSuggestion(BaseModel):
    """A single suggested test case to verify a bug fix."""
    title: str
    steps: List[str]
    expectedResult: str


class AnalysisResult(BaseModel):
    """The structured analysis output returned by the AI service."""
    category: str
    predictedSeverity: str
    summary: str
    rootCauseSuggestion: str
    confidenceScore: float
    duplicateCandidates: List[DuplicateCandidate]
    testCaseSuggestions: List[TestCaseSuggestion]
