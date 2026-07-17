import React from 'react';

/**
 * BrandDot — The signature blue dot from the BEHOLD. logo.
 * Used throughout the site as a visual motif.
 *
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} pulse   - animate with a pulsing glow
 * @param {boolean} float   - animate with a floating up-down motion
 * @param {string}  className
 */
export function BrandDot({ size = 'md', pulse = false, float = false, className = '' }) {
  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2.5 h-2.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10',
  };
  const anim = float ? 'animate-dot-float' : pulse ? 'animate-dot-pulse' : '';
  return (
    <span
      className={`inline-block rounded-full bg-blue-500 shrink-0 ${sizes[size] || sizes.md} ${anim} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * DotEyebrow — Section label with a leading brand dot.
 * e.g. ● OUR SERVICES
 */
export function DotEyebrow({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <BrandDot size="xs" pulse />
      <span className="text-sm font-bold tracking-widest uppercase text-blue-600">
        {children}
      </span>
    </div>
  );
}

/**
 * DotDivider — A horizontal line of dots used to separate sections visually.
 */
export function DotDivider({ count = 5, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rounded-full bg-blue-200"
          style={{
            width: i === Math.floor(count / 2) ? '10px' : '6px',
            height: i === Math.floor(count / 2) ? '10px' : '6px',
            opacity: i === Math.floor(count / 2) ? 1 : 0.5,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * FloatingDots — Decorative scattered dots for section backgrounds.
 */
export function FloatingDots({ className = '' }) {
  const dots = [
    { size: 'w-3 h-3', top: '10%', left: '5%', delay: '0s', opacity: 0.15 },
    { size: 'w-2 h-2', top: '25%', right: '8%', delay: '0.8s', opacity: 0.2 },
    { size: 'w-5 h-5', top: '60%', left: '3%', delay: '1.5s', opacity: 0.1 },
    { size: 'w-2 h-2', top: '80%', right: '5%', delay: '0.4s', opacity: 0.2 },
    { size: 'w-4 h-4', top: '15%', right: '20%', delay: '1.2s', opacity: 0.12 },
    { size: 'w-2 h-2', top: '45%', left: '12%', delay: '2s', opacity: 0.18 },
    { size: 'w-3 h-3', top: '70%', right: '15%', delay: '0.6s', opacity: 0.15 },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-blue-500 animate-dot-float ${dot.size}`}
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            opacity: dot.opacity,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
