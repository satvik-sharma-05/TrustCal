import React, { useState, useEffect, useRef } from 'react';

const iconMap = {
  total: 'total',
  highRisk: 'highRisk',
  mfa: 'mfa',
  block: 'block',
  avgRisk: 'avgRisk',
  confidence: 'confidence',
};

const colorMap = {
  cyan: { icon: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400', glow: 'shadow-[0_0_20px_-2px_rgba(6,182,212,0.4)]' },
  crimson: { icon: 'bg-red-500/20 border-red-400/40 text-red-400', glow: 'shadow-[0_0_20px_-2px_rgba(239,68,68,0.4)]' },
  amber: { icon: 'bg-amber-500/20 border-amber-400/40 text-amber-400', glow: 'shadow-[0_0_20px_-2px_rgba(245,158,11,0.4)]' },
  emerald: { icon: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400', glow: 'shadow-[0_0_20px_-2px_rgba(16,185,129,0.4)]' },
  purple: { icon: 'bg-purple-500/20 border-purple-400/40 text-purple-400', glow: 'shadow-[0_0_20px_-2px_rgba(168,85,247,0.4)]' },
};

function useCountUp(end, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled || end == null) return;
    const isDecimal = Number(end) !== Math.floor(Number(end));
    const start = startRef.current ?? 0;
    startRef.current = end;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      const current = start + (end - start) * ease;
      setValue(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, enabled]);

  return value;
}

const StatsCardIcon = ({ variant }) => {
  switch (variant) {
    case 'highRisk':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statHighRisk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f97373" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statHighRisk)" />
          <path
            d="M20 11L10.8 28.5c-.3.6.1 1.3.8 1.3h16.7c.7 0 1.1-.7.8-1.3L20 11z"
            fill="#111827"
          />
          <rect x="18.8" y="16" width="2.4" height="7.8" rx="1.1" fill="#f97373" />
          <rect x="18.8" y="25.6" width="2.4" height="2.6" rx="1.3" fill="#f97373" />
        </svg>
      );
    case 'mfa':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statMfa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statMfa)" />
          <path
            d="M20 10.5c-3 0-5.4 2.4-5.4 5.4v2.2H13a1.5 1.5 0 0 0-1.5 1.5v8.2A1.5 1.5 0 0 0 13 29.3h14a1.5 1.5 0 0 0 1.5-1.5v-8.2A1.5 1.5 0 0 0 27 18.1h-1.6v-2.2c0-3-2.4-5.4-5.4-5.4z"
            fill="#111827"
          />
          <path
            d="M18.1 21.4l2.3 2.3 4-4"
            fill="none"
            stroke="#facc15"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'block':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statBlock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statBlock)" />
          <rect x="11.5" y="17.5" width="17" height="11" rx="2.3" fill="#111827" />
          <path
            d="M16.2 17.5v-2.2A3.8 3.8 0 0 1 20 11.5a3.8 3.8 0 0 1 3.8 3.8v2.2"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="22.5" r="1.3" fill="#fca5a5" />
        </svg>
      );
    case 'avgRisk':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statAvg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statAvg)" />
          <path
            d="M12 24.5c1.9-2.6 3.6-4 5.1-4 1.6 0 2.4 1.3 3.7 1.3 1.5 0 2.6-1.7 4.9-5.7"
            fill="none"
            stroke="#111827"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="15" r="1.4" fill="#111827" />
          <circle cx="22.2" cy="17" r="1.4" fill="#111827" />
        </svg>
      );
    case 'confidence':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statConfidence" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statConfidence)" />
          <path
            d="M14 17.5c0-3.3 2.6-6 6-6s6 2.7 6 6-2.6 8.5-6 10.9c-3.4-2.4-6-7.6-6-10.9z"
            fill="#0b1120"
          />
          <path
            d="M19.2 18.4l1.6 1.7 3.2-3.3"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'total':
    default:
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="statTotal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#statTotal)" />
          <path
            d="M13 24h3.2v-6.2L20 24h2l3.7-7.4V24H27"
            fill="none"
            stroke="#0b1120"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 16.6h14"
            fill="none"
            stroke="#0b1120"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

const StatsCard = ({ title, value, subtitle, icon = 'total', color = 'purple' }) => {
  const animate = typeof value === 'number';
  const counted = useCountUp(animate ? value : 0, 800, animate);
  const displayValue = animate ? counted : value;
  const suffix = animate && title && title.toLowerCase().includes('confidence') ? '%' : '';
  const theme = colorMap[color] || colorMap.purple;

  return (
    <div className={`hyper-card p-4 sm:p-5 hover:scale-[1.02] group ${theme.glow}`}>
      <div className="relative z-10">
        <div className={`stat-icon inline-flex items-center justify-center p-2.5 rounded-xl border ${theme.icon} mb-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.05]`}>
          <StatsCardIcon variant={iconMap[icon] || 'total'} />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">{displayValue}{suffix}</div>
        <div className="label-upper mt-0.5 text-zinc-400">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
