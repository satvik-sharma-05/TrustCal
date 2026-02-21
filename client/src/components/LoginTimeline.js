import React from 'react';

const LoginTimeline = ({ events = [], onEventClick }) => {
  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'allow': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Allow</span>;
      case 'mfa': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">MFA</span>;
      case 'block': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-primary">Block</span>;
      default: return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Login event timeline</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">User</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Time</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Region</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Risk</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Decision</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No events yet</td></tr>
            ) : (
              events.map((event, index) => (
                <tr
                  key={event._id || index}
                  onClick={() => onEventClick?.(event)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-700">{String(event.userId || '—').slice(0, 12)}…</td>
                  <td className="py-3 px-4 text-slate-600">{formatTime(event.timestamp || event.createdAt)}</td>
                  <td className="py-3 px-4 text-slate-600">{event.region || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{event.riskScore ?? '—'}</td>
                  <td className="py-3 px-4">{getDecisionBadge(event.decision)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginTimeline;
