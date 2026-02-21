import React, { useState, useEffect } from 'react';
import { Check, Shield, X } from 'lucide-react';

const RiskOrb = ({ riskScore = 0, decision = 'allow', anomalyScore, onNewEval }) => {
  const [prevScore, setPrevScore] = useState(riskScore);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (riskScore !== prevScore) {
      setPulse(true);
      const t = setTimeout(() => {
        setPulse(false);
        setPrevScore(riskScore);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [riskScore, prevScore]);

  const getColors = () => {
    if (riskScore <= 30) return { main: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', bg: 'rgba(16, 185, 129, 0.08)' };
    if (riskScore <= 70) return { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', bg: 'rgba(245, 158, 11, 0.08)' };
    return { main: '#dc2626', glow: 'rgba(220, 38, 38, 0.4)', bg: 'rgba(220, 38, 38, 0.08)' };
  };

  const getDecisionConfig = () => {
    switch (decision) {
      case 'allow': return { icon: Check, label: 'Allow', className: 'text-emerald border-emerald/30 bg-emerald/10' };
      case 'mfa': return { icon: Shield, label: 'MFA', className: 'text-amber border-amber/30 bg-amber/10' };
      case 'block': return { icon: X, label: 'Block', className: 'text-crimson border-crimson/30 bg-crimson/10' };
      default: return { icon: Check, label: decision, className: 'text-slate-400 border-slate-500/30 bg-slate-500/10' };
    }
  };

  const colors = getColors();
  const decConfig = getDecisionConfig();
  const DecisionIcon = decConfig.icon;
  const pulseRate = riskScore > 70 ? 2 : riskScore > 30 ? 1.5 : 1;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex flex-col items-center">
        <div
          className="relative w-[180px] h-[180px] rounded-full flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${colors.main}40, ${colors.main}15, transparent 70%)`,
            boxShadow: pulse ? `0 0 60px ${colors.glow}` : `0 0 40px ${colors.glow}`,
            animation: `breathe ${3 / pulseRate}s ease-in-out infinite`,
          }}
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 40%, ${colors.main}30, transparent 60%)`,
            }}
          />
          <div
            className={`absolute inset-0 rounded-full border-2 border-white/10 ${pulse ? 'scale-105' : ''} transition-transform duration-500`}
          />
          <div className="relative z-10 text-5xl font-light tracking-tight text-white drop-shadow-lg animate-float">
            {riskScore}
          </div>
        </div>

        <div
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border glass-secondary transition-all duration-300 ${
            pulse ? 'scale-105' : ''
          } ${decConfig.className}`}
        >
          <DecisionIcon className="w-4 h-4" />
          <span className="font-medium text-sm uppercase tracking-wider">{decConfig.label}</span>
        </div>

        {(anomalyScore != null || riskScore > 0) && (
          <div className="mt-4 w-full">
            <div className="label-upper mb-1">Model confidence</div>
            <div className="h-1 rounded-full overflow-hidden recessed-input">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: '85%',
                  background: `linear-gradient(90deg, ${colors.main}80, ${colors.main}40)`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskOrb;
