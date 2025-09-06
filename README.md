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

- **React** & **TypeScript**: For building robust, type-safe user interfaces.
- **Vite**: Fast development server and build tool for React projects.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development.
- **pptxgenjs**: PowerPoint (.pptx) export of pitch decks, fully in-browser.
- **@google/generative-ai**: Gemini AI integration for content enhancement.
- **pixabay-api**: Smart image search and integration for relevant visuals.
- **framer-motion**: Animations and transitions for UI components.
- **lucide-react**: Icon library for modern React apps.
- **clsx**: Utility for conditionally joining classNames.
- **uuid**: For generating unique project and tracking IDs.

### (Legacy/Optional)
- **Zod**: TypeScript-first schema validation for form and API data.
- **Stripe**: Payment processing for unlocking premium features.
- **Resend**: Transactional email delivery for investor outreach.
- **html2pdf.js**: Client-side PDF export of pitch decks.

The app is designed for hackathon speed: local/in-memory storage, no backend, and all templates are custom Tailwind layouts. All images for slide backgrounds are stored in `/public/images/` and can be easily swapped for different deck themes.

## 🎯 Form Fields

The multi-step form collects essential startup information:

### Required Fields
- **Startup Name** - What's your startup called?
- **One-Line Pitch** - Describe your startup in one sentence
- **Problem** - What problem are you solving?
- **Solution** - How do you solve it?
- **Target Customer** - Who is this for?
- **Traction** - Any traction yet? (metrics or n/a)
- **Funding Ask** - What are you raising & what for?

### Optional Fields
- **Business Model** - How will you make money?
- **Market Size** - What's the market size?
- **Competition** - Who are competitors & what's your edge?
- **Team** - Who's on your team?
- **Roadmap** - What's your vision or next milestones?
- **Contact** - How can investors reach you?

## 🖼️ Smart Image Integration

AutoFounder intelligently adds relevant images to your pitch deck slides using the Pixabay API:

- **AI-Generated Search Queries**: Gemini AI creates smart search terms based on your startup content
- **Relevance Filtering**: Only adds images that actually fit the slide topic and content
- **Automatic Layout**: Images are positioned on the right side, with text automatically adjusting width
- **Fallback Graceful**: If no relevant images are found, slides work perfectly without them
- **High Quality**: Images are sourced from Pixabay's business category with minimum 800px width

### Image Categories by Slide Type:
- **Problem**: Business challenges, pain points, customer frustrations
- **Solution**: Innovation, technology, problem-solving
- **Market**: Analysis charts, market research, trends
- **Business Model**: Strategy, revenue, business planning
- **Traction**: Growth charts, success metrics, achievements
- **Team**: Professional meetings, collaboration, startup teams
- **Ask**: Investment, funding, handshakes, business deals

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Pixabay API Key](https://pixabay.com/api/docs/) (free, 5,000 requests/month)

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd AutoFounder
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Environment Setup

1. Copy the environment template:
   ```sh
   cp env.example .env
   ```

2. Add your API keys to `.env`:
   ```env
   # Gemini AI API Key (for content enhancement)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Pixabay API Key (for relevant images)
   VITE_PIXABAY_API_KEY=your_pixabay_api_key_here
   ```

### Running the App

To start the development server:
```sh
npm run dev
# or
yarn dev
```
The app will be available at [http://localhost:5173](http://localhost:5173) by default.

To build for production:
```sh
npm run build
# or
yarn build
```

To preview the production build:
```sh
npm run preview
# or
yarn preview
```

### Linting

To run ESLint:
```sh
npm run lint
# or
yarn lint
```

## 🔄 How It Works
 - Client-first demo flow: the intake modal delegates deck creation to a client hook (`src/hooks/useGenerateDeck.ts`). That hook opens a placeholder window synchronously, optionally enhances the form payload with Gemini (if available), builds a deterministic deck JSON, persists it to localStorage (or encodes it in the URL when storage is blocked), broadcasts it to other tabs, and navigates the placeholder to the viewer.

 - Viewer entry points supported:
    - `/#deck=<id>` — viewer reads `localStorage.getItem('deck:<id>')` and falls back to listening on `BroadcastChannel('deck:<id>')` for ~1200ms if the deck isn't in storage yet.
    - `/#deckdata=<base64>` — inline, URL-safe base64 encoded deck JSON (used when localStorage writes are blocked).

 - `src/components/DeckViewer.tsx` renders the deck on-screen (cover, slides, optional images, bullets) and provides a Download button that dynamically imports `pptxgenjs` and creates a `.pptx` in-browser. The exporter prefers readable black/white text (no semi-opaque overlay boxes) so exported slides remain editable.

 - `utils/generateDeckJSON.ts` contains a deterministic deck generator used for fast demos (no LLM required). Gemini enhancement is optional and lazily loaded.

### Quick demo (no backend)

1. Start the dev server:

```sh
npm run dev
# or
yarn dev
```

2. Click "Generate Your Deck" to open the multi-step form (`src/components/DeckFormModal.tsx`).

3. Submit the form — the modal opens a small placeholder window synchronously and calls `useGenerateDeck` which:
    - optionally enhances text with Gemini (lazy imported),
    - builds a deterministic deck JSON,
    - tries to persist it to `localStorage` under `deck:<id>` (falls back to encoding it into the URL),
    - broadcasts the deck on `BroadcastChannel('deck:<id>')` and navigates the placeholder to `/#deck=<id>` or `/#deckdata=<base64>`.

4. `src/main.tsx` reads the hash on load, reads the deck from `localStorage` or `#deckdata`, and mounts `<DeckViewer deck={deck} />` if present; otherwise the regular app mounts.

This flow requires no server and is designed for fast demos and hackathon pitching.

## 🎨 UI/UX Features

- **Linear/Notion Aesthetic** - Clean, modern design with Inter font and blue accent color
- **Smooth Animations** - Framer Motion transitions between steps and modals
- **Responsive Design** - Optimized for desktop and mobile devices
- **Accessibility** - Proper labels, focus management, and keyboard navigation

## Customizing Deck Templates & Backgrounds

- To add or edit slide templates, update `lib/deckTemplates.ts`.
4. **🎨 Template Mapping** - Form data is mapped to JSON slide templates (`lib/deckTemplates.ts`). A deterministic `utils/generateDeckJSON.ts` is available for fast demo generation without LLMs.
5. **⚡ Instant Generation** - `utils/generatePitchDeckPPTX.ts` creates a PowerPoint deck in-browser using `pptxgenjs`. The PPTX exporter chooses a high-contrast text color (black or white) per-slide to maximize legibility; the exporter intentionally does not add semi-opaque text boxes.
6. **📁 Demo Wiring** - The app persists generated deck JSON to `sessionStorage` and mounts a `DeckViewer` when the URL hash contains `#deck=<id>` (see `src/main.tsx`).

### Troubleshooting

- Vite import error: if you see "Failed to resolve import './utils/generateDeckJSON' from 'src/App.tsx'", ensure the file exists at `utils/generateDeckJSON.ts` (project root `utils`) and that `src/App.tsx` imports it relatively as `../utils/generateDeckJSON` (that path is used in this repo).
- If PPTX text looks low-contrast, the exporter falls back to black/white. For image backgrounds, cross-origin images may prevent automatic sampling — explicit metadata `coverTextColor` / `contentTextColor` are used as a fallback.

**Phase 1: Intake Form** ✅ **COMPLETE**
- Multi-step form with validation
 ## 🚀 Development Status (short)

 - Multi-step intake form: Complete (`src/components/DeckFormModal.tsx`).
 - Deterministic deck JSON generator: Implemented (`utils/generateDeckJSON.ts`) for demo workflows (no LLM required).
 - Deck viewer component: Present (`src/components/DeckViewer.tsx`) — renders slide cards in the browser. Small wiring remains to persist and route generated decks for a hash-based viewer demo.
 - PPTX export: Implemented (`utils/generatePitchDeckPPTX.ts`) and improved — exported text uses black or white chosen for max contrast; semi-opaque text boxes were intentionally removed so slides remain visually clean.
 - Outbound email / Resend, PDF export, Stripe paywall, event pipeline: Not implemented (stubs/deps may be present in package.json).
 - Deck viewer component: Present (`src/components/DeckViewer.tsx`) — renders slide cards in the browser and supports download.
 - Deterministic deck JSON generator: Implemented (`utils/generateDeckJSON.ts`) and wired to the demo flow (App -> sessionStorage -> `/#deck=<id>` -> `DeckViewer`).
 - PPTX export: Implemented (`utils/generatePitchDeckPPTX.ts`) and improved — exported text uses black or white chosen for max contrast; semi-opaque text boxes were intentionally removed so slides remain visually clean.
 - Outbound email / Resend, PDF export, Stripe paywall, event pipeline: Not implemented (stubs/deps may be present in package.json).

 See `PHASES.md` for a more detailed phase-by-phase breakdown and next steps.
- Enhanced deck templates
- Multiple theme options
- Advanced customization features

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built by founders for founders
- Inspired by the need for rapid pitch deck creation
- Special thanks to the open-source community for the amazing tools and libraries
