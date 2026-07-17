import React, { useState } from 'react';

/**
 * ScrollDot (Interactive Navy Neon Blue Little Dot)
 * Renders the signature BEHOLD little dot (`.`) in navy neon blue.
 * When clicked, smoothly scrolls down to `nextId`.
 * Fits cleanly at baseline right after headings or text like a real period.
 */
export function ScrollDot({
  nextId = '',
  label = 'Scroll to next section ↓',
  size = 'md',
  inlineText = false,
  className = '',
  onClick = null
}) {
  const [hovered, setHovered] = useState(false);

  // Refined little dot sizes suitable for periods and small accents
  const sizes = {
    xs: 'w-1.5 h-1.5',    // 6px
    sm: 'w-2 h-2',        // 8px
    md: 'w-2.5 h-2.5',    // 10px — ideal period dot for logo/headings
    lg: 'w-3 h-3',        // 12px
    xl: 'w-3.5 h-3.5',    // 14px
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    if (nextId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (nextId) {
      const el = document.getElementById(nextId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <span
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        display: inlineText ? 'inline-block' : 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'baseline',
        position: 'relative',
        bottom: inlineText ? '0.05em' : '0px',
        marginLeft: inlineText ? '2px' : '0px',
        marginRight: inlineText ? '1px' : '0px',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.3)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`relative inline-block rounded-full shrink-0 ${sizes[size] || sizes.md} ${className}`}
    >
      {/* Navy Neon Blue Little Dot */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #00F0FF 0%, #00A8FF 55%, #0c1a36 100%)',
          boxShadow: hovered
            ? '0 0 12px rgba(0, 240, 255, 0.95), 0 0 3px #00F0FF, inset 1px 1px 1.5px rgba(255, 255, 255, 0.8)'
            : '0 0 6px rgba(0, 229, 255, 0.75), 0 0 1.5px #00F0FF, inset 1px 1px 1.5px rgba(255, 255, 255, 0.65)',
          transition: 'all 0.2s ease',
        }}
      />
      {/* Specular Highlight for crisp jewel finish */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '18%',
          left: '20%',
          width: '35%',
          height: '25%',
          background: 'rgba(255, 255, 255, 0.75)',
        }}
      />
      {/* Tooltip */}
      {hovered && label && (
        <span
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
          style={{ letterSpacing: '0.02em', animation: 'fadeInUp 0.15s ease-out' }}
        >
          {label}
          <span className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

/**
 * BrandDot — The signature navy neon blue dot from the BEHOLD. logo.
 * Used throughout the site as a visual motif.
 */
export function BrandDot({ size = 'md', pulse = false, float = false, className = '' }) {
  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-5 h-5',
  };
  const anim = float ? 'animate-dot-float' : pulse ? 'animate-pulse' : '';
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${sizes[size] || sizes.md} ${anim} ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 35%, #00F0FF 0%, #00A8FF 55%, #0c1a36 100%)',
        boxShadow: '0 0 6px rgba(0, 229, 255, 0.7), 0 0 1.5px #00F0FF',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * DotEyebrow — Section label with a leading navy neon blue dot.
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
 * DotDivider — A horizontal line of navy neon dots used to separate sections visually.
 */
export function DotDivider({ count = 5, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: i === Math.floor(count / 2) ? '8px' : '5px',
            height: i === Math.floor(count / 2) ? '8px' : '5px',
            background: i === Math.floor(count / 2)
              ? 'radial-gradient(circle at 35% 35%, #00F0FF 0%, #00A8FF 55%, #0c1a36 100%)'
              : 'rgba(0, 229, 255, 0.4)',
            boxShadow: i === Math.floor(count / 2) ? '0 0 6px rgba(0, 229, 255, 0.7)' : 'none',
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
    { size: 'w-2 h-2', top: '10%', left: '5%', delay: '0s', opacity: 0.25 },
    { size: 'w-1.5 h-1.5', top: '25%', right: '8%', delay: '0.8s', opacity: 0.3 },
    { size: 'w-2.5 h-2.5', top: '60%', left: '3%', delay: '1.5s', opacity: 0.2 },
    { size: 'w-1.5 h-1.5', top: '80%', right: '5%', delay: '0.4s', opacity: 0.25 },
    { size: 'w-2 h-2', top: '15%', right: '20%', delay: '1.2s', opacity: 0.2 },
    { size: 'w-1.5 h-1.5', top: '45%', left: '12%', delay: '2s', opacity: 0.3 },
    { size: 'w-2 h-2', top: '70%', right: '15%', delay: '0.6s', opacity: 0.25 },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full animate-dot-float ${dot.size}`}
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            opacity: dot.opacity,
            animationDelay: dot.delay,
            background: 'radial-gradient(circle at 35% 35%, #00F0FF 0%, #00A8FF 55%, #0c1a36 100%)',
            boxShadow: '0 0 5px rgba(0, 229, 255, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

/**
 * renderTitleWithFullstopDot
 * Wraps the last word of any section title with a ScrollDot period (.)
 * so that the dot never wraps onto its own line and sits exactly at baseline.
 */
export function renderTitleWithFullstopDot(text = '', nextId = '', label = 'Scroll down ↓', size = 'md') {
  if (typeof text !== 'string' || !text) return null;
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return (
      <span className="whitespace-nowrap inline-flex items-baseline">
        <span>{text}</span>
        <ScrollDot nextId={nextId} label={label} size={size} inlineText={true} />
      </span>
    );
  }
  const lastWord = words.pop();
  const firstPart = words.join(' ');
  return (
    <span className="inline">
      <span>{firstPart} </span>
      <span className="whitespace-nowrap inline-flex items-baseline">
        <span>{lastWord}</span>
        <ScrollDot nextId={nextId} label={label} size={size} inlineText={true} />
      </span>
    </span>
  );
}

