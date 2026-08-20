'use client';

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { CustomDialogProvider } from '../context/CustomDialogContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ErrorBoundary>
          <CustomDialogProvider>
            {children}
          </CustomDialogProvider>
        </ErrorBoundary>
      </AuthProvider>
    </HelmetProvider>
  );
}
