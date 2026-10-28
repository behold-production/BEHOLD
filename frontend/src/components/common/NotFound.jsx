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
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-6 text-center">
        <BrandIcon className="w-16 h-16 mb-8 text-[#1c2826]" />
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#b85438] mb-4">Error 404</span>
        <h1 className="font-serif-hero text-7xl sm:text-8xl font-normal text-[#1c2826] tracking-tight mb-4">Page Not Found</h1>
        <p className="text-sm text-[#5c6b66] mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#1c2826] hover:bg-[#b85438] text-white font-semibold py-3 px-8 rounded-md transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </>
  );
};

export default NotFound;
