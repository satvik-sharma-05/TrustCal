import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const RISK_TREND_EXPLANATION = 'Risk score (0–100) for each recent login event. Higher values indicate more anomalous behavior. The ML model computes this from 13 features using Isolation Forest and percentile calibration.';

const chartStyles = {
  grid: { stroke: 'rgba(255,255,255,0.06)' },
  axis: { stroke: '#71717a', fontSize: 11 },
  tooltip: {
    contentStyle: {
      background: 'rgba(9, 9, 11, 0.98)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      fontSize: 12,
    },
  },
};

const RiskChart = ({ data = [], type = 'line' }) => {
  if (!data?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
        <ChartWithExplanation title="Risk Score Trend" explanation={RISK_TREND_EXPLANATION}>
          <div className="h-48 sm:h-64 flex items-center justify-center">
            <span className="text-zinc-500 text-sm">No data</span>
          </div>
        </ChartWithExplanation>
      </div>
    );
  }

  const chartData = data.slice(0, 20).map((e, i) => ({ name: `E${i + 1}`, risk: e.riskScore ?? 0 }));

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
      <ChartWithExplanation title="Risk Score Trend" explanation={RISK_TREND_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" {...chartStyles.grid} />
            <XAxis dataKey="name" {...chartStyles.axis} />
            <YAxis {...chartStyles.axis} domain={[0, 100]} />
            <Tooltip {...chartStyles.tooltip} />
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#71717a" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#52525b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#27272a" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="risk" stroke="#a1a1aa" fill="url(#riskGradient)" strokeWidth={2} isAnimationActive animationDuration={800} animationEasing="ease-out" />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" {...chartStyles.grid} />
            <XAxis dataKey="name" {...chartStyles.axis} />
            <YAxis {...chartStyles.axis} domain={[0, 100]} />
            <Tooltip {...chartStyles.tooltip} />
            <Line type="monotone" dataKey="risk" stroke="#a1a1aa" strokeWidth={2} dot={{ fill: '#a1a1aa', r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

const DECISION_EXPLANATION = 'Count of Allow, MFA, and Block decisions from the ML model. Thresholds: Allow ≤30, MFA ≤70, Block >70 risk score.';

export const DecisionChart = ({ stats = {} }) => {
  const data = [
    { name: 'Allow', value: stats.allow ?? 0, fill: '#a1a1aa' },
    { name: 'MFA', value: stats.mfa ?? 0, fill: '#71717a' },
    { name: 'Block', value: stats.block ?? 0, fill: '#52525b' },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
      <ChartWithExplanation title="Decision Breakdown" explanation={DECISION_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 21, 37, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

export default RiskChart;
