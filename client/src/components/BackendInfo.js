import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

const BackendInfo = ({ mlStatus }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">How risk scores are computed</h3>
            <p className="text-xs text-slate-400">Isolation Forest • 13 features • Percentile calibration</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/5 animate-slide-down">
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p><strong className="text-cyan-400">1. Training (Python):</strong> Isolation Forest trained on 12k+ normal logins only. StandardScaler fitted on training data.</p>
            <p><strong className="text-purple-400">2. Feature vector (13):</strong> hour_normalized, deviation_from_typical_hour, is_weekend, region_frequency_score, is_new_region, region_rarity_score, device_seen_count_normalized, is_new_device, failed_attempts_normalized, failed_attempt_rate, time_since_last_login_normalized, login_frequency_normalized, role_importance.</p>
            <p><strong className="text-amber-400">3. Inference:</strong> Node.js builds features from user profile → sends to Python ML server → decision_function → percentile-based risk 0–100 → thresholds (Allow ≤30, MFA ≤70, Block &gt;70).</p>
            <p><strong className="text-emerald-400">4. Decisions:</strong> Env ALLOW_THRESHOLD, MFA_THRESHOLD. Explainability: top 3 features by deviation from baseline.</p>
            {mlStatus?.modelVersion && (
              <p className="text-xs text-slate-500 pt-2">Model v{String(mlStatus.modelVersion).slice(0, 14)} • MongoDB stores events</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendInfo;
