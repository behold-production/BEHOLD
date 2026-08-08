import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { CustomDialogProvider } from '../context/CustomDialogContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <CustomDialogProvider>
              {children}
            </CustomDialogProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
