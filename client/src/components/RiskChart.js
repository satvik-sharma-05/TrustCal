import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const RISK_TREND_EXPLANATION = 'Risk score (0–100) for each recent login event. Higher values indicate more anomalous behavior. The ML model computes this from 13 features using Isolation Forest and percentile calibration.';

const chartStyles = {
  grid: { stroke: 'rgba(0, 255, 65, 0.05)' },
  axis: { stroke: 'rgba(0, 255, 65, 0.3)', fontSize: 9, fontWeight: '900', fontFamily: 'monospace' },
  tooltip: {
    contentStyle: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: 2,
      padding: '12px 16px',
      fontSize: 10,
      fontWeight: 800,
      color: '#FFFFFF',
      boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)',
    },
    itemStyle: { fontSize: 10, color: '#00FF41', fontFamily: 'monospace' },
    labelStyle: { fontSize: 10, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '0.2em', fontFamily: 'monospace' },
  },
};

const RiskChart = ({ data = [], type = 'line' }) => {
  const [hovered, setHovered] = useState(false);
  if (!data?.length) {
    return (
      <div className="hyper-card p-4 sm:p-6 animate-fade-in bg-white/70 backdrop-blur-xl border border-white/50">
        <ChartWithExplanation title="Risk Score Trend" explanation={RISK_TREND_EXPLANATION}>
          <div className="h-48 sm:h-64 flex items-center justify-center text-text-secondary opacity-40 text-xs font-black uppercase tracking-widest">No intelligence data</div>
        </ChartWithExplanation>
      </div>
    );
  }

  const chartData = data.slice(0, 20).map((e, i) => ({ name: `T${i + 1}`, risk: e.riskScore ?? 0 }));

  return (
    <div className={`hyper-card p-10 bg-black/80 border border-primary/20 shadow-2xl transition-all duration-500 hover:border-primary/40 relative overflow-hidden group`}>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
        <h3 className="text-[9px] font-black tracking-[0.5em] text-primary/60 uppercase">Risk_Entropy_Trend</h3>
      </div>

      <ChartWithExplanation title="" explanation={RISK_TREND_EXPLANATION}>
        <ResponsiveContainer width="100%" height={260}>
          {type === 'area' ? (
            <AreaChart data={chartData} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <defs>
                <linearGradient id="matrixRiskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FF41" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00FF41" stopOpacity={0} />
                </linearGradient>
                <filter id="matrixNeonStroke" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.grid.stroke} />
              <XAxis dataKey="name" {...chartStyles.axis} tickLine={false} axisLine={false} />
              <YAxis {...chartStyles.axis} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip {...chartStyles.tooltip} cursor={{ stroke: 'rgba(0, 255, 65, 0.2)', strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#00FF41"
                fill="url(#matrixRiskGradient)"
                strokeWidth={2}
                filter="url(#matrixNeonStroke)"
                isAnimationActive
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.grid.stroke} />
              <XAxis dataKey="name" {...chartStyles.axis} tickLine={false} axisLine={false} />
              <YAxis {...chartStyles.axis} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip {...chartStyles.tooltip} cursor={{ stroke: 'rgba(0, 255, 65, 0.1)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#00FF41"
                strokeWidth={2}
                dot={{ fill: '#00FF41', strokeWidth: 0, r: 2 }}
                activeDot={{ r: 5, fill: '#00FF41', stroke: '#fff', strokeWidth: 1 }}
              />
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
    { name: 'Allow', value: stats.allow ?? 0, fill: '#00FF41' },
    { name: 'MFA', value: stats.mfa ?? 0, fill: '#7B61FF' },
    { name: 'Block', value: stats.block ?? 0, fill: '#FF003C' },
  ];

  const [hovered, setHovered] = useState(false);

  return (
    <div className={`hyper-card p-10 bg-black/80 border border-primary/20 shadow-2xl transition-all duration-500 hover:border-primary/40 relative overflow-hidden group`}>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
        <h3 className="text-[10px] font-black tracking-[0.5em] text-primary/60 uppercase">Protocol_Audit_Metrics</h3>
      </div>

      <ChartWithExplanation title="" explanation={DECISION_EXPLANATION}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <defs>
              <filter id="matrixDecisionGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 255, 65, 0.05)" />
            <XAxis dataKey="name" stroke="rgba(0, 255, 65, 0.3)" fontSize={9} fontWeight="900" tickLine={false} axisLine={false} fontFamily="monospace" />
            <YAxis stroke="rgba(0, 255, 65, 0.3)" fontSize={9} fontWeight="900" tickLine={false} axisLine={false} fontFamily="monospace" />
            <Tooltip
              cursor={{ fill: 'rgba(0, 255, 65, 0.05)' }}
              contentStyle={chartStyles.tooltip.contentStyle}
              labelStyle={chartStyles.tooltip.labelStyle}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1000} animationEasing="ease-out" filter="url(#matrixDecisionGlow)">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

export default RiskChart;
