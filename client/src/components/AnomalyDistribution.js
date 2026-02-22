import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWithExplanation from './ChartWithExplanation';

const ANOMALY_EXPLANATION = 'Distribution of anomaly scores across events. Peaks show common risk levels. Low (0–20%) = normal, high (80–100%) = highly anomalous.';

const AnomalyDistribution = ({ events = [] }) => {
  const [hovered, setHovered] = useState(false);
  if (!events?.length) {
    return (
      <div className="hyper-card p-8 bg-black/80 border border-primary/20 shadow-2xl relative overflow-hidden group min-h-[300px] flex flex-col justify-center items-center">
        <h3 className="text-[9px] font-black tracking-[0.5em] text-primary/40 uppercase mb-8 absolute top-8 left-8">Anomaly_Distribution</h3>
        <div className="text-primary/20 text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">Awaiting signals...</div>
      </div>
    );
  }

  const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const histogram = bins.slice(0, -1).map((bin, i) => {
    const count = events.filter((e) => {
      const s = e.anomalyScore ?? (e.riskScore / 100);
      return s >= bin && s < bins[i + 1];
    }).length;
    return { range: `${(bin * 100).toFixed(0)}%`, count };
  });

  const barColors = ['#00FF41', '#00CC33', '#00F5FF', '#88FFAA', '#FF0033'];

  return (
    <div className={`hyper-card p-10 bg-black/80 border border-primary/20 shadow-2xl transition-all duration-500 hover:border-primary/40 relative overflow-hidden group`}>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
        <h3 className="text-[10px] font-black tracking-[0.5em] text-primary/60 uppercase">Anomaly_Spectrogram</h3>
      </div>

      <ChartWithExplanation title="" explanation={ANOMALY_EXPLANATION}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={histogram} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <defs>
              <filter id="matrixBarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(0, 255, 65, 0.05)" />
            <XAxis dataKey="range" stroke="rgba(0, 255, 65, 0.3)" fontSize={9} fontWeight="900" tickLine={false} axisLine={false} fontFamily="monospace" />
            <YAxis stroke="rgba(0, 255, 65, 0.3)" fontSize={9} fontWeight="900" tickLine={false} axisLine={false} fontFamily="monospace" />
            <Tooltip
              cursor={{ fill: 'rgba(0, 255, 65, 0.05)' }}
              contentStyle={{
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 255, 65, 0.2)',
                borderRadius: 2,
                padding: '12px 16px',
                fontSize: 10,
                fontWeight: 800,
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)',
              }}
              labelStyle={{ fontSize: 10, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '0.2em', fontFamily: 'monospace' }}
            />
            <Bar dataKey="count" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1000} animationEasing="ease-out" filter="url(#matrixBarGlow)">
              {histogram.map((_, i) => (
                <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWithExplanation>
    </div>
  );
};

export default AnomalyDistribution;
