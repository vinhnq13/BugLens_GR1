"""
app/test_case_generator.py
==========================
Generates 2-3 test case suggestions for a bug report.

Logic:
- Always generate a "reproduce the bug" test case.
- Generate a category-specific "boundary / edge case" test.
- Always generate a "verify the fix" test case.

All test cases are deterministic templates filled with data from the request.
No ML, no randomness — the same input always produces the same output.
"""

from __future__ import annotations

from typing import List

from app.models import AnalyzeRequest, TestCaseSuggestion


# ─────────────────────────────────────────────────────────────────────────────
# Public function
# ─────────────────────────────────────────────────────────────────────────────

def generate_test_cases(req: AnalyzeRequest, category: str) -> List[TestCaseSuggestion]:
    """Return 2-3 test case suggestions based on the issue context and category."""
    suggestions: List[TestCaseSuggestion] = []

    # Test Case 1: always — reproduce the reported bug
    suggestions.append(_reproduce_test_case(req))

    # Test Case 2: category-specific edge/boundary test
    edge_case = _category_edge_case(req, category)
    if edge_case:
        suggestions.append(edge_case)

    # Test Case 3: always — verify the fix works
    suggestions.append(_verify_fix_test_case(req, category))

    return suggestions


# ─────────────────────────────────────────────────────────────────────────────
# Individual test case builders
# ─────────────────────────────────────────────────────────────────────────────

def _reproduce_test_case(req: AnalyzeRequest) -> TestCaseSuggestion:
    """TC-1: Steps to reproduce the exact bug."""
    url_step = f"Navigate to: {req.url}" if req.url else "Navigate to the affected page."
    env_step = f"Use environment: {req.environment}." if req.environment else "Use the affected environment."
    browser_step = f"Open in {req.browser}." if req.browser else "Open in the reported browser."
    component_step = (
        f"Interact with the '{req.component}' component."
        if req.component
        else "Interact with the affected component or UI element."
    )
    error_step = (
        f"Observe the error: '{req.errorMessage}'."
        if req.errorMessage
        else "Observe the reported error or unexpected behavior."
    )

    return TestCaseSuggestion(
        title=f"Reproduce: {req.title or 'the reported bug'}",
        steps=[
            browser_step,
            env_step,
            url_step,
            component_step,
            error_step,
        ],
        expectedResult=(
            "The bug should be consistently reproducible under these conditions. "
            "Take a screenshot and collect console/network logs for reference."
        ),
    )


def _category_edge_case(req: AnalyzeRequest, category: str) -> TestCaseSuggestion | None:
    """TC-2: Category-specific edge case test."""
    comp = req.component or "the component"

    if category == "UI":
        return TestCaseSuggestion(
            title=f"Responsive layout check for '{comp}'",
            steps=[
                "Open the page in Chrome DevTools (F12).",
                "Toggle the Device Toolbar (Ctrl+Shift+M).",
                "Test at viewports: 320px (mobile), 768px (tablet), 1440px (desktop).",
                f"Inspect '{comp}' at each breakpoint for overflow, misalignment, or hidden elements.",
            ],
            expectedResult=(
                f"'{comp}' should render correctly at all tested viewport sizes "
                "with no overflow, clipping, or layout breaks."
            ),
        )

    if category == "NETWORK":
        return TestCaseSuggestion(
            title="Network failure / slow connection simulation",
            steps=[
                "Open Chrome DevTools → Network tab.",
                "Set throttling to 'Slow 3G'.",
                "Reload the page and trigger the same action that caused the bug.",
                "Also test with the Network tab 'Offline' checkbox enabled.",
            ],
            expectedResult=(
                "The application should show a meaningful loading state or error message. "
                "It should NOT crash or display a blank screen under poor network conditions."
            ),
        )

    if category in ("FRONTEND", "BACKEND", "DATA"):
        method = req.methodName or "the function"
        cls = req.className or "the class"
        return TestCaseSuggestion(
            title=f"Null/undefined boundary test for {cls}.{method}",
            steps=[
                f"Locate '{cls}.{method}' in the codebase.",
                "Write a unit test that passes null, undefined, and empty string as inputs.",
                "Write a unit test that passes an object missing expected properties.",
                "Run the tests and observe whether exceptions are thrown.",
            ],
            expectedResult=(
                f"'{cls}.{method}' should handle null/undefined inputs gracefully "
                "without throwing unhandled exceptions. Add defensive checks if needed."
            ),
        )

    if category == "PERFORMANCE":
        return TestCaseSuggestion(
            title="Performance profiling under load",
            steps=[
                "Open Chrome DevTools → Performance tab.",
                "Click 'Record', then trigger the slow action.",
                "Stop recording and inspect the flame chart for long tasks (>50ms).",
                "Check the Network tab for large payloads or many sequential requests.",
            ],
            expectedResult=(
                "No single task should block the main thread for more than 50ms. "
                "The page should respond within 2 seconds under normal conditions."
            ),
        )

    if category == "AUTH":
        return TestCaseSuggestion(
            title="Session expiry and token refresh test",
            steps=[
                "Log in with a valid user account.",
                "Wait for the JWT/session token to expire (or manually clear it from localStorage).",
                "Attempt to perform an authenticated action.",
                "Observe the application's response.",
            ],
            expectedResult=(
                "The application should redirect to the login page with a clear message. "
                "It should NOT show a blank page or an unhandled error."
            ),
        )

    # No specific edge case for UNKNOWN category
    return None


def _verify_fix_test_case(req: AnalyzeRequest, category: str) -> TestCaseSuggestion:
    """TC-3: Verify that the bug fix actually works."""
    title_hint = req.title or "the reported bug"
    comp_hint = f"in '{req.component}'" if req.component else "in the affected area"

    return TestCaseSuggestion(
        title=f"Verify fix: {title_hint}",
        steps=[
            "Apply the proposed fix to the codebase.",
            "Run the full regression test suite to check for side effects.",
            f"Repeat all reproduction steps from TC-1 {comp_hint}.",
            "Confirm that the error message no longer appears.",
            "Test on at least one additional browser/device to prevent regressions.",
        ],
        expectedResult=(
            "The original bug should no longer be reproducible. "
            "All existing functionality should continue to work correctly. "
            f"The fix should be verified on the {req.environment or 'affected'} environment."
        ),
    )
