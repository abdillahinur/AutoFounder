# AutoFounder

AutoFounder is a browser-based web application that helps founders go from idea to investor inbox in 60 seconds. It generates AI-powered pitch decks and enables instant download as PowerPoint (.pptx) files—no backend required. All generation and export logic runs client-side for privacy and speed.

## 🚀 Live Demo

Visit [AutoFounder](https://autofounder.com) to create your pitch deck in 60 seconds.

## ✨ Key Features

- **⚡ 60-Second Pitch Deck Creation** - From idea to investor-ready deck
- **🤖 AI-Powered Content Enhancement** - Gemini AI improves your pitch content
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

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

 - **💾 Instant PowerPoint Export** - Download as .pptx file immediately (client-side)
 - **🎯 Custom Templates** - Multiple deck themes and backgrounds
 - **🧩 Deterministic Deck JSON** - A local, deterministic `generateDeckJSON` helper (no LLM) produces the deck JSON used by the viewer and PPTX generator for fast demos.

## Quick demo (no backend)

- Open the site locally with `npm run dev`.
- Click "Generate Your Deck" to open the multi-step form.
- Submit the form — the app creates a deterministic deck JSON, stores it in `sessionStorage` as `deck:<id>`, and opens a new tab at `/#deck=<id>` which mounts the in-browser `DeckViewer`.

This demo flow requires no server and is designed for fast handoffs at a hackathon.

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
