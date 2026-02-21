import React from 'react';

const RiskGauge = ({ riskScore = 0 }) => {
  const size = 160;
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  const getColor = (score) => {
    if (score <= 30) return '#16a34a';
    if (score <= 70) return '#d97706';
    return '#B00020';
  };

  const getLabel = (score) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 70) return 'Medium Risk';
    return 'High Risk';
  };

  const color = getColor(riskScore);

  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-600 mb-4">Risk Score</div>
      <div className="flex items-center justify-center mb-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx={size/2} cy={size/2} r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl font-bold text-slate-900">{riskScore}</div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm font-medium" style={{ color }}>{getLabel(riskScore)}</div>
    </div>
  );
};

export default RiskGauge;
