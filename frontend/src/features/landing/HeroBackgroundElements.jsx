import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingSphere = ({ className, delay = 0, size = 100, color1 = '#00D1D1', color2 = '#0ea5e9' }) => (
  <motion.div
    className={`absolute pointer-events-none z-0 ${className}`}
    animate={{ 
      y: [0, -30, 0],
      x: [0, 10, 0]
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    style={{ width: size, height: size, willChange: "transform" }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
      <defs>
        <radialGradient id={`sphereGrad-${delay}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#sphereGrad-${delay})`} />
    </svg>
  </motion.div>
);

const FloatingRing = ({ className, delay = 0, size = 120, color1 = '#00D1D1' }) => (
  <motion.div
    className={`absolute pointer-events-none z-0 ${className}`}
    animate={{ 
      y: [0, 40, 0],
      rotate: [0, 360]
    }}
    transition={{ duration: 20 + delay, repeat: Infinity, ease: "linear" }}
    style={{ width: size, height: size, willChange: "transform" }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
      <defs>
        <linearGradient id={`ringGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} stopOpacity="1" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color1} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path d="M50 10a40 40 0 1 1 0 80 40 40 0 1 1 0-80zm0 20a20 20 0 1 0 0 40 20 20 0 1 0 0-40z" fill={`url(#ringGrad-${delay})`} />
    </svg>
  </motion.div>
);

const FloatingDiamond = ({ className, delay = 0, size = 90, color1 = '#0ea5e9' }) => (
  <motion.div
    className={`absolute pointer-events-none z-0 ${className}`}
    animate={{ 
      y: [0, -25, 0],
      rotate: [0, 180, 360]
    }}
    transition={{ duration: 18 + delay, repeat: Infinity, ease: "linear" }}
    style={{ width: size, height: size, willChange: "transform" }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-85">
      <defs>
        <linearGradient id={`diamondGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor={color1} />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <polygon points="50,5 95,50 50,95 5,50" fill={`url(#diamondGrad-${delay})`} rx="5" />
    </svg>
  </motion.div>
);

const FloatingPill = ({ className, delay = 0, size = 150, color1 = '#0ea5e9' }) => (
  <motion.div
    className={`absolute pointer-events-none z-0 ${className}`}
    animate={{ 
      y: [0, 30, 0],
      rotate: [-15, 15, -15]
    }}
    transition={{ duration: 12 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    style={{ width: size, height: size, willChange: "transform" }}
  >
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-80">
      <defs>
        <linearGradient id={`pillGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor={color1} />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect x="10" y="20" width="180" height="60" rx="30" fill={`url(#pillGrad-${delay})`} />
    </svg>
  </motion.div>
);

const PARTICLE_DATA = [...Array(12)].map((_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 105}%`, // use left coordinate variations
  duration: Math.random() * 4 + 6,
  delay: Math.random() * 3
}));

const DecorativeParticles = () => {

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {PARTICLE_DATA.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute w-2 h-2 bg-brand rounded-full"
          style={{
            top: p.top,
            left: p.left,
            willChange: "transform, opacity"
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function HeroBackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Small subtle particles rising */}
      <DecorativeParticles />
      
      {/* 3D Objects Scattered for depth - Removed CSS blurs and drop-shadows for 60fps performance */}
      <FloatingSphere className="top-[15%] left-[5%] lg:left-[10%] opacity-70" size={120} delay={0} color1="#00D1D1" color2="#0284c7" />
      <FloatingRing className="top-[60%] left-[-2%] lg:left-[8%] opacity-50" size={160} delay={1.5} color1="#0ea5e9" />
      
      <FloatingDiamond className="top-[20%] right-[5%] lg:right-[15%] opacity-60" size={100} delay={0.5} color1="#00D1D1" />
      <FloatingSphere className="top-[65%] right-[2%] lg:right-[12%] opacity-80" size={140} delay={2} color1="#0ea5e9" color2="#0369a1" />
      
      <FloatingPill className="top-[75%] left-[30%] lg:left-[40%] opacity-40" size={160} delay={1} color1="#00D1D1" />
    </div>
  );
}
