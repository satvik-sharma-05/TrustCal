import React from 'react';

const AnomalyScore = ({ anomalyScore, riskScore }) => {
  if (anomalyScore == null) return null;

  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-600 mb-2">ML anomaly score</div>
      <div className="text-2xl font-bold text-slate-900">{(anomalyScore * 100).toFixed(1)}%</div>
      {riskScore != null && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 uppercase">Risk score</div>
          <div className="text-lg font-semibold text-slate-900">{riskScore}/100</div>
        </div>
      )}
    </div>
  );
};

export default AnomalyScore;
