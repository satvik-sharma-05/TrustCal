import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

const FeatureImportance = ({ features }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!features?.length) return null;
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.contribution ?? f.deviationScore ?? 0)), 0.001);
  const topFeature = features[0];

  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in">
      <h3 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
        Anomaly Drivers
        <span className="text-slate-500" title="Feature deviation from baseline (0 = normal)">
          <Info className="w-4 h-4" />
        </span>
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Top features that drove the anomaly score. Negative contribution = pushed toward anomalous. From ML perturbation-based explainability.
      </p>
      <div className="space-y-4">
        {features.slice(0, 5).map((f, i) => {
          const contrib = Math.abs(f.contribution ?? f.deviationScore ?? 0);
          const width = Math.min(100, (contrib / maxAbs) * 100);
          const isTop = i === 0;
          return (
            <div key={i} className={isTop ? 'relative' : ''}>
              {isTop && (
                <span className="absolute -top-0.5 -right-0 text-[10px] text-crimson font-medium">Primary</span>
              )}
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 font-medium">{f.name}</span>
                <span className="font-mono text-slate-400 text-xs">
                  {(f.contribution ?? f.deviationScore ?? 0).toFixed(3)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden recessed-input">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTop
                      ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : i === 1
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-slate-500 to-slate-600'
                  }`}
                  style={{
                    width: mounted ? `${width}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureImportance;
