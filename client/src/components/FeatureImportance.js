import React from 'react';

const FeatureImportance = ({ features }) => {
  if (!features?.length) return null;
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.contribution ?? 0)), 0.001);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Feature contribution</h3>
      <div className="space-y-3">
        {features.slice(0, 5).map((f, i) => {
          const contrib = f.contribution ?? 0;
          const width = Math.min(100, (Math.abs(contrib) / maxAbs) * 100);
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700 font-medium">{f.name}</span>
                <span className="text-slate-600">{contrib.toFixed(3)}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3">Higher contribution indicates stronger influence on anomaly score.</p>
    </div>
  );
};

export default FeatureImportance;
