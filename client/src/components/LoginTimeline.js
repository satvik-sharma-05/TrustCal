import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Search, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_ROWS = 5;
const ROWS_PER_PAGE = 10;

const LoginTimeline = ({ events = [], onEventClick, selectedEvent, searchQuery, onSearch, decisionFilter, onDecisionFilter, pagination, onLoadMore }) => {
  const [sortBy, setSortBy] = useState('time');
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    if (searchQuery !== undefined) setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setLocalSearch(v);
    onSearch?.(v);
  };

  const getInitials = (event) => {
    if (event.displayName) return event.displayName.slice(0, 2).toUpperCase();
    const uid = String(event.userId || '');
    const parts = uid.replace(/[^a-f0-9]/gi, '').slice(0, 4);
    return parts ? parts[0].toUpperCase() : '?';
  };

  const getDisplayName = (event) => {
    if (event.displayName) return event.displayName;
    const uid = String(event.userId || '—');
    return uid.length > 12 ? `${uid.slice(0, 12)}…` : uid;
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'allow':
        return <span className="text-zinc-300 text-sm font-medium">Allow</span>;
      case 'mfa':
        return <span className="text-zinc-400 text-sm font-medium">MFA</span>;
      case 'block':
        return <span className="text-zinc-200 text-sm font-medium">Block</span>;
      default:
        return <span className="text-zinc-500 text-sm">—</span>;
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSelected = (event) =>
    selectedEvent && (event._id === selectedEvent._id || event.userId === selectedEvent.userId);

  const matchesSearch = (event, q) => {
    if (!q || !q.trim()) return true;
    const s = String(q).trim().toLowerCase();
    const fields = [
      event.displayName,
      event.email,
      event.region,
      event.deviceType,
      event.userId,
    ].filter(Boolean).map((f) => String(f).toLowerCase());
    return fields.some((f) => f.includes(s));
  };

  const filteredBySearch = localSearch ? events.filter((e) => matchesSearch(e, localSearch)) : events;

  const sortedEvents = [...filteredBySearch].sort((a, b) => {
    const ta = new Date(a.timestamp || a.createdAt || 0).getTime();
    const tb = new Date(b.timestamp || b.createdAt || 0).getTime();
    return sortBy === 'time' ? tb - ta : (b.riskScore ?? 0) - (a.riskScore ?? 0);
  });

  const visibleCount = expanded ? sortedEvents.length : Math.min(INITIAL_ROWS, sortedEvents.length);
  const visibleEvents = sortedEvents.slice(0, visibleCount);
  const hasMore = sortedEvents.length > visibleCount;

  return (
    <div className="hyper-card overflow-hidden animate-fade-in">
      <div className="px-4 sm:px-6 py-4 border-b border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearch}
                placeholder="Search user, email, region..."
                className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg recessed-input text-slate-200 text-sm placeholder-slate-500 focus:border-purple"
              />
            </div>
            <select
              value={decisionFilter || ''}
              onChange={(e) => onDecisionFilter?.(e.target.value || '')}
              className="px-3 py-2 rounded-lg recessed-input text-slate-300 text-sm bg-navy-mid/50"
            >
              <option value="">All decisions</option>
              <option value="allow">Allow</option>
              <option value="mfa">MFA</option>
              <option value="block">Block</option>
            </select>
            <button
              onClick={() => setSortBy(sortBy === 'time' ? 'risk' : 'time')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-pill text-slate-400 hover:text-white text-sm transition-all"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortBy === 'time' ? 'Time' : 'Risk'}
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 sm:px-6 label-upper">User</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper">Time</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper">Region</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper hidden md:table-cell">Device</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper">Risk</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper hidden sm:table-cell">Anomaly</th>
              <th className="text-left py-3 px-4 sm:px-6 label-upper">Decision</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  No events yet. Use &quot;Evaluate Login&quot; to add one.
                </td>
              </tr>
            ) : (
              visibleEvents.map((event, index) => {
                const risk = event.riskScore ?? 0;
                const selected = isSelected(event);
                const anomaly = event.anomalyScore != null ? (event.anomalyScore * 100).toFixed(1) : '—';
                return (
                  <tr
                    key={event._id || index}
                    onClick={() => onEventClick?.(event)}
                    className={`border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                      selected ? 'bg-purple/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple/30 to-pink/20 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {getInitials(event)}
                        </div>
                        <div>
                          <div className="font-medium text-white truncate max-w-[100px] sm:max-w-[140px]">
                            {getDisplayName(event)}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[100px] sm:max-w-[140px]">
                            {event.email || event.userType || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-6">
                      <div className="text-slate-300 font-mono text-xs">{formatTime(event.timestamp || event.createdAt)}</div>
                      <div className="text-[10px] text-slate-500 hidden lg:block">{formatDate(event.timestamp || event.createdAt)}</div>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-slate-400">{event.region || '—'}</td>
                    <td className="py-3 px-4 sm:px-6 text-slate-400 text-xs hidden md:table-cell">{event.deviceType || '—'}</td>
                    <td className="py-3 px-4 sm:px-6">
                      <span className="font-semibold text-zinc-300">
                        {risk}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-slate-400 text-xs hidden sm:table-cell">{anomaly}%</td>
                    <td className="py-3 px-4 sm:px-6">{getDecisionBadge(event.decision)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="px-4 sm:px-6 py-3 border-t border-white/5">
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg glass-pill text-slate-400 hover:text-white text-sm transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            Show {sortedEvents.length - visibleCount} more
          </button>
        </div>
      )}
      {expanded && sortedEvents.length > INITIAL_ROWS && (
        <div className="px-4 sm:px-6 py-3 border-t border-white/5">
          <button
            onClick={() => setExpanded(false)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg glass-pill text-slate-400 hover:text-white text-sm"
          >
            <ChevronUp className="w-4 h-4" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginTimeline;
