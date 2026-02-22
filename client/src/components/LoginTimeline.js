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
    const baseClass = "px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300";
    switch (decision) {
      case 'allow':
        return <span className={`${baseClass} text-primary border-primary/40 bg-primary/5 shadow-[0_0_10px_rgba(0,255,65,0.1)]`}>ACCESS_GRANTED</span>;
      case 'mfa':
        return <span className={`${baseClass} text-accent border-accent/40 bg-accent/5 shadow-[0_0_10px_rgba(0,245,255,0.1)] animate-pulse`}>MFA_CHALLENGE</span>;
      case 'block':
        return <span className={`${baseClass} text-danger border-danger/40 bg-danger/5 shadow-[0_0_10px_rgba(255,0,51,0.1)] animate-flicker`}>ISOLATION_ENFORCED</span>;
      default:
        return <span className="text-primary/20">—</span>;
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
    <div className="hyper-card overflow-hidden bg-black/80 backdrop-blur-md border border-primary/20 shadow-2xl relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(0,255,65,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="px-8 py-6 border-b border-primary/10 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary/60 uppercase">Intelligence_Feed</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30 group-focus-within:text-primary transition-all" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearch}
                placeholder="QUERY_IDENTITY..."
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-primary/10 rounded-sm text-primary text-[11px] font-mono placeholder-primary/20 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all font-black"
              />
            </div>
            <select
              value={decisionFilter || ''}
              onChange={(e) => onDecisionFilter?.(e.target.value || '')}
              className="px-4 py-2.5 bg-black border border-primary/10 rounded-sm text-primary/60 font-mono text-[10px] font-black focus:outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer uppercase tracking-widest"
            >
              <option value="">ALL_PROTOCOLS</option>
              <option value="allow" className="bg-black">ALLOW</option>
              <option value="mfa" className="bg-black">MFA</option>
              <option value="block" className="bg-black">BLOCK</option>
            </select>
            <button
              onClick={() => setSortBy(sortBy === 'time' ? 'risk' : 'time')}
              className="flex items-center gap-3 px-6 py-2.5 bg-black border border-primary/10 rounded-sm text-primary/40 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-primary/30"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'time' ? 'TIME_PRIORITY' : 'RISK_PRIORITY'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-xs min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/5">
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px]">Identity_Entity</th>
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px]">Timestamp</th>
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px]">Geo_Zone</th>
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px] hidden md:table-cell">Device_Mask</th>
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px]">Anom_Ratio</th>
              <th className="text-left py-5 px-8 font-black tracking-[0.2em] text-primary/40 uppercase text-[9px]">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {visibleEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-24 text-center text-primary/20 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">
                  No telemetric signals detected
                </td>
              </tr>
            ) : (
              visibleEvents.map((event, index) => {
                const risk = event.riskScore ?? 0;
                const selected = isSelected(event);
                return (
                  <tr
                    key={event._id || index}
                    onClick={() => onEventClick?.(event)}
                    className={`group cursor-pointer transition-all duration-300 border-l-2 ${selected ? 'bg-primary/10 border-primary' : 'hover:bg-primary/5 border-transparent'} relative`}
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-sm bg-black border border-primary/30 flex items-center justify-center text-primary font-mono font-black text-xs shadow-inner shadow-primary/5 group-hover:border-primary transition-all">
                          {getInitials(event)}
                        </div>
                        <div>
                          <div className="font-black text-white font-mono truncate max-w-[140px] transition-colors group-hover:text-primary">
                            {getDisplayName(event)}
                          </div>
                          <div className="text-[10px] text-primary/40 font-black tracking-widest truncate max-w-[140px] uppercase mt-0.5">
                            {event.userType || 'GUEST_ENTITY'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-white font-mono text-[11px] font-black tracking-widest">{formatTime(event.timestamp || event.createdAt)}</div>
                    </td>
                    <td className="py-6 px-8 text-primary/60 font-black font-mono tracking-widest">{event.region || 'UNKNOWN'}</td>
                    <td className="py-6 px-8 text-primary/30 font-mono text-[10px] hidden md:table-cell uppercase tracking-tighter">{event.deviceType || '—'}</td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 flex-1 min-w-[60px]">
                          <div className="h-0.5 bg-primary/10 w-full rounded-full overflow-hidden">
                            <div className="h-full bg-primary shadow-[0_0_8px_rgba(0,255,65,0.6)]" style={{ width: `${risk}%` }} />
                          </div>
                        </div>
                        <span className="font-mono font-black text-white text-[13px] drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                          {risk}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-8">{getDecisionBadge(event.decision)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 border-t border-primary/10 bg-black flex justify-center items-center gap-6">
        {hasMore && (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 max-w-sm flex items-center justify-center gap-4 py-3 bg-black border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/60 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary/5"
          >
            <ChevronDown className="w-4 h-4" />
            Synchronize_Entity_Stream ({sortedEvents.length - visibleCount})
          </button>
        )}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="flex-1 max-w-sm flex items-center justify-center gap-4 py-3 bg-black border border-primary/20 text-primary/60 hover:text-primary hover:border-primary/60 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary/5"
          >
            <ChevronUp className="w-4 h-4" />
            Terminate_Telemetry_View
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginTimeline;
