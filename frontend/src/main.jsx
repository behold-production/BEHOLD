import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

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
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
