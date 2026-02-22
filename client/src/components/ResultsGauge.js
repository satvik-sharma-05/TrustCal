import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResultsGauge = ({ riskScore = 0, decision = 'allow', stats }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const getTheme = () => {
    if (riskScore <= 30) return {
      color: '#00FF41',
      glow: 'rgba(0, 255, 65, 0.4)',
      label: 'IDENTITY_VERIFIED',
      icon: CheckCircle2,
      decisionBg: 'bg-primary/5',
      decisionBorder: 'border-primary/20',
      decisionText: 'text-primary'
    };
    if (riskScore <= 70) return {
      color: '#00F5FF',
      glow: 'rgba(0, 245, 255, 0.4)',
      label: 'MFA_CHALLENGE',
      icon: AlertTriangle,
      decisionBg: 'bg-accent/10',
      decisionBorder: 'border-accent/30',
      decisionText: 'text-accent'
    };
    return {
      color: '#FF0033',
      glow: 'rgba(255, 0, 51, 0.4)',
      label: 'PROTOCOL_ISOLATION',
      icon: AlertCircle,
      decisionBg: 'bg-danger/10',
      decisionBorder: 'border-danger/30',
      decisionText: 'text-danger'
    };
  };

  const theme = getTheme();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative hyper-card p-10 flex flex-col items-center justify-center min-h-[420px] bg-black border border-primary/20 shadow-2xl overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
          <h3 className="text-[9px] font-black tracking-[0.5em] text-primary/60 uppercase">Neural_Telemetery</h3>
        </div>
        <button
          ref={btnRef}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="p-2 bg-black border border-primary/20 text-primary/40 hover:text-primary transition-all rounded-sm"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Shadow/Glow Ring */}
        <div
          className="absolute inset-8 rounded-full blur-3xl opacity-20 transition-all duration-1000"
          style={{ backgroundColor: theme.color }}
        />

        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 overflow-visible">
          <defs>
            <linearGradient id="matrixGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF41" />
              <stop offset="100%" stopColor={theme.color} />
            </linearGradient>
            <filter id="matrixNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track - Segemented */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(0, 255, 65, 0.03)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Animated Progress Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#matrixGaugeGradient)"
            strokeWidth="4"
            strokeLinecap="butt"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "circOut" }}
            strokeDasharray={circumference}
            filter="url(#matrixNeonGlow)"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className={`text-8xl font-black font-mono tracking-tighter drop-shadow-[0_0_15px_${theme.glow}] transition-colors duration-500`} style={{ color: theme.color }}>
              {riskScore}
            </span>
            <span className="text-[10px] font-black tracking-[0.4em] text-primary/40 uppercase mt-2">
              Anomaly_Ratio
            </span>
          </motion.div>
        </div>
      </div>

      {/* Decision Badge */}
      <motion.div
        key={decision}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`mt-12 px-8 py-3 rounded-sm border ${theme.decisionBorder} ${theme.decisionBg} ${theme.decisionText} flex items-center gap-4 shadow-xl transition-all duration-500`}
        style={{ boxShadow: `0 0 20px ${theme.glow}33` }}
      >
        <theme.icon className="w-4 h-4 animate-flicker" />
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">{theme.label}</span>
      </motion.div>

      <div className="mt-8 flex items-center gap-5 text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">
        <span>PGuard Analysis v3.1</span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        <span>Quantum Adaptive</span>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 m-6 p-10 bg-black/95 text-primary text-[10px] leading-relaxed z-50 font-black border border-primary/20 flex flex-col items-center justify-center text-center uppercase tracking-widest"
          >
            <div className="mb-4 text-primary opacity-40">System_Prompt</div>
            Adaptive identity verification protocol analyzing multi-vector entropy spikes. High probability detections trigger immediate Zero-Trust isolation.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsGauge;
