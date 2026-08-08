import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './app/App.jsx'
import Providers from './app/Providers.jsx'

// Register PWA service worker
// if ('serviceWorker' in navigator) {
// if (import.meta.env.DEV) {
// navigator.serviceWorker.getRegistrations().then((registrations) => {
// for (const registration of registrations) {
// registration.unregister();
// }
// });
// } else {
// // registerSW({ immediate: true });
// }
// }

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

// Initialize Global Scroll Reveal Intersection Observer for User Section
if (typeof window !== 'undefined') {
  const initScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale-in, .reveal-slide-left, .reveal-slide-right');
    elements.forEach(el => observer.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    setTimeout(initScrollReveal, 100);
  }

  // Observe DOM additions dynamically
  const mutationObserver = new MutationObserver(() => {
    setTimeout(initScrollReveal, 150);
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
