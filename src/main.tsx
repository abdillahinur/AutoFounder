import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!);

async function boot() {
  const hash = window.location.hash || '';
  const match = hash.match(/deck=([a-f0-9\-]+)/i);
  if (match) {
    const id = match[1];
    try {
      const raw = sessionStorage.getItem(`deck:${id}`);
      if (raw) {
        const deck = JSON.parse(raw);
        const mod = await import('./components/DeckViewer');
        const DeckViewer = mod.default;
        root.render(
          <StrictMode>
            <DeckViewer deck={deck} />
          </StrictMode>
        );
        return;
      }
    } catch (e) {
      // fallthrough to default app mount
      console.warn('Could not load deck from sessionStorage', e);
    }
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();