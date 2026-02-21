import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Shield, Lock } from 'lucide-react';

const iconMap = { total: Activity, highRisk: AlertTriangle, mfa: Shield, block: Lock, avgRisk: Activity, confidence: Shield };

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

const StatsCard = ({ title, value, subtitle, icon = 'total' }) => {
  const Icon = iconMap[icon] || Activity;
  const animate = typeof value === 'number';
  const counted = useCountUp(animate ? value : 0, 800, animate);
  const displayValue = animate ? counted : value;
  const suffix = animate && title && title.toLowerCase().includes('confidence') ? '%' : '';

  return (
    <div className="card p-5 animate-count-up">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded bg-slate-100">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{displayValue}{suffix}</div>
      <div className="text-sm font-medium text-slate-500 mt-0.5">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
};

export default StatsCard;
