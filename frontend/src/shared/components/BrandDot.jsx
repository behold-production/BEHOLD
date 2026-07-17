import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrollDot
 * Renders a clean, normal typographical period (.) in neon blue (#00F0FF) right next to the text.
 * Clicking it scrolls to `nextId` smoothly.
 */
export function ScrollDot({
  nextId = '',
  label = 'Scroll to next section ↓',
  size = 'md',
  inlineText = false,
  className = '',
  onClick = null
}) {
  const dotRef = useRef(null);

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
      ref={dotRef}
      onClick={handleClick}
      title={label}
      className={`text-[#00F0FF] font-black cursor-pointer inline transition-transform duration-200 hover:opacity-80 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] ${className}`}
    >
      .
    </span>
  );
}

/**
 * BrandDot — A simple, clean normal neon blue period (.) or flat circular accent
 */
export function BrandDot({ size = 'md', pulse = false, float = false, className = '' }) {
  return (
    <span
      className={`text-[#00F0FF] font-black inline drop-shadow-[0_0_6px_rgba(0,240,255,0.5)] ${className}`}
      aria-hidden="true"
    >
      .
    </span>
  );
}

/**
 * DotEyebrow — Section label with clean leading dot.
 */
export function DotEyebrow({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-[#00F0FF] inline-block shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
      <span className="text-sm font-bold tracking-widest uppercase text-[#00A8FF]">
        {children}
      </span>
    </div>
  );
}

/**
 * DotDivider — Clean horizontal divider line.
 */
export function DotDivider({ count = 5, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rounded-full inline-block"
          style={{
            width: i === Math.floor(count / 2) ? '6px' : '4px',
            height: i === Math.floor(count / 2) ? '6px' : '4px',
            background: i === Math.floor(count / 2) ? '#00F0FF' : '#00A8FF',
            boxShadow: i === Math.floor(count / 2) ? '0 0 6px rgba(0, 240, 255, 0.7)' : 'none',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * FloatingDots — Subtle decorative background dots.
 */
export function FloatingDots({ className = '' }) {
  return null; // Clean aesthetic without cluttering bubbles
}

/**
 * renderTitleWithFullstopDot
 * Wraps the last word of any section title with a normal period (.) right attached to the text.
 */
export function renderTitleWithFullstopDot(text = '', nextId = '', label = 'Scroll down ↓', size = 'md') {
  if (typeof text !== 'string' || !text) return null;
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return (
      <span className="inline">
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
      <span className="inline">
        <span>{lastWord}</span>
        <ScrollDot nextId={nextId} label={label} size={size} inlineText={true} />
      </span>
    </span>
  );
}

