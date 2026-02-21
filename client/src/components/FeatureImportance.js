import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, Zap } from 'lucide-react';

const FeatureImportance = ({ features }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!features?.length) return null;
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.contribution ?? f.deviationScore ?? 0)), 0.001);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-5 sm:p-6 animate-fade-in shadow-xl shadow-black/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Activity className="w-5 h-5 text-zinc-300" />
        </div>
        <h3 className="text-lg font-semibold text-white tracking-tight">
          Anomaly Drivers
        </h3>
      </div>
      <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
        Top ML-derived feature contributions. From model explainability (perturbation-based).
      </p>
      <div className="space-y-4">
        {features.slice(0, 5).map((f, i) => {
          const contrib = f.contribution ?? f.deviationScore ?? 0;
          const width = Math.min(100, (Math.abs(contrib) / maxAbs) * 100);
          const isPrimary = i === 0;
          const isPositive = contrib > 0;
          return (
            <div
              key={i}
              className={`rounded-lg border transition-all duration-300 hover:border-white/20 ${
                isPrimary
                  ? 'bg-white/5 border-white/15 p-4 shadow-lg'
                  : 'bg-black/20 border-white/5 p-3'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isPrimary && (
                    <span className="flex-shrink-0 p-1 rounded bg-white/10">
                      <Zap className="w-3.5 h-3.5 text-zinc-300" />
                    </span>
                  )}
                  <span className="text-sm font-medium text-zinc-200 truncate">{f.name}</span>
                  {isPrimary && (
                    <span className="flex-shrink-0 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <span className="flex-shrink-0 font-mono text-sm text-zinc-400 tabular-nums">
                  {(contrib).toFixed(3)}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-zinc-800/80 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isPrimary
                      ? 'bg-gradient-to-r from-zinc-400 to-white'
                      : isPositive
                      ? 'bg-zinc-500'
                      : 'bg-zinc-600'
                  }`}
                  style={{
                    width: mounted ? `${width}%` : '0%',
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
        <ChevronRight className="w-3.5 h-3.5" />
        Select an event to see drivers from the ML model
      </div>
    </div>
  );
};

export default FeatureImportance;
