# CLAUDE.md: Project rules for "Know the Weather"

## Source of truth
- `PRD.md` is the source of truth. Build only what it describes.
- Build **one version at a time** (Version 1, then Version 2, then Version 3). Do not start the next version until I say the current one is done.
- If something is missing or unclear in `PRD.md`, ask me. Do not guess or add extra features.

## Tech rules
- This is a beginner project: **plain HTML, CSS and JavaScript only**.
- Files: `index.html`, `style.css` and `app.js`.
- No libraries, frameworks, build tools or installs.
- The app must open by double-clicking `index.html`.

## Data
- Use only the URLs listed in `PRD.md` (Open-Meteo, plus the free sources named there for Version 4). They all need **no API key**.
- Never add an API key or any paid service.

## Code style
- Keep code simple and easy to read. Prefer small functions with clear names.
- Add comments that explain what each part does, in plain English.

## After every change
1. Explain what you did in plain English (no jargon).
2. Tell me exactly how to test it: what to open, what to type, and what I should see.
