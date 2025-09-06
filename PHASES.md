PitchJet / AutoFounder — Phases, current status, and next steps

This document maps the original 12-hour runbook into concrete checkpoints, shows what is implemented in the current repository, and lists the next actions and cut-lines so you can guarantee a demo.

Quick status summary
- App shell, UI, and multi-step intake form: IMPLEMENTED (see `src/App.tsx`, `src/components/DeckFormModal.tsx`).
- Slide templates and client-side PPTX export: IMPLEMENTED (see `lib/deckTemplates.ts`, `utils/generatePitchDeckPPTX.ts`). PPTX exporter chooses high-contrast black/white text per-slide.
- Toasts, dialog, and UI components: IMPLEMENTED (`src/components/ui/*`).
- Deck viewer component, deterministic deck JSON generator (`utils/generateDeckJSON.ts`), and client-side PPTX export: IMPLEMENTED. LLM classification, LLM-driven deck generation, outbound send, pixel tracking, stripe paywall, html2pdf export, and event pipeline: NOT IMPLEMENTED / STUBBED.
- Background images exist under `public/images/` but were not committed in the previous step.

Project goals (reminder)
- Persona: builders/entrepreneurs (pre-seed)
- Slides: 8 core slides (cover, problem, solution, market, business_model, traction/roadmap, team, ask)
- Export: client-side PPTX (done). PDF/html2pdf is optional next.
- Outbound: Resend + 1×1 pixel tracking (planned).
- Storage: local/in-memory for demo (no auth)
- Paywall: Stripe Checkout optional

Checklist for this session (what you asked for)
- [x] Review repo and map current progress to the original phases.
- [x] Create a new phases/readme file with phases, status, next steps, and cut-lines.
- [ ] (Optional next) Stage and make the two commits you asked about (images first, then code). I can prepare commit commands.

Phase-by-phase (updated)

Phase 0 — Bootstrap & Brand (0:00–0:30)
Status: DONE
What exists:
- Vite + React + TypeScript + Tailwind scaffold (`vite.config.ts`, `package.json`, `tailwind.config.js`).
- Base landing pages and single-page app in `src/App.tsx`.
- Brand tokens: current CSS uses `--accent`; consider standardizing to `--brand: #6366F1`.
Next actions:
- Optional: standardize CSS variables in `src/index.css`.
Cut Line: Already satisfied.

Phase 1 — Intake Form (0:30–2:00)
Status: DONE (multi-step form implemented)
What exists:
- `src/components/DeckFormModal.tsx` with required & optional fields, validation, review step.
- `ToastProvider` and UI pieces for UX.
Next actions:
- Add Zod validation schemas if you want runtime/compile-time checks.
Cut Line: OK.

Phase 2 — Category → Theme (LLM #1)
Status: NOT IMPLEMENTED (LLM classification missing)
What exists:
- No LLM integration; `src/App.tsx` has TODOs for Convex/LLM hooks.
Next actions (quick demo path):
- Implement a hard-mapping: map `sector` or `model` text to themes (fintech → investor, devtools → minimal, consumer → bold). Store label object in-memory with an id.
- When ready, wire an async stub in `src/actions/classify.ts` (or inline) that returns {category, theme, slideHints}.
Cut Line: hard-map sector→theme only (fast).

Phase 3 — Deck JSON (LLM #2)
Status: PARTIAL — A deterministic `generateDeckJSON` is implemented for demos; LLM-driven JSON generation is not implemented.
What exists:
- `lib/deckTemplates.ts` defines slide fields and keys to map from the form.
- `utils/generatePitchDeckPPTX.ts` converts the flat form object into a PPTX with defensive checks.
- `utils/generateDeckJSON.ts` provides a deterministic, in-repo generator that produces deck JSON for demo flows (no LLM).
Next actions:
- (Optional) Add Zod schema validation for deck JSON and tighten types across viewer and PPTX generator.
- (Optional) Replace the deterministic generator with an LLM-backed path once you have API access.
Cut Line: If LLM fails, use deterministic templates + minor text transformations.

Phase 4 — Deck Viewer (UI)
Status: PARTIAL — `DeckViewer` exists and supports download.
What exists:
- `src/components/DeckViewer.tsx` renders deck JSON as 16:9 cards, computes image luminance for on-screen contrast, and supports PPTX download.
Next actions:
- Improve keyboard navigation and accessibility in the viewer.
- (Optional) Add a dedicated route `/deck/[id]` backed by a small server or client-side routing.
Cut Line: Static cards without animations.

Phase 5 — Export + Paywall
Status: PARTIAL
What exists:
- PPTX export (`pptxgenjs`) implemented in `utils/generatePitchDeckPPTX.ts`.
- No PDF/html2pdf export, and no Stripe wiring.
Next actions:
- Add `html2pdf.js` export button in the deck viewer. For watermark, overlay text or footer conditionally based on deck.isPaid.
- Add Stripe Checkout stub (client-only) that sets `deck.isPaid = true` in memory after redirect; for demo, you can mock success.
Cut Line: If Stripe is unavailable, show “Paywall soon” and keep watermark.

Phase 6 — Real Outbound + Tracking
Status: NOT IMPLEMENTED (Resend present in package.json but not wired)
What exists:
- `resend` dependency in `package.json` (server SDK present) but no `/api/send` or pixel endpoint.
Next actions:
- Implement `/api/send` serverless route (or local stub) which sends 3 seeded emails via Resend (or mocks) and includes an image pixel URL like `/api/pixel?sendId=...`.
- Implement `/api/pixel` that logs open events in-memory and returns a 1×1 GIF.
Cut Line: If outbound fails, fall back to a local mock that simulates send and uses toasts to show opens.

Phase 7 — Agentic Orchestration
Status: NOT IMPLEMENTED
Next actions:
- Add a minimal local event bus (tiny Pub/Sub in-memory) and emit deck.generated, outbound.ready, email.sent, email.opened.
- Show the event feed in a right sidebar component.
Cut Line: If Solace infra is not available, use the local event bus and pre-record logs.

Phase 8 — Prize Boosters
Status: NOT IMPLEMENTED
Next actions:
- Add coupon, revenue counter (in-memory), waitlist modal, and share buttons.
Cut Line: Optional.

Immediate priorities (recommended order)
1. Smoke test PPTX generation in browser end-to-end (open dev server, fill form, generate PPTX). Fix any remaining mapping bugs.
2. Commit background images and README/PHASES changes as separate commits (images first if you want to keep assets organized).
3. Tighten type validation (Zod) for deck JSON and add unit tests for generator and viewer.
4. Add `/api/send` and `/api/pixel` stubs for outbound demo if you want to demo Resend integration.

Files of interest (start here)
- `src/components/DeckFormModal.tsx` — intake form and submit wiring. (calls `generatePitchDeckPPTX` directly.)
- `utils/generatePitchDeckPPTX.ts` — browser PPTX generator.
- `lib/deckTemplates.ts` — slide templates and field keys.
- `src/App.tsx` — landing page and modal wiring.
- `src/components/ui/*` — Dialog, Toast, small pieces.
- `package.json` — dependencies (pptxgenjs present, resend & stripe included but not wired).

Next steps I can take now (pick one or more)
- A: Create and commit the two commits you asked for (images first, then code changes). I will stage files and run the commits. (Requires permission to run git commands.)
- B: Implement a quick deterministic `generateDeckJSON` and a minimal `/deck/[id]` viewer and wire them to the form so you can demo deck JSON + viewer without any LLM or outbound.
- C: Add minimal `/api/send` and `/api/pixel` stubs (mock Resend outbound + pixel tracking) so Phase 6 can be demoed locally.
- D: Prepare short usage & testing steps and commands you can run locally, plus recommended next PR/tasks for collaborators.

What I did in this pass
- Created `PHASES.md` at repo root with this mapping and recommendations.

What's next
- Tell me which of A/B/C/D you want me to do next. If A, confirm I should run git commands and whether to include all uncommitted changes in the second commit or only specific files. If B/C, I'll implement the minimal generator/viewer or API stubs and run quick smoke checks.

