import React from 'react';

const UserProfile = ({ profile, events = [], selectedEvent }) => {
  if (!profile) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
        <h3 className="text-base font-semibold text-slate-200 mb-2">User Context</h3>
        <p className="text-slate-500 text-sm">Select an event in the timeline to view user profile.</p>
      </div>
    );
  }

  const avgRisk = events.length > 0
    ? events.reduce((s, e) => s + (e.riskScore ?? 0), 0) / events.length
    : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
      <h3 className="text-base font-semibold text-slate-200 mb-4">User Profile</h3>
      <div className="space-y-4 text-sm">
        <div>
          <div className="label-upper mb-0.5">User ID</div>
          <div className="font-mono text-slate-300 text-xs truncate">{profile.userId}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label-upper mb-0.5">Avg login hour</div>
            <div className="font-medium text-slate-200">{Math.round(profile.avgLoginHour ?? 12)}:00</div>
          </div>
          <div>
            <div className="label-upper mb-0.5">Total logins</div>
            <div className="font-medium text-slate-200">{profile.totalLogins ?? 0}</div>
          </div>
        </div>
        <div>
          <div className="label-upper mb-1">Known regions ({profile.knownRegions?.length ?? 0})</div>
          <div className="flex flex-wrap gap-1">
            {(profile.knownRegions ?? []).slice(0, 5).map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded recessed-input text-slate-400 text-xs"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="label-upper mb-1">Known devices ({profile.knownDevices?.length ?? 0})</div>
          <div className="flex flex-wrap gap-1">
            {(profile.knownDevices ?? []).slice(0, 5).map((d, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded recessed-input font-mono text-slate-400 text-xs"
              >
                {String(d).slice(0, 8)}…
              </span>
            ))}
          </div>
        </div>
        {events.length > 0 && (
          <div>
            <div className="label-upper mb-0.5">Average risk</div>
            <div
              className={`text-lg font-light ${
                avgRisk > 70 ? 'text-crimson' : avgRisk > 30 ? 'text-amber' : 'text-emerald'
              }`}
            >
              {Math.round(avgRisk)}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
