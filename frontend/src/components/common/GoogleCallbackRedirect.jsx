import React, { useEffect } from 'react';

const GoogleCallbackRedirect = () => {
  useEffect(() => {
    let baseUrl = import.meta.env.VITE_API_URL || '/api';
    if (baseUrl && !baseUrl.endsWith('/api') && baseUrl !== '/api') {
      baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
    }
    window.location.href = `${baseUrl}/google/callback${window.location.search}`;  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fbf9f5]">
      <div className="w-10 h-10 border-4 border-[#B85438] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#1c2826] font-medium">Completing Google Sign In...</p>
    </div>
  );
};

export default GoogleCallbackRedirect;
