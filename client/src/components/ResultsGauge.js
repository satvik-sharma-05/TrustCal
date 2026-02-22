import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Info } from 'lucide-react';

const ResultsGauge = ({ riskScore = 0, decision = 'allow', stats }) => {
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

  const radius = 72;
  const halfCircumference = Math.PI * radius;
  const strokeDashoffset = halfCircumference - (riskScore / 100) * halfCircumference;

  const getColors = () => {
    if (riskScore <= 30) return { primary: '#22c55e', glow: 'rgba(34,197,94,0.35)', label: 'Low risk' };
    if (riskScore <= 70) return { primary: '#f59e0b', glow: 'rgba(245,158,11,0.35)', label: 'Medium risk' };
    return { primary: '#ef4444', glow: 'rgba(239,68,68,0.35)', label: 'High risk' };
  };

  const colors = getColors();
  const totalEvents = stats?.totalLogins ?? 0;

  const tooltipEl = showInfo ? (
    <div
      className="fixed z-[9999] w-64 p-3 rounded-xl text-xs text-zinc-300 animate-fade-in"
      style={{
        top: pos.top,
        left: Math.max(16, pos.left),
        background: '#2c2c2c',
        border: `1px solid ${colors.primary}40`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(34, 197, 94, 0.1)',
      }}
    >
      The risk score (0–100) is computed by our ML model from login features (time, region, device, role, failed attempts, etc.). Higher scores indicate higher identity risk. The decision (Allow / MFA / Block) is derived from this score and anomaly signals.
    </div>
  ) : null;

  return (
    <div className="hyper-card relative overflow-visible rounded-2xl p-6 shadow-[0_0_28px_-4px_rgba(34,197,94,0.12)] animate-fade-in">
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 80%, ${colors.glow}, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-6">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: colors.primary }} />
            Results
          </h3>
          <button
            ref={btnRef}
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        {createPortal(tooltipEl, document.body)}

        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="resultsGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0.5" />
              </linearGradient>
              <filter id="resultsGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="url(#resultsGaugeGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={halfCircumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
              filter="url(#resultsGlow)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold tabular-nums transition-colors duration-500"
              style={{ color: colors.primary }}
            >
              {riskScore}
            </span>
            <span className="text-xs text-zinc-500 mt-0.5">Risk score</span>
          </div>
        </div>

        <div className="mt-4 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border" style={{ background: `${colors.primary}22`, borderColor: `${colors.primary}66`, color: colors.primary }}>
          {decision}
        </div>

        <p className="text-xs text-zinc-500 mt-4 text-center">
          {totalEvents} total events • ML model
        </p>
      </div>
    </div>
  );
};

export default ResultsGauge;
