import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const ANOMALY_EXPLANATION = 'Distribution of anomaly scores across events. Peaks show common risk levels. Low (0–20%) = normal, high (80–100%) = highly anomalous.';

const AnomalyDistribution = ({ events = [] }) => {
  const [hovered, setHovered] = useState(false);
  if (!events?.length) {
    return (
      <div className="hyper-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Anomaly Distribution</h3>
        <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">No data</div>
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

  const barColors = ['#06b6d4', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <div className={`hyper-card p-4 sm:p-6 animate-fade-in shadow-[0_0_28px_-4px_rgba(168,85,247,0.12)] transition-shadow duration-300 ${hovered ? 'shadow-[0_0_40px_-6px_rgba(168,85,247,0.3)]' : ''}`}>
      <ChartWithExplanation title="Anomaly Distribution" explanation={ANOMALY_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={histogram} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <CartesianGrid strokeDasharray="3 3" stroke={hovered ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.06)'} />
          <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: '#1e1e1e',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: 16,
              fontWeight: 500,
              color: '#f4f4f5',
              boxShadow: '0 0 28px rgba(168, 85, 247, 0.2)',
            }}
            itemStyle={{ fontSize: 15, color: '#f4f4f5' }}
            labelStyle={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} animationEasing="ease-out">
            {histogram.map((_, i) => (
              <Cell key={i} fill={barColors[i % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

export default AnomalyDistribution;
