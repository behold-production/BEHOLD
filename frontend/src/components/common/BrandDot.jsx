import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrollDot
 * Renders a clean, normal typographical period (.) in classic terracotta (#B85438) right next to the text.
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
      className={`text-[#b85438] font-bold cursor-pointer inline transition-transform duration-200 hover:scale-125 ${className}`}
    >
      .
    </span>
  );
}

/**
 * BrandDot — A simple, clean normal terracotta period (.) or flat circular accent
 */
export function BrandDot({ size = 'md', pulse = false, float = false, className = '' }) {
  return (
    <span
      className={`text-[#b85438] font-bold inline ${className}`}
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
      <span className="w-2 h-2 rounded-full bg-[#b85438] inline-block" />
      <span className="text-sm font-semibold tracking-widest uppercase text-[#a0462e]">
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
            background: i === Math.floor(count / 2) ? '#b85438' : '#cbbfa8',
            boxShadow: 'none',
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

