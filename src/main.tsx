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
  // Native form controls must receive the initial touch directly in Android
  // WebView. Do this at capture phase so parent gesture/scroll handlers cannot
  // steal the touch before the input/select gets focus.
  const focusFormControl = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;

    target.style.pointerEvents = 'auto';
    target.focus({ preventScroll: true });
    if (target instanceof HTMLInputElement) {
      requestAnimationFrame(() => {
        try {
          target.setSelectionRange(0, target.value.length);
        } catch {
          // Some input modes do not expose text selection.
        }
      });
    }
  };

  document.addEventListener('pointerdown', focusFormControl, true);
  document.addEventListener('touchstart', focusFormControl, true);

  // Android WebView can keep the DOM input focused while the native soft
  // keyboard remains hidden. Notify the native activity whenever a text input
  // actually receives focus so it can explicitly request the IME.
  const requestNativeKeyboard = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if ((target as HTMLInputElement).readOnly || (target as HTMLInputElement).disabled) return;

    const bridge = (window as Window & { AndroidKeyboard?: { showKeyboard?: () => void } }).AndroidKeyboard;
    bridge?.showKeyboard?.();
  };

  document.addEventListener('focusin', requestNativeKeyboard, true);

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
