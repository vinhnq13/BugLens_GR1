# apps/demo-target-web

**BugLens Demo Target Web** — A simple web application intentionally containing common bugs, used to demonstrate the BugLens bug reporting workflow in action.

## Purpose

This app serves as the **target application** during demos and testing:

- Shows a realistic-looking web page with deliberate bugs (UI glitches, broken interactions, JS errors)
- Allows the presenter to trigger bugs and demonstrate the full BugLens flow
- Used in project defense presentations

## Planned Content

| Bug Type | Description |
|---|---|
| UI layout bug | A broken or misaligned element |
| JavaScript error | A button that throws a console error |
| Form bug | A form that submits incorrectly |
| Broken link | A navigation link pointing to a 404 page |

## Tech Stack

This app is intentionally simple:

- Plain **HTML + CSS + JavaScript** (no framework)
- Can be opened directly in a browser or served with any static file server

## Running

```bash
# Option 1 — Open directly
# Double-click index.html in your file explorer

# Option 2 — Serve with Node
npx serve .
# Runs on http://localhost:3001
```

> ⚠️ Implementation begins alongside **Phase 5** (Browser Extension) for integrated demo testing.
