import React, { useState, useEffect, useRef } from 'react';

import { Activity, ShieldAlert, ShieldCheck, Lock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  total: Activity,
  highRisk: ShieldAlert,
  mfa: Zap,
  block: Lock,
  avgRisk: Target,
  confidence: ShieldCheck,
};

const colorMap = {
  cyan: {
    icon: 'text-accent', // --accent is cyan
    bg: 'bg-accent/5',
    border: 'border-accent/20',
    glow: 'shadow-[0_0_15px_rgba(0,245,255,0.2)]',
    accent: 'bg-accent'
  },
  crimson: {
    icon: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    glow: 'shadow-[0_0_15px_rgba(255,0,51,0.2)]',
    accent: 'bg-danger'
  },
  amber: {
    icon: 'text-primary-soft',
    bg: 'bg-primary-soft/10',
    border: 'border-primary-soft/20',
    glow: 'shadow-[0_0_15px_rgba(0,204,51,0.2)]',
    accent: 'bg-primary-soft'
  },
  emerald: {
    icon: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    glow: 'shadow-[0_0_15px_rgba(0,255,65,0.2)]',
    accent: 'bg-primary'
  },
  purple: {
    icon: 'text-primary-soft',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    glow: 'shadow-[0_0_15px_rgba(0,255,65,0.2)]',
    accent: 'bg-primary'
  },
};

function useCountUp(end, duration = 1200, enabled = true) {
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
      const ease = 1 - Math.pow(1 - 2.5 * (1 - t), 2); // custom ease
      const current = start + (end - start) * Math.max(0, Math.min(1, t));
      setValue(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, enabled]);

  return value;
}

const StatsCard = ({ title, value, subtitle, icon = 'total', color = 'purple' }) => {
  const animate = typeof value === 'number';
  const counted = useCountUp(animate ? value : 0, 1000, animate);
  const displayValue = animate ? counted : value;
  const suffix = animate && title && title.toLowerCase().includes('confidence') ? '%' : '';
  const theme = colorMap[color] || colorMap.purple;
  const Icon = iconMap[icon] || iconMap.total;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative group h-full"
    >
      <div className={`relative hyper-card p-6 h-full flex flex-col justify-between overflow-hidden bg-black/60 backdrop-blur-md border border-primary/20 transition-all duration-300`}>
        {/* Cyber-Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Animated Corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40 rounded-bl-sm" />

        <div className="flex items-start justify-between relative z-10 mb-6">
          <div className={`p-2.5 bg-black border border-primary/20 rounded-sm`}>
            <Icon className={`w-4 h-4 ${theme.icon} animate-flicker`} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black tracking-[0.2em] text-primary/40 uppercase">Secure_Node</span>
            <div className={`w-1 h-1 bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]`} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter text-white font-mono drop-shadow-[0_0_10px_rgba(0,255,65,0.3)]">
              {displayValue}
            </span>
            <span className="text-xs font-black text-primary/60 font-mono italic">{suffix}</span>
          </div>
          <div className="text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase mt-2 group-hover:text-primary transition-colors">
            {title}
          </div>
        </div>

        {/* Binary stream simulation or bar */}
        <div className="mt-4 h-1 bg-primary/5 rounded-full overflow-hidden relative">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-primary opacity-60`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-line-move" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
