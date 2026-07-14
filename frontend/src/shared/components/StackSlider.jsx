import React, { useState, useEffect, useRef } from 'react';

export default function StackSlider({
  items,
  renderItem,
  desktopClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  mobileContainerClassName = "relative w-full max-w-[400px] mx-auto h-[450px]",
  forceCarousel = false
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
    if (isAnimating.current) return;
    isAnimating.current = true;
    setAnimatingDir('left');
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
      setAnimatingDir(null);
      isAnimating.current = false;
    }, 400);
  };

  const handlePrev = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setAnimatingDir('right');
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
      setAnimatingDir(null);
      isAnimating.current = false;
    }, 400);
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

  if (!isMobile && !forceCarousel) {
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
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          let total = items.length;
          let rel = (index - currentIndex + total) % total;

          let zIndex = 0;
          let opacity = 0;
          let transform = '';

          if (rel === 0) {
            zIndex = 30;
            opacity = 1;
            transform = 'translate3d(-50%, -50%, 0) scale(1) rotate(0deg)';
          } else if (rel === 1) {
            zIndex = 20;
            opacity = 0.95;
            transform = 'translate3d(calc(-50% + 16px), -50%, -60px) scale(0.94) rotate(4deg)';
          } else if (rel === 2) {
            zIndex = 10;
            opacity = 0.85;
            transform = 'translate3d(calc(-50% - 16px), -50%, -120px) scale(0.88) rotate(-4deg)';
          } else {
            zIndex = 0;
            opacity = 0;
            transform = 'translate3d(-50%, calc(-50% + 30px), -180px) scale(0.8) rotate(0deg)';
          }

          let className = "absolute top-1/2 left-1/2 w-full bg-transparent overflow-visible";

          if (isCurrent) {
            if (animatingDir === 'left') {
              className += " fly-left";
            } else if (animatingDir === 'right') {
              className += " fly-in-left";
            }
          }

          return (
            <div
              key={index}
              className={className}
              style={{
                zIndex,
                transform: (isCurrent && animatingDir) ? undefined : transform,
                opacity: (isCurrent && animatingDir) ? undefined : opacity,
                pointerEvents: isCurrent ? 'auto' : 'none',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {renderItem ? renderItem(item, index) : item}
            </div>
          );
        })}
      </div>

      {/* Controls & Pagination */}
      <div className="flex items-center justify-between w-full max-w-[300px] mt-6 mb-2 gap-4 relative z-20">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer bg-white"
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
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-[#00E5FF] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
