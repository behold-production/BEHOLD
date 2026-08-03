import React, { useEffect } from 'react';

const GoogleCallbackRedirect = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${baseUrl}/google/callback${window.location.search}`;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050811]">
      <div className="w-10 h-10 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white font-medium">Completing Google Sign In...</p>
    </div>
  );
};

export default GoogleCallbackRedirect;
