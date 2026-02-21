import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RiskChart = ({ data = [], type = 'line' }) => {
  if (!data?.length) {
    return (
      <div className="card p-6 h-64 flex items-center justify-center">
        <span className="text-slate-500 text-sm">No data</span>
      </div>
    );
  }

  const chartData = data.slice(0, 20).map((e, i) => ({ name: `E${i + 1}`, risk: e.riskScore ?? 0 }));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk score trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
            <Area type="monotone" dataKey="risk" stroke="#B00020" fill="#B00020" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
            <Line type="monotone" dataKey="risk" stroke="#B00020" strokeWidth={2} dot={{ fill: '#B00020', r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export const DecisionChart = ({ stats = {} }) => {
  const data = [
    { name: 'Allow', value: stats.allow ?? 0 },
    { name: 'MFA', value: stats.mfa ?? 0 },
    { name: 'Block', value: stats.block ?? 0 },
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Decision breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
          <Bar dataKey="value" fill="#B00020" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;
