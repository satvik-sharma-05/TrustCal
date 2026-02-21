import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Shield, Lock } from 'lucide-react';

const iconMap = { total: Activity, highRisk: AlertTriangle, mfa: Shield, block: Lock, avgRisk: Activity, confidence: Shield };

const colorMap = {
  cyan: 'from-cyan-500/30 to-cyan-600/10 border-cyan-400/30 text-cyan-400',
  crimson: 'from-crimson/30 to-red-600/10 border-crimson/40 text-crimson',
  amber: 'from-amber-500/30 to-amber-600/10 border-amber-400/30 text-amber-400',
  emerald: 'from-emerald-500/30 to-emerald-600/10 border-emerald-400/30 text-emerald-400',
  purple: 'from-purple-500/30 to-purple-600/10 border-purple-400/30 text-purple-400',
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
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] group">
      <div className="relative z-10">
        <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${colorClass} mb-3 shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xl sm:text-2xl font-light tracking-tight text-white">{displayValue}{suffix}</div>
        <div className="label-upper mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
