# AutoFounder

AutoFounder is a browser-based web application that helps founders go from idea to investor inbox in 60 seconds. It generates AI-powered pitch decks and enables instant download as PowerPoint (.pptx) files—no backend required. All generation and export logic runs client-side for privacy and speed.

## Tech Stack

AutoFounder is built with a modern, production-ready stack:

- **React** & **TypeScript**: For building robust, type-safe user interfaces.
- **Vite**: Fast development server and build tool for React projects.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development.
- **pptxgenjs**: PowerPoint (.pptx) export of pitch decks, fully in-browser.
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

## Features

- **Browser-based pitch deck generator** (no backend, no data leaves your device)
- **Customizable slide templates** with JSON mapping for user input
- **Download as PowerPoint (.pptx)** with custom backgrounds
- **Modern, animated UI** with framer-motion
- **Optional: Export to PDF, Stripe unlock, and investor email features** (see legacy code)
- Built with **React**, **TypeScript**, **Vite**, and **TailwindCSS**

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

## How It Works

- User fills out a multi-step form (see `src/components/DeckFormModal.tsx`).
- Form data is mapped to a JSON slide template (`lib/deckTemplates.ts`).
- On submit, `utils/generatePitchDeckPPTX.ts` generates a PowerPoint deck in the browser using pptxgenjs, only rendering fields that exist in both the template and user input.
- The deck is downloaded instantly with custom backgrounds from `/public/images/`.
- No backend/API calls are made; all logic is client-side.

## Customizing Deck Templates & Backgrounds

- To add or edit slide templates, update `lib/deckTemplates.ts`.
- To change slide backgrounds, add images to `/public/images/` and update the paths in `utils/generatePitchDeckPPTX.ts`.

## Contributors

- Built by founders for founders at Hackathon 3.0
- (Add your names/usernames here)

## License

(Add your license here, e.g., MIT)
