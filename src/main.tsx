import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAppTheme, applyThemeToDom } from './services/storage.ts';
import { getLanguage, applyLanguageToDom } from './services/i18n.ts';

// Apply saved theme and language immediately to eliminate initial flicker
applyThemeToDom(getAppTheme());
applyLanguageToDom(getLanguage());

// Setup system theme media query listener
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getAppTheme() === 'system') {
      applyThemeToDom('system');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

