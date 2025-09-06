# AutoFounder

AutoFounder is a web application that helps founders go from idea to investor inbox in 60 seconds. It generates AI-powered pitch decks and sends them to relevant investors instantly, streamlining the fundraising process for startups.

## Tech Stack

AutoFounder is built with a modern, production-ready stack:

- **React** & **TypeScript**: For building robust, type-safe user interfaces.
- **Vite**: Fast development server and build tool for React projects.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development.
- **Zod**: TypeScript-first schema validation for form and API data.
- **Stripe**: Payment processing for unlocking premium features.
- **Resend**: Transactional email delivery for investor outreach.
- **uuid**: For generating unique project and tracking IDs.
- **html2pdf.js**: Client-side PDF export of pitch decks.
- **pptxgenjs**: PowerPoint (.pptx) export of pitch decks.
- **clsx**: Utility for conditionally joining classNames.
- **framer-motion**: Animations and transitions for UI components.
- **lucide-react**: Icon library for modern React apps.

The app is designed for hackathon speed: local/in-memory storage, no external template bundles, and all templates are custom Tailwind layouts.

## Features

- **AI-generated pitch decks** with founder-friendly narratives
- **Curated investor database** for targeted outreach
- **Personalized intro emails** to investors
- **Real-time notifications** when your deck is viewed
- **Animated UI** with framer-motion
- **Export to PDF and PowerPoint** (with watermark for free users)
- **Stripe Checkout** for watermark-free exports
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

## Contributors

- Built by founders for founders at Hackathon 3.0
- (Add your names/usernames here)

## License

(Add your license here, e.g., MIT)
