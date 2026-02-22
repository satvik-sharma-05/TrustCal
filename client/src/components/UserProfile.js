import React from 'react';

const UserProfile = ({ profile, events = [], selectedEvent }) => {
  if (!profile) {
    return (
      <div className="hyper-card p-10 bg-black/80 border border-primary/20 animate-fade-in group relative overflow-hidden h-full flex flex-col justify-center items-center text-center">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />
        <h3 className="text-[9px] font-black tracking-[0.5em] text-primary/40 uppercase mb-8 absolute top-8 left-8">Identity_Context</h3>
        <p className="text-primary/20 text-[10px] uppercase font-black tracking-[0.4em] animate-pulse">Select telemetric signal to decode...</p>
      </div>
    );
  }

  const avgRisk = events.length > 0
    ? events.reduce((s, e) => s + (e.riskScore ?? 0), 0) / events.length
    : 0;

  return (
    <div className="hyper-card p-10 bg-black/80 border border-primary/20 animate-fade-in group relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px]" />
      <h3 className="text-[10px] font-black tracking-[0.4em] text-primary/80 uppercase mb-10 relative z-10">Neural_Profile</h3>

      <div className="space-y-10 text-sm relative z-10">
        <div>
          <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-3">Signature_Entity</div>
          <div className="font-mono text-primary text-[11px] truncate bg-black border border-primary/20 p-4 rounded-sm">
            {profile.userId}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-sm">
            <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mb-2">Peak_Freq</div>
            <div className="font-mono font-black text-primary text-lg tracking-tight">{Math.round(profile.avgLoginHour ?? 12)}:00_UTC</div>
          </div>
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-sm">
            <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mb-2">Log_Count</div>
            <div className="font-mono font-black text-primary text-lg">{profile.totalLogins ?? 0}</div>
          </div>
        </div>

        <div>
          <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Geo_Cluster_Mapping</div>
          <div className="flex flex-wrap gap-3">
            {(profile.knownRegions ?? []).slice(0, 5).map((r, i) => (
              <span key={i} className="px-3 py-1.5 bg-black border border-primary/30 text-primary text-[9px] font-mono font-black uppercase tracking-widest group-hover:bg-primary/5 transition-colors">
                {r}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Device_Signatures</div>
          <div className="flex flex-wrap gap-2">
            {(profile.knownDevices ?? []).slice(0, 5).map((d, i) => (
              <span key={i} className="px-3 py-1.5 bg-black border border-primary/10 font-mono text-primary/40 text-[8px] uppercase">
                {String(d).slice(0, 16)}...
              </span>
            ))}
          </div>
        </div>

        {events.length > 0 && (
          <div className="pt-8 border-t border-primary/10">
            <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-3">Identity_Entropy_Index</div>
            <div
              className={`text-5xl font-mono font-black tracking-tighter ${avgRisk > 70 ? 'text-danger' : avgRisk > 30 ? 'text-[#FFCC00]' : 'text-primary'
                }`}
            >
              {Math.round(avgRisk)}
              <span className="text-xs ml-2 opacity-30">/100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
