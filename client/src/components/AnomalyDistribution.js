import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const ANOMALY_EXPLANATION = 'Distribution of anomaly scores across events. Peaks show common risk levels. Low (0–20%) = normal, high (80–100%) = highly anomalous.';

const AnomalyDistribution = ({ events = [] }) => {
  if (!events?.length) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Anomaly Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <span className="text-slate-500 text-sm">No data</span>
        </div>
      </div>
    );
  }

  const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const histogram = bins.slice(0, -1).map((bin, i) => {
    const count = events.filter((e) => {
      const s = e.anomalyScore ?? (e.riskScore / 100);
      return s >= bin && s < bins[i + 1];
    }).length;
    return { range: `${(bin * 100).toFixed(0)}–${(bins[i + 1] * 100).toFixed(0)}%`, count };
  });

  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in">
      <ChartWithExplanation title="Anomaly Distribution" explanation={ANOMALY_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 21, 37, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

export default AnomalyDistribution;
