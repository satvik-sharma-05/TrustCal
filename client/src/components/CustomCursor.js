import React, { useState, useEffect, useRef } from 'react';

// Luminous multi-colored trail inspired by glowing light stream (purple → pink → green → aqua → indigo)
const TRAIL_COLORS = [
  'rgba(236, 72, 153, 0.9)',   // pink/fuchsia
  'rgba(139, 92, 246, 0.85)',  // purple
  'rgba(16, 185, 129, 0.8)',   // emerald
  'rgba(34, 211, 238, 0.85)',  // aqua/cyan
  'rgba(99, 102, 241, 0.8)',   // indigo
  'rgba(6, 182, 212, 0.75)',   // cyan
];

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const trailRef = useRef([]);
  const [trail, setTrail] = useState([]);
  const [hover, setHover] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    document.body.style.cursor = 'none';

    const maxTrail = 24;
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      trailRef.current = [
        { x: e.clientX, y: e.clientY, t: Date.now() },
        ...trailRef.current.slice(0, maxTrail - 1),
      ];
    };

    const animate = () => {
      setTrail([...trailRef.current]);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    const handleOver = (e) => {
      const target = e.target?.closest?.('a, button, input, select, [role="button"]');
      setHover(!!target);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOver);

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOver);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="fixed z-[99999] pointer-events-none" style={{ left: 0, top: 0 }}>
      {/* Luminous multi-colored trail - glowing ribbon effect */}
      {trail.map((t, i) => {
        const colorIdx = Math.floor((i / trail.length) * TRAIL_COLORS.length) % TRAIL_COLORS.length;
        const color = TRAIL_COLORS[colorIdx];
        const size = 14 - i * 0.45;
        const opacity = 0.95 - (i / trail.length) * 0.85;
        return (
          <div
            key={`${t.x}-${t.y}-${i}`}
            className="absolute rounded-full"
            style={{
              left: t.x,
              top: t.y,
              width: Math.max(4, size),
              height: Math.max(4, size),
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              boxShadow: `0 0 ${12 + i}px ${4 + i}px ${color}`,
              opacity,
            }}
          />
        );
      })}
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full border-2 transition-all duration-200"
        style={{
          left: pos.x,
          top: pos.y,
          width: hover ? 40 : 26,
          height: hover ? 40 : 26,
          transform: 'translate(-50%, -50%)',
          borderColor: 'rgba(236, 72, 153, 0.6)',
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(6, 182, 212, 0.2)',
        }}
      />
      {/* Inner bright core */}
      <div
        className="absolute rounded-full transition-all duration-150"
        style={{
          left: pos.x,
          top: pos.y,
          width: hover ? 8 : 6,
          height: hover ? 8 : 6,
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.9), 0 0 40px rgba(139, 92, 246, 0.6)',
        }}
      />
    </div>
  );
};

export default CustomCursor;
