import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

const BackendInfo = ({ mlStatus }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Info className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">How risk scores are computed</h3>
            <p className="text-xs text-zinc-500">ML-only: Isolation Forest • 13 features • Percentile calibration</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/10 animate-slide-down">
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p><strong className="text-white">1. Training (Python):</strong> Isolation Forest trained on normal logins only. No rule-based logic.</p>
            <p><strong className="text-white">2. Feature vector (13):</strong> hour_normalized, deviation_from_typical_hour, is_weekend, region_*, device_*, failed_attempts_*, time_since_last_login, login_frequency, role_importance.</p>
            <p><strong className="text-white">3. Inference:</strong> Backend sends feature vector to ML server → model.decision_function → percentile-based risk 0–100. Decisions from env thresholds only.</p>
            <p><strong className="text-white">4. Explainability:</strong> Top 3 features by perturbation-based contribution from the model.</p>
            {mlStatus?.modelVersion && (
              <p className="text-xs text-zinc-500 pt-2">Model v{String(mlStatus.modelVersion).slice(0, 14)} • MongoDB stores events</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendInfo;
