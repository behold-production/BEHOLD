import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CustomDialogProvider } from '../context/CustomDialogContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <CustomDialogProvider>
            {children}
          </CustomDialogProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
