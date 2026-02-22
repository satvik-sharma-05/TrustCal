import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Shield, WifiOff, Menu, Activity, Cpu, Clock } from 'lucide-react';
import { getStats, getEvents, getUserProfile, getMLStatus } from './services/api';

import MatrixRain from './components/MatrixRain';
import StatsCard from './components/StatsCard';
import RiskChart, { DecisionChart } from './components/RiskChart';
import AnomalyDistribution from './components/AnomalyDistribution';
import ResultsGauge from './components/ResultsGauge';
import BackendInfo from './components/BackendInfo';
import FeatureImportance from './components/FeatureImportance';
import UserProfile from './components/UserProfile';
import LoginTimeline from './components/LoginTimeline';
import CustomLoginForm from './components/CustomLoginForm';
import TubesLanding from './components/TubesLanding';

// Helper for scroll animations
const ScrollReveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    {children}
  </motion.div>
);

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
  const [hasEntered, setHasEntered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
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

  if (loading && !stats && hasEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black matrix-theme">
        <MatrixRain />
        <div className="text-center animate-fade-in relative z-10">
          <div className="w-16 h-16 border-t-2 border-primary animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(0,255,65,0.4)]" />
          <div className="text-primary font-mono uppercase tracking-[0.3em] text-xs animate-flicker">Decoding Digital Identity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative matrix-theme transition-colors duration-500 bg-black`}>
      <MatrixRain />
      <div className="scanline-overlay" />

      {/* Entering screen */}
      {!hasEntered && (
        <TubesLanding onEnter={() => setHasEntered(true)} />
      )}

      {/* Site content */}
      <div
        className={`relative z-10 min-h-screen transition-opacity duration-[1000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${hasEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {!backendOnline && (
          <div className="relative z-20 glass-secondary border-amber/30 py-2 px-4 flex items-center justify-center gap-2 text-amber text-sm animate-fade-in">
            <WifiOff className="w-4 h-4" />
            Backend offline. Start the server with <code className="font-mono text-xs bg-navy-mid px-1.5 py-0.5 rounded">npm run server</code>
          </div>
        )}

        {/* Header - Matrix Command Center */}
        <header className="relative z-30 backdrop-blur-sm bg-black/80 border-b border-primary/10 px-4 sm:px-6 py-4 sticky top-0 shadow-lg shadow-primary/5 font-mono transition-all duration-300">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <motion.div
              className="flex items-center gap-4 group cursor-pointer"
              whileHover={{ scale: 1.01 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-black border border-primary animate-flicker">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -inset-1 bg-primary/20 blur-md rounded-sm animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-primary glitch-hover">
                  PULSEGUARD AI
                </span>
                <span className="text-[8px] font-bold text-primary/40 uppercase tracking-[0.4em]">
                  Adaptive Access Intelligence
                </span>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary/60">System:</span>
                <span className="text-white">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-primary/40" />
                <span className="text-primary/60">Kernel:</span>
                <span className="text-white">v{String(mlStatus.modelVersion || '4.0').slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary/40" />
                <span className="text-white font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 255, 65, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewEval(true)}
                className="px-6 py-2.5 rounded-sm bg-black border border-primary text-primary font-black text-[10px] tracking-widest uppercase hover:bg-primary/10 transition-all duration-300"
              >
                Execute Audit
              </motion.button>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="md:hidden p-2 rounded-sm text-primary/60 hover:text-primary transition-colors duration-300"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-primary/10 flex flex-col gap-4 font-black text-xs tracking-[0.2em] uppercase text-primary/60"
            >
              <a href="#analytics" onClick={() => setNavOpen(false)} className="hover:text-primary transition-all px-4">Analytics</a>
              <a href="#events" onClick={() => setNavOpen(false)} className="hover:text-primary transition-all px-4">Intelligence Feed</a>
            </motion.div>
          )}
        </header>

        {/* Dashboard panel - semi-transparent glass container */}
        <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <section id="analytics" className="mb-8 sm:mb-10 scroll-mt-24">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-4xl font-black tracking-tighter text-white">COMMAND_CENTER</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 stagger">
                <StatsCard title="Total logins" value={stats?.totalLogins ?? 0} icon="total" color="cyan" />
                <StatsCard title="High risk" value={stats?.highRiskCount ?? 0} icon="highRisk" color="crimson" />
                <StatsCard title="MFA required" value={stats?.decisions?.mfa ?? 0} icon="mfa" color="amber" />
                <StatsCard title="Blocked" value={stats?.decisions?.block ?? 0} icon="block" color="crimson" />
                <StatsCard title="Avg risk" value={stats?.avgRisk?.toFixed(1) ?? '0.0'} icon="avgRisk" color="purple" />
                <StatsCard title="Confidence" value={mlStatus.modelLoaded && mlStatus.confidence != null ? mlStatus.confidence : '—'} icon="confidence" color="emerald" />
              </div>
            </ScrollReveal>
          </section>

          {/* 2. Analytics charts + AI panel + gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <RiskChart data={stats?.recentEvents ?? []} type="area" />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <AnomalyDistribution events={events} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="hyper-card p-12 flex flex-col items-center justify-center min-h-[340px] bg-black/80 border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-105 transition-transform duration-1000">
                  <Shield size={200} className="text-primary" />
                </div>
                <div className="relative w-20 h-20 rounded-sm bg-black border border-primary/40 flex items-center justify-center mb-8">
                  <div className="absolute inset-2 border border-primary/20 flex items-center justify-center">
                    <span className="text-xl font-black text-primary font-mono">AI</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">Adaptive_Defense_AI</h3>
                <p className="text-primary/40 text-[10px] font-black tracking-[0.3em] text-center mb-10 max-w-sm uppercase">
                  Real-time Neural correlation • Zero-Trust isolation
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewEval(true)}
                  className="px-10 py-4 bg-black border border-primary text-primary font-black text-[10px] tracking-[0.4em] uppercase transition-all hover:bg-primary/10"
                >
                  INITIALIZE_AUDIT
                </motion.button>
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <ResultsGauge riskScore={currentRiskScore} decision={currentDecision} stats={stats} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <DecisionChart stats={stats?.decisions ?? {}} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <BackendInfo mlStatus={mlStatus} />
            </div>
          </div>

          {/* 3. Feature contribution + User profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
            {selectedEvent?.explanation?.topContributingFeatures?.length > 0 || selectedEvent?.topFeatures?.length > 0 ? (
              <FeatureImportance
                features={selectedEvent.explanation?.topContributingFeatures || selectedEvent.topFeatures || []}
              />
            ) : (
              <div className="hyper-card p-5 sm:p-6 animate-fade-in">
                <h3 className="text-base font-semibold text-white mb-2">Anomaly Drivers</h3>
                <p className="text-sm text-zinc-500">Select an event below to view ML-derived top contributing features.</p>
              </div>
            )}
            <UserProfile profile={userProfile?.profile} events={userProfile?.recentEvents ?? []} selectedEvent={selectedEvent} />
          </div>

          {/* 4. Recent Activity - at bottom */}
          <section id="events" className="mb-10 scroll-mt-24">
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setShowNewEval(false)}
          >
            <motion.div
              layoutId="eval-modal"
              className="border border-primary/30 bg-black/95 p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowNewEval(false)} className="absolute top-8 right-8 p-2 text-primary opacity-40 hover:opacity-100 transition-opacity">
                <Menu className="w-5 h-5 rotate-45" />
              </button>
              <CustomLoginForm onEvaluate={handleEvaluate} backendOnline={backendOnline} embedded />
            </motion.div>
          </div>
        )}

        <footer className="relative z-20 backdrop-blur-md bg-black border-t border-primary/10 py-12 mt-20 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 text-[9px] font-black tracking-[0.5em] text-primary/30 uppercase font-mono">
              <span>Isolation_Forest_v4</span>
              <div className="w-1 h-1 bg-primary/20" />
              <span>13_Identity_Vectors</span>
              <div className="w-1 h-1 bg-primary/20" />
              <span>Edge_Adaptive_Core</span>
            </div>
            <div className="text-[9px] font-black text-primary/20 tracking-[0.2em] uppercase font-mono">
              PULSEGUARD_AI © 2026 // SECURE_UPLINK_DASHBOARD
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
