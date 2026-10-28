import React from 'react';

/**
 * BrandIcon component for BEHOLD
 * Renders the iconic "B." with crisp White B and glowing Neon Blue Dot (#B85438).
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
        className={`relative flex items-center justify-center shrink-0 rounded-full font-serif font-bold select-none transition-all duration-300 ${currentSize.icon} ${
          darkBg
            ? 'bg-[#1c2826] border border-[#ede7de]/20 text-white'
            : 'bg-[#1c2826] text-white shadow-sm'
        } ${className}`}
      >
        <span className="tracking-tighter flex items-baseline">
          <span className="text-white font-serif font-bold leading-none">B</span>
          <span className="inline-block rounded-full bg-[#b85438] ml-[1px] w-[5px] h-[5px]" />
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 font-serif font-bold select-none ${className}`}>
        {/* Emblem Icon */}
        <div
          className={`relative flex items-center justify-center shrink-0 rounded-full font-serif font-bold ${currentSize.icon} ${
            darkBg
              ? 'bg-[#1c2826] border border-[#ede7de]/20 text-white'
              : 'bg-[#1c2826] text-white shadow-sm'
          }`}
        >
          <span className="tracking-tighter flex items-baseline">
            <span className="text-white font-serif font-bold leading-none">B</span>
            <span className="inline-block rounded-full bg-[#b85438] ml-[1px] w-[5px] h-[5px]" />
          </span>
        </div>

        {/* Wordmark */}
        <span className={`tracking-tight uppercase font-serif font-bold ${currentSize.text} ${darkBg ? 'text-white' : 'text-[#1c2826]'}`}>
          BEHOLD<span className="text-[#b85438] font-serif font-bold">.</span>
        </span>
      </div>
    );
  }

  // textOnly
  return (
    <span className={`font-serif font-bold tracking-tight uppercase ${currentSize.text} ${darkBg ? 'text-white' : 'text-[#1c2826]'} ${className}`}>
      BEHOLD<span className="text-[#b85438] font-serif font-bold">.</span>
    </span>
  );
}
