import React, { useState, useEffect, useRef } from 'react';

export default function StackSlider({ 
  items, 
  renderItem, 
  desktopClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  mobileContainerClassName = "relative w-full overflow-hidden"
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchMoveX = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchMoveX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    touchMoveX.current = e.touches[0].clientX;
    const diff = touchMoveX.current - touchStartX.current;
    
    // Boundary resistance
    if (currentIndex === 0 && diff > 0) {
      setTranslateX(diff * 0.3);
    } else if (currentIndex === items.length - 1 && diff < 0) {
      setTranslateX(diff * 0.3);
    } else {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    const diff = touchMoveX.current - touchStartX.current;
    setTranslateX(0);

    if (diff < -60) {
      handleNext();
    } else if (diff > 60) {
      handlePrev();
    }
  };

  if (!items || items.length === 0) return null;

  if (!isMobile) {
    return (
      <div className={desktopClassName}>
        {items.map((item, index) => renderItem ? renderItem(item, index) : item)}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className={`${mobileContainerClassName} overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
            width: `${items.length * 100}%`
          }}
        >
          {items.map((item, index) => (
            <div 
              key={index} 
              className="w-full shrink-0 px-4 py-6"
              style={{ width: `${100 / items.length}%` }}
            >
              {renderItem ? renderItem(item, index) : item}
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Pagination Dots */}
      <div className="flex items-center justify-between w-full max-w-[280px] mt-4 mb-4 gap-4 relative z-20">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-[#00E5FF] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={currentIndex >= items.length - 1}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
