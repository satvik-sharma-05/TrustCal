import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const ChartWithExplanation = ({ title, explanation, children, className = '' }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    if (showInfo && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        left: Math.min(rect.right - 128, window.innerWidth - 280),
      });
    }
  }, [showInfo]);

  const toggleInfo = () => setShowInfo((v) => !v);

  const tooltipEl = showInfo ? (
    <div
      className="fixed z-[9999] w-64 p-3 rounded-xl text-xs text-slate-300 animate-fade-in"
      style={{
        top: pos.top,
        left: Math.max(16, pos.left),
        background: 'rgba(26, 21, 37, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {explanation}
    </div>
  ) : null;

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <button
          ref={btnRef}
          type="button"
          onClick={toggleInfo}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      {createPortal(tooltipEl, document.body)}
      {children}
    </div>
  );
};

export default ChartWithExplanation;
