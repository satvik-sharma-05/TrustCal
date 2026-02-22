import { motion } from 'framer-motion';
import { Activity, ChevronRight, Zap, Target } from 'lucide-react';

const FeatureImportance = ({ features }) => {
  if (!features?.length) {
    return (
      <div className="hyper-card p-10 bg-black/80 border border-primary/20 h-full flex flex-col justify-center items-center group relative overflow-hidden">
        <Target className="w-10 h-10 text-primary opacity-20 mb-8 animate-pulse" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/40 text-center">
          Awaiting_Intelligence_Breakdown
        </p>
      </div>
    );
  }

  const maxAbs = Math.max(...features.map((f) => Math.abs(f.contribution ?? f.deviationScore ?? 0)), 0.001);

  return (
    <div className="hyper-card p-10 bg-black/80 border border-primary/20 h-full relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />

      <header className="mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-black border border-primary/20 rounded-sm">
            <Zap className="w-4 h-4 text-primary animate-flicker" />
          </div>
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary/80 uppercase">Primary_Vectors</h3>
            <p className="text-[8px] font-black text-primary/30 uppercase tracking-[0.3em] mt-1.5">Saliency_Inference_Core</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {features.slice(0, 5).map((f, i) => {
          const contrib = f.contribution ?? f.deviationScore ?? 0;
          const width = Math.min(100, (Math.abs(contrib) / maxAbs) * 100);

          return (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative group/bar border-b border-primary/5 pb-4 last:border-0"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black tracking-[0.1em] text-white/50 group-hover/bar:text-primary transition-colors uppercase">
                  {f.name}
                </span>
                <span className="text-[10px] font-mono font-black text-primary tabular-nums">
                  {contrib > 0 ? '+' : ''}{contrib.toFixed(3)}
                </span>
              </div>

              <div className="h-1 w-full bg-primary/10 rounded-sm overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 1.5, ease: "circOut", delay: i * 0.1 }}
                  className={`h-full bg-primary shadow-[0_0_10px_var(--primary)]`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-line-move" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 p-5 bg-primary/5 border border-primary/10 rounded-sm relative overflow-hidden group/tip">
        <Activity className="w-3.5 h-3.5 text-primary/40 animate-pulse mb-3" />
        <span className="text-[9px] font-black text-primary/30 leading-[1.6] uppercase tracking-[0.2em] block">
          Neural_Net correlation engine identifying perturbations defining identity entropy vectors.
        </span>
      </div>
    </div>
  );
};

export default FeatureImportance;
