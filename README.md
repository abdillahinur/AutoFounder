# AutoFounder

AutoFounder is a browser-based web application that helps founders go from idea to investor inbox in 60 seconds. It generates AI-powered pitch decks and enables instant download as PowerPoint (.pptx) files—no backend required. All generation and export logic runs client-side for privacy and speed.

## 🚀 Live Demo

Visit [AutoFounder](https://autofounder.com) to create your pitch deck in 60 seconds.

## ✨ Key Features

- **⚡ 60-Second Pitch Deck Creation** - From idea to investor-ready deck
- **🤖 AI-Powered Content Enhancement** - Gemini AI improves your pitch content
- **🖼️ Smart Image Integration** - Pixabay API adds relevant images when they fit
- **🎨 Premium Multi-Step Form** - Clean, Linear/Notion-inspired UI with validation
- **📊 Smart Progress Tracking** - Visual progress bar and step navigation
- **🔒 Form Validation** - Cannot advance without completing required fields
- **💾 Instant PowerPoint Export** - Download as .pptx file immediately
- **🎯 Custom Templates** - Multiple deck themes and backgrounds
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🔐 Privacy-First** - All processing happens in your browser

## Tech Stack

AutoFounder is built with a modern, production-ready stack:
# AutoFounder

AutoFounder is a client-first, browser-based app that generates investor-ready pitch decks in the browser. The app focuses on speed, privacy, and a smooth demo flow — generation, preview, and PPTX export are all handled client-side.

Key ideas:
- All generation runs in the user's browser (no backend required for the demo flow).
- The generator can optionally enhance content using Gemini (lazy-loaded).
- Viewer and exporter try to keep on-screen appearance and exported PPTX visually consistent.

## Live / Demo
This repo contains the demo app used during development. The dev server runs with Vite:

```bash
npm run dev
```

## Tech stack
- React + TypeScript
- Vite (dev server + build)
- TailwindCSS for styling
- pptxgenjs for PPTX export
- @google/generative-ai (optional enhancement)
- pixabay-api for optional images
- framer-motion, lucide-react, clsx, uuid

## Quick start

1. Install dependencies

```bash
npm install
```

2. Add environment variables (optional)

Create `.env` with keys such as `VITE_GEMINI_API_KEY` and `VITE_PIXABAY_API_KEY` when you want AI/image features enabled.

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173

## How the demo flow works (current wiring)

- The intake modal (`src/components/DeckFormModal.tsx`) opens a small placeholder tab on submit. It opens `/#loading` so the new tab shows a friendly loading UI instead of a blank page.
- The generator hook (`src/hooks/useGenerateDeck.ts`) does the heavy lifting client-side:
   - Enhances content (optional) via Gemini (lazy import). It posts status updates to the placeholder window (`DECK_STATUS` messages such as "Enhancing content…", "Generating slides…", "Preparing viewer…").
   - Builds a deterministic `Deck` JSON object.
   - Persists the deck to `localStorage` under `deck:<id>` when possible and writes `deck:last` for fallback polling.
   - Broadcasts the deck via `BroadcastChannel('deck:<id>')` and also sends a concise announcement on `BroadcastChannel('deck:announce')` with { id, mode, payload? }.
   - Posts a `{ type: 'DECK_READY', id, mode, payload? }` message to the placeholder window (same-origin), but does not navigate it — the loading screen handles navigation.

- The placeholder tab shows `LoadingScreen` (`src/components/LoadingScreen.tsx`). It:
   - Listens for `BroadcastChannel('deck:announce')` and window `message` events for `DECK_READY` and `DECK_STATUS`.
   - Polls `localStorage.getItem('deck:last')` every 500ms (up to ~10s) as a fallback.
   - When the deck id (or inline payload) arrives, it updates `location.hash` to `#deck=<id>` or `#deckdata=<payload>` and reloads the page so `src/main.tsx` runs its boot logic and mounts the `DeckViewer`.

- `src/main.tsx` boot logic supports the following entry points:
   - `#loading` — renders `LoadingScreen` (used while generation is in progress).
   - `#deckdata=<base64>` — inline deck JSON (used if localStorage writes are blocked).
   - `#deck=<id>` — viewer reads `localStorage.getItem('deck:<id>')` or waits briefly on `BroadcastChannel('deck:<id>')`.

## Viewer & Presentation

- `src/components/DeckViewer.tsx` renders slides, handles keyboard navigation, and contains a Present mode (fullscreen with fallback to a presenter window `#deck=<id>&present=1`).
- The Present mode uses a `stageRef` container and a `useFullscreen` hook; if requestFullscreen is unavailable, the presenter opens a new tab and the other tab auto-presents.
- Hotkeys are supported via `useSlideHotkeys` (←/→, Space, B, Esc, Home, End).
- Watermarks were removed from both UI and exports (free/demo decks no longer overlay tiled watermarks).

## PPTX Export

- Export is implemented in `src/components/DeckViewer.tsx` (dynamic import of `pptxgenjs`).
- The exporter prefers theme assets from `deck.meta.themeAssets` and per-slide `textTone` to choose high-contrast text colors (black/white). Exports avoid semi-opaque scrims so slides remain editable in PowerPoint.

## Files of interest
- `src/hooks/useGenerateDeck.ts` — main generator hook (deterministic deck builder + optional Gemini enhancement + persistence + announcements)
- `src/components/DeckFormModal.tsx` — multi-step intake form and submit flow
- `src/components/LoadingScreen.tsx` — loading UI that listens for deck-ready events
- `src/components/DeckViewer.tsx` — viewer + PPTX export + Present mode
- `src/hooks/useFullscreen.ts` / `src/hooks/useSlideHotkeys.ts` — helper hooks for presentation features

## Development notes
- To avoid popup blockers, the form opens the placeholder window synchronously and passes it to the generator so it can receive `postMessage` updates.
- LoadingScreen now updates its UI from `DECK_STATUS` messages so users see short progress steps while the generator runs.
- When the app sets `location.hash` to `#deck=...` or `#deckdata=...`, `src/main.tsx` re-runs boot logic on page load and mounts the viewer.

## Troubleshooting
- If you get stuck on the loading screen, check the browser console for BroadcastChannel / postMessage messages and ensure that `deck:last` appears in `localStorage` for the generated id.

## Development status
See `PHASES.md` for an up-to-date phase-by-phase breakdown.

---

## Contributing

Contributions welcome — open a PR with focused changes. Keep changes small and include a short description of manual verification steps.

## License

MIT
