import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { CustomDialogProvider } from '../context/CustomDialogContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <CustomDialogProvider>
              {children}
            </CustomDialogProvider>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
