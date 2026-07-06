import React, { useState, useEffect, useRef } from 'react';

export default function StackSlider({ 
  items, 
  renderItem, 
  desktopClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  mobileContainerClassName = "relative w-full max-w-[400px] mx-auto h-[450px]"
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingDir, setAnimatingDir] = useState(null);
  const touchStartX = useRef(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (isAnimating.current || currentIndex >= items.length - 1) return;
    isAnimating.current = true;
    setAnimatingDir('left');
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingDir(null);
      isAnimating.current = false;
    }, 450);
  };

  const handlePrev = () => {
    if (isAnimating.current || currentIndex <= 0) return;
    setCurrentIndex(prev => prev - 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
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
    <div className="flex flex-col items-center">
      <div 
        className={mobileContainerClassName}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const offset = index - currentIndex;

          if (isPast) return null;

          const zIndex = items.length - index;
          const scale = 1 - (offset * 0.05);
          const translateY = offset * 20;
          const opacity = offset > 2 ? 0 : (1 - offset * 0.2);

          let className = "absolute top-1/2 left-1/2 w-full transition-all duration-500 ease-out bg-transparent overflow-visible";
          
          if (isCurrent && animatingDir === 'left') {
            className += " fly-left";
          }

          return (
            <div 
              key={index}
              className={className}
              style={{
                zIndex,
                transform: (isCurrent && animatingDir) ? undefined : `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
                opacity: (isCurrent && animatingDir) ? undefined : opacity,
                pointerEvents: isCurrent ? 'auto' : 'none'
              }}
            >
              {renderItem ? renderItem(item, index) : item}
            </div>
          );
        })}
      </div>

      {/* Controls & Pagination */}
      <div className="flex items-center justify-between w-full max-w-[300px] mt-4 mb-4 gap-4 relative z-20">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0 || isAnimating.current}
          className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-all cursor-pointer bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isAnimating.current) setCurrentIndex(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-[#0ea5e9] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={currentIndex >= items.length - 1 || isAnimating.current}
          className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-all cursor-pointer bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
