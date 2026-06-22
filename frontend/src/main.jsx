import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './shared/context/AuthContext'
import { CustomDialogProvider } from './shared/context/CustomDialogContext'
import ErrorBoundary from './shared/components/ErrorBoundary'

// Register PWA service worker
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <CustomDialogProvider>
            <App />
          </CustomDialogProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
