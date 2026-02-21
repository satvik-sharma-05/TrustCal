import React from 'react';
import { MapPin, Smartphone, Clock, Activity } from 'lucide-react';

const UserProfile = ({ profile, events = [] }) => {
  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-slate-500 text-sm">Select an event to view user profile.</p>
      </div>
    );
  }

  const avgRisk = events.length > 0 ? events.reduce((s, e) => s + (e.riskScore ?? 0), 0) / events.length : 0;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">User profile</h3>
      <div className="space-y-4 text-sm">
        <div>
          <div className="text-xs text-slate-500 uppercase mb-0.5">User ID</div>
          <div className="font-mono text-slate-800">{profile.userId}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase mb-0.5">Avg login hour</div>
            <div className="font-semibold text-slate-800">{Math.round(profile.avgLoginHour ?? 12)}:00</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase mb-0.5">Total logins</div>
            <div className="font-semibold text-slate-800">{profile.totalLogins ?? 0}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase mb-1">Known regions ({profile.knownRegions?.length ?? 0})</div>
          <div className="flex flex-wrap gap-1">
            {(profile.knownRegions ?? []).slice(0, 5).map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{r}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase mb-1">Known devices ({profile.knownDevices?.length ?? 0})</div>
          <div className="flex flex-wrap gap-1">
            {(profile.knownDevices ?? []).slice(0, 5).map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 text-xs">{String(d).slice(0, 8)}…</span>
            ))}
          </div>
        </div>
        {events.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 uppercase mb-0.5">Average risk</div>
            <div className="text-lg font-semibold text-slate-900">{Math.round(avgRisk)}/100</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
