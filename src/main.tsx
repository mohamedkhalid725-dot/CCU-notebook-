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

if (typeof document !== 'undefined') {
  // Keep native form controls reliably focusable inside the Android WebView.
  // Some parent touch/gesture handlers can otherwise steal the first touch,
  // making calculator inputs look editable but preventing the keyboard/focus.
  const focusFormControl = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !target.closest('#clinical-calculators')) return;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;

    target.style.pointerEvents = 'auto';
    target.focus({ preventScroll: true });
    if (target instanceof HTMLInputElement) {
      requestAnimationFrame(() => {
        try {
          target.setSelectionRange(0, target.value.length);
        } catch {
          // Selection is not supported for every input mode; focus is enough.
        }
      });
    }
  };

  document.addEventListener('pointerdown', focusFormControl, true);
  document.addEventListener('touchstart', focusFormControl, true);
  document.addEventListener('touchend', focusFormControl, true);

  // The specialty switcher is also a direct bed-board selector.
  // After changing All Systems / CCU / ICU, activate the Beds tab so the
  // selected specialty immediately shows its corresponding bed census.
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const specialtyButton = target?.closest('button');
    if (!specialtyButton) return;

    const label = specialtyButton.textContent?.replace(/\s+/g, ' ').trim();
    const isSpecialtyButton = label === 'All Systems' || label === 'CCU Cardiology' || label === 'ICU Critical Care';
    if (!isSpecialtyButton) return;

    window.setTimeout(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const bedsButton = buttons.find((button) => button.textContent?.replace(/\s+/g, ' ').trim() === 'Beds');
      bedsButton?.click();
    }, 0);
  }, false);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
