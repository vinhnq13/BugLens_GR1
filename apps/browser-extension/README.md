# apps/browser-extension

**BugLens Browser Extension** — A Chrome Extension (Manifest V3) for capturing and submitting bug reports without leaving the page.

## Purpose

When a user encounters a bug on any web application, this extension lets them:

1. Click the BugLens icon in Chrome's toolbar
2. Fill in a title and description in the popup
3. Capture a screenshot of the current tab automatically
4. Submit the bug report to the BugLens backend API

## Planned Tech Stack

| Technology | Role |
|---|---|
| Chrome Extension Manifest V3 | Extension platform |
| TypeScript | Logic (compiled to JS) |
| HTML + CSS | Popup UI |
| `chrome.tabs.captureVisibleTab` | Screenshot capture |
| `chrome.runtime` | Background service worker |
| Fetch API | HTTP requests to backend |

## Key Extension Files (Phase 5)

```
browser-extension/
├── manifest.json         # Extension manifest (MV3)
├── popup/
│   ├── popup.html        # Bug report form UI
│   ├── popup.ts          # Form logic and submission
│   └── popup.css         # Popup styles
├── background/
│   └── service-worker.ts # Background script (MV3)
└── icons/                # Extension icons (16, 48, 128px)
```

## Loading in Chrome (Development)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder (`apps/browser-extension/`)

> ⚠️ Implementation begins in **Phase 5** of the development plan.
