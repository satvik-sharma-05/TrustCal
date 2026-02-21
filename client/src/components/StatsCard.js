import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Shield, Lock } from 'lucide-react';

const iconMap = { total: Activity, highRisk: AlertTriangle, mfa: Shield, block: Lock, avgRisk: Activity, confidence: Shield };

const colorMap = {
  cyan: 'from-zinc-700/60 to-zinc-800/40 border-white/10 text-zinc-200',
  crimson: 'from-zinc-700/60 to-zinc-800/40 border-white/10 text-zinc-200',
  amber: 'from-zinc-700/60 to-zinc-800/40 border-white/10 text-zinc-200',
  emerald: 'from-zinc-700/60 to-zinc-800/40 border-white/10 text-zinc-200',
  purple: 'from-zinc-700/60 to-zinc-800/40 border-white/10 text-zinc-200',
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

const StatsCard = ({ title, value, subtitle, icon = 'total', color = 'purple' }) => {
  const Icon = iconMap[icon] || Activity;
  const animate = typeof value === 'number';
  const counted = useCountUp(animate ? value : 0, 800, animate);
  const displayValue = animate ? counted : value;
  const suffix = animate && title && title.toLowerCase().includes('confidence') ? '%' : '';
  const colorClass = colorMap[color] || colorMap.purple;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 hover:border-white/15 group">
      <div className="relative z-10">
        <div className={`inline-flex p-2 rounded-lg bg-white/5 border border-white/10 ${colorClass} mb-3`}>
          <Icon className="w-5 h-5 text-zinc-300" />
        </div>
        <div className="text-xl sm:text-2xl font-light tracking-tight text-white">{displayValue}{suffix}</div>
        <div className="label-upper mt-0.5 text-zinc-400">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
