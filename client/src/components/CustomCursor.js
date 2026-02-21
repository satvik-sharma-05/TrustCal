import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.body.style.cursor = 'none';
    }
    let trailBuffer = [];
    const maxTrail = 8;

    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      trailBuffer = [{ x: e.clientX, y: e.clientY }, ...trailBuffer].slice(0, maxTrail);
      setTrail([...trailBuffer]);
    };

    const handleOver = (e) => {
      const target = e.target?.closest?.('a, button, input, select, [role="button"]');
      setHover(!!target);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOver);

    return () => {
      if (!window.matchMedia('(pointer: coarse)').matches) {
        document.body.style.cursor = '';
      }
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOver);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div
      className="fixed z-[99999] pointer-events-none"
      style={{ left: 0, top: 0 }}
    >
      {trail.map((t, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400/60"
          style={{
            left: t.x,
            top: t.y,
            width: Math.max(3, 8 - i),
            height: Math.max(3, 8 - i),
            transform: 'translate(-50%, -50%)',
            opacity: 0.5 - i * 0.05,
            boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
          }}
        />
      ))}
      <div
        className="absolute rounded-full border-2 border-cyan-400 bg-cyan-400/10 transition-all duration-200"
        style={{
          left: pos.x,
          top: pos.y,
          width: hover ? 36 : 22,
          height: hover ? 36 : 22,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 24px rgba(6, 182, 212, 0.5), 0 0 48px rgba(139, 92, 246, 0.2)',
        }}
      />
      <div
        className="absolute rounded-full bg-cyan-400 transition-transform duration-150"
        style={{
          left: pos.x,
          top: pos.y,
          width: hover ? 6 : 4,
          height: hover ? 6 : 4,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 12px rgba(6, 182, 212, 0.8)',
        }}
      />
    </div>
  );
};

export default CustomCursor;
