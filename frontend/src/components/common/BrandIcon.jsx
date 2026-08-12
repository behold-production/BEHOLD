import React from 'react';

/**
 * BrandIcon component for BEHOLD
 * Renders the iconic "B." with crisp White B and glowing Neon Blue Dot (#00E5FF).
 * 
 * Props:
 * - variant: 'icon' (badge only), 'full' (icon + BEHOLD text), 'textOnly' (BEHOLD. text)
 * - size: 'sm', 'md', 'lg', 'xl'
 * - darkBg: boolean (true for dark container background)
 * - className: additional wrapper classes
 */
export default function BrandIcon({
  variant = 'icon',
  size = 'md',
  darkBg = true,
  className = ''
}) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7 text-xs', text: 'text-lg' },
    md: { icon: 'w-9 h-9 text-sm', text: 'text-2xl' },
    lg: { icon: 'w-11 h-11 text-base', text: 'text-3xl' },
    xl: { icon: 'w-14 h-14 text-xl', text: 'text-4xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'icon') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl font-sans font-semibold select-none transition-all duration-300 ${currentSize.icon} ${
          darkBg
            ? 'bg-[#070b14] border border-slate-800/80 shadow-md shadow-black/40 text-white'
            : 'bg-slate-900 border border-slate-700 text-white shadow-sm'
        } ${className}`}
      >
        <span className="tracking-tighter flex items-baseline">
          <span className="text-white font-semibold leading-none drop-shadow-xs">B</span>
          <span className="inline-block rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] ml-[1px] w-[6px] h-[6px]" />
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 font-sans font-semibold select-none ${className}`}>
        {/* Emblem Icon */}
        <div
          className={`relative flex items-center justify-center shrink-0 rounded-xl font-sans font-semibold ${currentSize.icon} ${
            darkBg
              ? 'bg-[#070b14] border border-slate-800/80 shadow-md shadow-black/40 text-white'
              : 'bg-slate-900 border border-slate-700 text-white shadow-sm'
          }`}
        >
          <span className="tracking-tighter flex items-baseline">
            <span className="text-white font-semibold leading-none">B</span>
            <span className="inline-block rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] ml-[1px] w-[6px] h-[6px]" />
          </span>
        </div>

        {/* Wordmark */}
        <span className={`tracking-tight uppercase font-extrabold ${currentSize.text} ${darkBg ? 'text-white' : 'text-slate-900'}`}>
          BEHOLD<span className="text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] font-semibold">.</span>
        </span>
      </div>
    );
  }

  // textOnly
  return (
    <span className={`font-sans font-semibold tracking-tight uppercase ${currentSize.text} ${darkBg ? 'text-white' : 'text-slate-900'} ${className}`}>
      BEHOLD<span className="text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] font-semibold">.</span>
    </span>
  );
}
