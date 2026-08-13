import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './app/App.jsx'
import Providers from './app/Providers.jsx'


// Intercept localStorage.setItem to trigger custom event for same-tab updates
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments);
  const event = new CustomEvent('storage_update', { detail: { key, value } });
  window.dispatchEvent(event);
};

// Fallback spaNavigate stub before React is fully mounted
window.spaNavigate = function (path) {
  window.location.pathname = path;
};

// Suppress non-critical third-party analytics (e.g. Razorpay lumberjack / adblocker blocks) console errors
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason || '');
  if (
    reasonStr.includes('lumberjack.razorpay') ||
    reasonStr.includes('ERR_BLOCKED_BY_CLIENT') ||
    reasonStr.includes('otp-credentials')
  ) {
    event.preventDefault();
  }
});

// Initialize High-Performance Global Scroll Reveal System (Singleton & RAM-Optimized)
if (typeof window !== 'undefined') {
  let globalObserver = null;

  const getGlobalObserver = () => {
    if (!globalObserver) {
      globalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve immediately after revealing to release GPU/RAM memory!
            globalObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      });
    }
    return globalObserver;
  };

  const observeElements = () => {
    const obs = getGlobalObserver();
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed), .reveal-scale-in:not(.is-revealed), .reveal-slide-left:not(.is-revealed), .reveal-slide-right:not(.is-revealed)');
    elements.forEach(el => obs.observe(el));
  };

  let debounceTimer = null;
  const debouncedObserve = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(observeElements, 80);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
  } else {
    observeElements();
  }

  // Observe node additions cleanly without duplicate Observers
  const mutationObserver = new MutationObserver((mutations) => {
    const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      debouncedObserve();
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
