import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrollDotNav
 * A 3D sphere (matching the BEHOLD. logo dot) that rolls down
 * a vertical track as the user scrolls. Section markers appear
 * on the track wherever a page section begins.
 */

const SECTIONS = [
  { id: 'home',          label: 'Home' },
  { id: 'about',         label: 'About' },
  { id: 'services',      label: 'Services' },
  { id: 'why-choose-us', label: 'Why Us' },
  { id: 'process',       label: 'Process' },
  { id: 'reviews',       label: 'Reviews' },
  { id: 'faqs',          label: 'FAQs' },
  { id: 'contact',       label: 'Contact' },
  { id: 'inquiry',       label: 'Inquiry' },
];

const TRACK_H   = 260; // total track height px
const DOT_SIZE  = 18;  // sphere diameter px
const HALF      = DOT_SIZE / 2;

export default function ScrollDotNav() {
  const [progress,  setProgress]  = useState(0);       // 0–1 scroll ratio
  const [markers,   setMarkers]   = useState([]);      // 0–1 positions of sections
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered,   setHovered]   = useState(null);
  const rafRef = useRef(null);

  /* ── Scroll progress ── */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Section markers + active section ── */
  useEffect(() => {
    const docH = document.documentElement.scrollHeight;
    const existing = SECTIONS.filter(s => document.getElementById(s.id));

    const pts = existing.map(s => {
      const el = document.getElementById(s.id);
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { id: s.id, label: s.label, ratio: top / docH };
    });
    setMarkers(pts);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = pts.findIndex(p => p.id === entry.target.id);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    existing.forEach(s => observer.observe(document.getElementById(s.id)));
    return () => observer.disconnect();
  }, []);

  const dotTop = progress * (TRACK_H - DOT_SIZE); // slide Y within track

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
        /* ── 3-D sphere ── */
        .sdnav-sphere {
          position: absolute;
          width: ${DOT_SIZE}px;
          height: ${DOT_SIZE}px;
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          /* Sphere shading: highlight top-left, deep core, shadow bottom-right */
          background: radial-gradient(
            circle at 38% 32%,
            #93c5fd 0%,
            #3b82f6 42%,
            #1d4ed8 72%,
            #1e3a8a 100%
          );
          box-shadow:
            /* depth shadow */
            4px 6px 14px rgba(29, 78, 216, 0.55),
            /* ambient glow */
            0 0 0 2px rgba(59, 130, 246, 0.18),
            /* inset dark shadow */
            inset 3px 4px 6px rgba(0, 0, 0, 0.22),
            /* inset light reflection */
            inset -1px -1px 4px rgba(255, 255, 255, 0.12);
          transition: top 0.1s ease-out;
          cursor: pointer;
        }
        /* Specular highlight overlay */
        .sdnav-sphere::before {
          content: '';
          position: absolute;
          top: 18%;
          left: 20%;
          width: 32%;
          height: 22%;
          background: rgba(255, 255, 255, 0.55);
          border-radius: 50%;
          filter: blur(1.5px);
          pointer-events: none;
        }
        /* Pulse ring */
        .sdnav-sphere::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid rgba(59, 130, 246, 0.3);
          animation: sdnav-ring 2.4s ease-in-out infinite;
        }
        @keyframes sdnav-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0.15; transform: scale(1.45); }
        }

        /* ── Track markers ── */
        .sdnav-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #cbd5e1;
          transition: background 0.3s, transform 0.3s;
          cursor: pointer;
        }
        .sdnav-marker.active {
          background: #3b82f6;
          transform: translateX(-50%) scale(1.4);
          box-shadow: 0 0 6px rgba(59,130,246,0.5);
        }
        .sdnav-marker:hover {
          background: #93c5fd;
          transform: translateX(-50%) scale(1.3);
        }

        /* ── Tooltip ── */
        .sdnav-tip {
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(6px);
          background: rgba(15,23,42,0.88);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          padding: 3px 8px;
          border-radius: 5px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.18s, transform 0.18s;
        }
        .sdnav-marker:hover .sdnav-tip,
        .sdnav-sphere:hover + .sdnav-sphere-tip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>

      {/* Container */}
      <div
        aria-label="Scroll progress"
        style={{
          position: 'fixed',
          right: '22px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          width: '20px',
          height: `${TRACK_H}px`,
          pointerEvents: 'none',
        }}
      >
        {/* ── Track: unfilled (full height, gray) ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 0,
          bottom: 0,
          width: '1.5px',
          background: '#e2e8f0',
          borderRadius: '99px',
        }} />

        {/* ── Track: filled above dot (blue) ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 0,
          height: `${dotTop + HALF}px`,
          width: '1.5px',
          background: 'linear-gradient(to bottom, #93c5fd, #3b82f6)',
          borderRadius: '99px',
          transition: 'height 0.1s ease-out',
        }} />

        {/* ── Section markers on the track ── */}
        {markers.map((m, i) => {
          const markerTop = m.ratio * TRACK_H - 2.5; // center 5px dot
          return (
            <div
              key={m.id}
              className={`sdnav-marker ${i === activeIdx ? 'active' : ''}`}
              style={{ top: `${markerTop}px`, pointerEvents: 'auto' }}
              onClick={() => scrollTo(m.id)}
              title={m.label}
            >
              <span className="sdnav-tip">{m.label}</span>
            </div>
          );
        })}

        {/* ── 3D Sphere dot ── */}
        <div
          className="sdnav-sphere"
          style={{ top: `${dotTop}px`, pointerEvents: 'auto' }}
          title="Scroll position"
        />
      </div>
    </>
  );
}
