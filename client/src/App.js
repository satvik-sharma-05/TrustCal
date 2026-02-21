import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Shield, WifiOff, Menu } from 'lucide-react';
import SpaceBackground from './components/SpaceBackground';
import CustomCursor from './components/CustomCursor';
import ScrollReveal from './components/ScrollReveal';
import StatsCard from './components/StatsCard';
import LoginTimeline from './components/LoginTimeline';
import RiskChart, { DecisionChart } from './components/RiskChart';
import UserProfile from './components/UserProfile';
import CustomLoginForm from './components/CustomLoginForm';
import FeatureImportance from './components/FeatureImportance';
import AnomalyDistribution from './components/AnomalyDistribution';
import ResultsGauge from './components/ResultsGauge';
import BackendInfo from './components/BackendInfo';
import { getStats, getEvents, getUserProfile, getMLStatus } from './services/api';

function App() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mlStatus, setMlStatus] = useState({ modelLoaded: false });
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewEval, setShowNewEval] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [eventDecision, setEventDecision] = useState('');
  const searchDebounceRef = useRef(null);
  const socketRef = useRef(null);
  const filtersRef = useRef({ search: '', decision: '' });
  filtersRef.current = { search: eventSearch, decision: eventDecision };

  const fetchData = async () => {
    try {
      const { search, decision } = filtersRef.current;
      const [statsData, eventsData] = await Promise.all([
        getStats(),
        getEvents(1, 50, search, decision),
      ]);
      setStats(statsData);
      setEvents(eventsData.events || []);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSearch = (q) => {
    setEventSearch(q);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const { decision } = filtersRef.current;
      setLoading(true);
      getEvents(1, 50, q, decision).then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, 300);
  };

  const handleEventDecisionFilter = (d) => {
    setEventDecision(d);
    setLoading(true);
    const { search } = filtersRef.current;
    getEvents(1, 50, search, d).then((data) => {
      setEvents(data.events || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    getMLStatus().then(setMlStatus).catch(() => setMlStatus({ modelLoaded: false }));

    const interval = setInterval(() => fetchData(), 15000);
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    socket.on('connect', () => setBackendOnline(true));
    socket.on('connect_error', () => setBackendOnline(false));
    socket.on('new_login', (data) => {
      setEvents((prev) => [data, ...prev].slice(0, 50));
      fetchData();
    });
    socketRef.current = socket;
    return () => {
      clearInterval(interval);
      socket.off('new_login');
      socket.disconnect();
    };
  }, []);

  const handleEvaluate = () => {
    fetchData();
    setShowNewEval(false);
  };
  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    if (event.userId && backendOnline) {
      try {
        const profileData = await getUserProfile(event.userId);
        setUserProfile(profileData);
      } catch {
        setUserProfile(null);
      }
    }
  };

  const latestEvent = events[0];
  const currentRiskScore = latestEvent?.riskScore ?? 0;
  const currentDecision = latestEvent?.decision ?? 'allow';

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-base bg-starry">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full border-2 border-purple/40 border-t-purple animate-spin mx-auto mb-4" />
          <div className="text-slate-400 font-medium">Loading TrustCal ML...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-base bg-starry relative">
      <SpaceBackground />
      <CustomCursor />
      {!backendOnline && (
        <div className="relative z-20 glass-secondary border-amber/30 py-2 px-4 flex items-center justify-center gap-2 text-amber text-sm animate-fade-in">
          <WifiOff className="w-4 h-4" />
          Backend offline. Start the server with <code className="font-mono text-xs bg-navy-mid px-1.5 py-0.5 rounded">npm run server</code>
        </div>
      )}

      {/* Header - responsive */}
      <header className="relative z-20 glass-secondary border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-emerald/20 border border-emerald/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Shield className="w-5 h-5 text-emerald" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight">TrustCal ML</span>
            </div>
            <nav className={`hidden md:flex items-center gap-1`}>
              <a href="#analytics" className="px-3 sm:px-4 py-2 rounded-full glass-pill text-white text-sm font-medium">
                Analytics
              </a>
              <a href="#events" className="px-3 sm:px-4 py-2 rounded-full text-slate-400 hover:text-white text-sm transition-colors">
                Events
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {mlStatus.modelLoaded && (
              <span className="hidden sm:inline text-xs text-emerald font-mono px-2 py-1 rounded bg-emerald/10">
                Model ready
              </span>
            )}
            <button
              onClick={() => setShowNewEval(true)}
              className="px-4 py-2 rounded-xl glass-pill bg-purple/25 text-white font-medium text-sm hover:bg-purple/35 transition-all hover:scale-105 active:scale-95 btn-emboss"
            >
              Evaluate Login
            </button>
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/5 flex flex-col gap-1 animate-fade-in">
            <a href="#analytics" onClick={() => setNavOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5">Analytics</a>
            <a href="#events" onClick={() => setNavOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5">Events</a>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 1. Stats cards - top */}
        <section id="analytics" className="mb-6 sm:mb-8 scroll-mt-24">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 stagger">
            <StatsCard title="Total logins" value={stats?.totalLogins ?? 0} icon="total" color="cyan" />
            <StatsCard title="High risk" value={stats?.highRiskCount ?? 0} icon="highRisk" color="crimson" />
            <StatsCard title="MFA required" value={stats?.decisions?.mfa ?? 0} icon="mfa" color="amber" />
            <StatsCard title="Blocked" value={stats?.decisions?.block ?? 0} icon="block" color="crimson" />
            <StatsCard title="Avg risk" value={stats?.avgRisk?.toFixed(1) ?? '0.0'} icon="avgRisk" color="purple" />
            <StatsCard title="Confidence" value={mlStatus.modelLoaded ? '85%' : '—'} icon="confidence" color="emerald" />
            </div>
          </ScrollReveal>
        </section>

        {/* 2. Analytics charts + AI panel + gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <RiskChart data={stats?.recentEvents ?? []} type="area" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <AnomalyDistribution events={events} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-6 sm:p-8 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple/30 to-pink/20 border border-purple/50 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-breathe">
                <span className="text-xl sm:text-2xl font-bold text-white">ML</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Identity Risk Assistant</h3>
              <p className="text-slate-400 text-xs sm:text-sm text-center mb-4 sm:mb-6 max-w-xs">
                Isolation Forest anomaly detection for adaptive access.
              </p>
              <button
                onClick={() => setShowNewEval(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl glass-pill bg-purple/25 text-white font-medium hover:bg-purple/35 transition-all hover:scale-105 active:scale-95 btn-emboss shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              >
                Evaluate Login
              </button>
            </div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <ResultsGauge riskScore={currentRiskScore} decision={currentDecision} stats={stats} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <DecisionChart stats={stats?.decisions ?? {}} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <BackendInfo mlStatus={mlStatus} />
          </div>
        </div>

        {/* 3. Feature contribution + User profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {selectedEvent?.explanation?.topContributingFeatures?.length > 0 || selectedEvent?.topFeatures?.length > 0 ? (
            <FeatureImportance
              features={selectedEvent.explanation?.topContributingFeatures || selectedEvent.topFeatures || []}
            />
          ) : (
            <div className="glass-card p-5 sm:p-6 animate-fade-in">
              <h3 className="text-base font-semibold text-slate-200 mb-2">Anomaly Drivers</h3>
              <p className="text-sm text-slate-500">Select an event below to view top contributing features.</p>
            </div>
          )}
          <UserProfile profile={userProfile?.profile} events={userProfile?.recentEvents ?? []} selectedEvent={selectedEvent} />
        </div>

        {/* 4. Recent Activity - at bottom */}
        <section id="events" className="mb-8 scroll-mt-24">
          <LoginTimeline
            events={events}
            onEventClick={handleEventClick}
            selectedEvent={selectedEvent}
            searchQuery={eventSearch}
            onSearch={handleEventSearch}
            decisionFilter={eventDecision}
            onDecisionFilter={handleEventDecisionFilter}
          />
        </section>
      </main>

      {showNewEval && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowNewEval(false)}
        >
          <div
            className="glass-card p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-white">New Login Evaluation</h2>
              <button onClick={() => setShowNewEval(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <CustomLoginForm onEvaluate={handleEvaluate} backendOnline={backendOnline} embedded />
          </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-white/5 glass-secondary py-4 mt-8 sm:mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 text-center text-slate-500 text-xs sm:text-sm">
          TrustCal ML — Isolation Forest • 13 features • Privacy-preserving simulated logs
        </div>
      </footer>
    </div>
  );
}

export default App;
