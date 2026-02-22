import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const RISK_TREND_EXPLANATION = 'Risk score (0–100) for each recent login event. Higher values indicate more anomalous behavior. The ML model computes this from 13 features using Isolation Forest and percentile calibration.';

const chartStyles = {
  grid: { stroke: 'rgba(255,255,255,0.06)' },
  axis: { stroke: 'rgba(255,255,255,0.4)', fontSize: 11 },
  tooltip: {
    contentStyle: {
      background: '#1e1e1e',
      border: '1px solid rgba(34, 197, 94, 0.4)',
      borderRadius: 14,
      padding: '14px 18px',
      fontSize: 16,
      fontWeight: 500,
      color: '#f4f4f5',
      boxShadow: '0 0 28px rgba(34, 197, 94, 0.2)',
    },
    itemStyle: { fontSize: 15, color: '#f4f4f5' },
    labelStyle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 },
  },
};

const RiskChart = ({ data = [], type = 'line' }) => {
  const [hovered, setHovered] = useState(false);
  if (!data?.length) {
    return (
      <div className="hyper-card p-4 sm:p-6 animate-fade-in">
        <ChartWithExplanation title="Risk Score Trend" explanation={RISK_TREND_EXPLANATION}>
          <div className="h-48 sm:h-64 flex items-center justify-center text-zinc-500 text-sm">No data</div>
        </ChartWithExplanation>
      </div>
    );
  }

  const chartData = data.slice(0, 20).map((e, i) => ({ name: `E${i + 1}`, risk: e.riskScore ?? 0 }));

  return (
    <div className={`hyper-card p-4 sm:p-6 animate-fade-in shadow-[0_0_28px_-4px_rgba(6,182,212,0.12)] transition-shadow duration-300 ${hovered ? 'shadow-[0_0_40px_-6px_rgba(6,182,212,0.3)]' : ''}`}>
      <ChartWithExplanation title="Risk Score Trend" explanation={RISK_TREND_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        {type === 'area' ? (
          <AreaChart data={chartData} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <CartesianGrid strokeDasharray="3 3" stroke={hovered ? 'rgba(34,197,94,0.35)' : chartStyles.grid.stroke} />
            <XAxis dataKey="name" {...chartStyles.axis} />
            <YAxis {...chartStyles.axis} domain={[0, 100]} />
            <Tooltip {...chartStyles.tooltip} />
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="risk" stroke="#22c55e" fill="url(#riskGradient)" strokeWidth={2.5} isAnimationActive animationDuration={1000} animationEasing="ease-out" />
          </AreaChart>
        ) : (
          <LineChart data={chartData} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <CartesianGrid strokeDasharray="3 3" stroke={hovered ? 'rgba(34,197,94,0.35)' : chartStyles.grid.stroke} />
            <XAxis dataKey="name" {...chartStyles.axis} />
            <YAxis {...chartStyles.axis} domain={[0, 100]} />
            <Tooltip {...chartStyles.tooltip} />
            <Line type="monotone" dataKey="risk" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
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
    { name: 'Allow', value: stats.allow ?? 0, fill: '#22c55e' },
    { name: 'MFA', value: stats.mfa ?? 0, fill: '#f59e0b' },
    { name: 'Block', value: stats.block ?? 0, fill: '#ef4444' },
  ];

  const [hovered, setHovered] = useState(false);

  return (
    <div className={`hyper-card p-4 sm:p-6 animate-fade-in shadow-[0_0_28px_-4px_rgba(245,158,11,0.12)] transition-shadow duration-300 ${hovered ? 'shadow-[0_0_40px_-6px_rgba(245,158,11,0.3)]' : ''}`}>
      <ChartWithExplanation title="Decision Breakdown" explanation={DECISION_EXPLANATION}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <CartesianGrid strokeDasharray="3 3" stroke={hovered ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.06)'} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: '#1e1e1e',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: 16,
              fontWeight: 500,
              color: '#f4f4f5',
              boxShadow: '0 0 28px rgba(245, 158, 11, 0.2)',
            }}
            itemStyle={{ fontSize: 15, color: '#f4f4f5' }}
            labelStyle={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700} animationEasing="ease-out">
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
