import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from './SEO';
import BrandIcon from './BrandIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Page Not Found" 
        description="The page you are looking for does not exist." 
        noindex={true} 
      />
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <BrandIcon className="w-16 h-16 mb-8 text-slate-800" />
        <h1 className="text-8xl font-semibold text-slate-900 tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 tracking-tight">Page Not Found</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:-translate-y-1"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </>
  );
};

export default NotFound;
