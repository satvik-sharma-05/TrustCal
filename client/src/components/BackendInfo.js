import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

const BackendInfo = ({ mlStatus }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="hyper-card overflow-hidden bg-black/80 border border-primary/20 shadow-2xl relative group">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left hover:bg-primary/[0.03] transition-all relative z-10"
      >
        <div className="flex items-center gap-5">
          <div className="p-3 bg-black border border-primary/20 rounded-sm group-hover:border-primary/40 transition-colors">
            <Info className="w-5 h-5 text-primary animate-flicker" />
          </div>
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase opacity-80">Logic_Protocols</h3>
            <p className="text-[8px] text-primary/30 uppercase font-black tracking-[0.3em] mt-2">Isolation_Forest • 13_Vectors</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-primary/40 transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-8 pb-8 pt-0 border-t border-primary/10 bg-primary/[0.02] relative z-10">
          <div className="mt-8 space-y-6 text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] leading-relaxed font-mono">
            <div className="flex gap-4">
              <span className="text-primary opacity-40">01</span>
              <p><strong className="text-primary italic">Neural_Training:</strong> Model assumes zero-knowledge baseline, identifying entropy in identity signals without biased rules.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-primary opacity-40">02</span>
              <p><strong className="text-primary italic">Vector_Space:</strong> Correlates 13 vectors including temporal novelty, geo-jitter, and structural device entropy.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-primary opacity-40">03</span>
              <p><strong className="text-primary italic">Calibration:</strong> Raw outlier scores are mapped into a statistical percentile distribution for absolute risk accuracy.</p>
            </div>
            {mlStatus?.modelVersion && (
              <div className="pt-6 border-t border-primary/5 flex items-center justify-between opacity-30 text-[9px]">
                <span>Kernel_v{String(mlStatus.modelVersion).slice(0, 10)}</span>
                <span>Telemetry_Persistent</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendInfo;
