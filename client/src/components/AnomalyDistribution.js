import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnomalyDistribution = ({ events = [] }) => {
  if (!events?.length) {
    return (
      <div className="card p-6 h-64 flex items-center justify-center">
        <span className="text-slate-500 text-sm">No data</span>
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
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Anomaly distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
          <Bar dataKey="count" fill="#B00020" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomalyDistribution;
