import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Shield, Cpu, WifiOff } from 'lucide-react';
import StatsCard from './components/StatsCard';
import RiskGauge from './components/RiskGauge';
import LoginTimeline from './components/LoginTimeline';
import RiskChart, { DecisionChart } from './components/RiskChart';
import UserProfile from './components/UserProfile';
import CustomLoginForm from './components/CustomLoginForm';
import AnomalyScore from './components/AnomalyScore';
import FeatureImportance from './components/FeatureImportance';
import AnomalyDistribution from './components/AnomalyDistribution';
import { getStats, getEvents, getUserProfile, getMLStatus } from './services/api';

function App() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mlStatus, setMlStatus] = useState({ modelLoaded: false });
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchData = async () => {
    try {
      const [statsData, eventsData] = await Promise.all([getStats(), getEvents(1, 20)]);
      setStats(statsData);
      setEvents(eventsData.events || []);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    getMLStatus().then(setMlStatus).catch(() => setMlStatus({ modelLoaded: false }));

    const interval = setInterval(fetchData, 15000);
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

  const handleEvaluate = () => fetchData();
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

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <div className="text-slate-600 font-medium">Loading TrustCal ML...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {!backendOnline && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 flex items-center justify-center gap-2 text-amber-800 text-sm">
          <WifiOff className="w-4 h-4" />
          Backend offline. Start the server with <code className="bg-amber-100 px-1 rounded">npm run server</code>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50" style={!backendOnline ? { marginTop: 0 } : {}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-100">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">TrustCal ML</h1>
              <p className="text-sm text-slate-500">Adaptive Access Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {mlStatus.modelLoaded && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 border border-slate-200">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-slate-700">Model loaded</span>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 uppercase">System status</div>
              <div className={`text-sm font-semibold ${backendOnline ? 'text-green-600' : 'text-amber-600'}`}>
                {backendOnline ? 'Operational' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total login events" value={stats?.totalLogins ?? 0} icon="total" />
          <StatsCard title="High risk events" value={stats?.highRiskCount ?? 0} icon="highRisk" />
          <StatsCard title="MFA required" value={stats?.decisions?.mfa ?? 0} icon="mfa" />
          <StatsCard title="Blocked events" value={stats?.decisions?.block ?? 0} icon="block" />
          <StatsCard title="Average risk score" value={stats?.avgRisk?.toFixed(1) ?? '0.0'} icon="avgRisk" />
          <StatsCard title="Model confidence" value={mlStatus.modelLoaded ? '85%' : '—'} icon="confidence" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CustomLoginForm onEvaluate={handleEvaluate} backendOnline={backendOnline} />
          <div className="space-y-4">
            <RiskGauge riskScore={currentRiskScore} />
            {latestEvent?.anomalyScore != null && (
              <AnomalyScore anomalyScore={latestEvent.anomalyScore} riskScore={latestEvent.riskScore} />
            )}
          </div>
        </div>

        <div className="mb-8">
          <LoginTimeline events={events} onEventClick={handleEventClick} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <RiskChart data={stats?.recentEvents ?? []} type="area" />
          <AnomalyDistribution events={events} />
          <DecisionChart stats={stats?.decisions ?? {}} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {selectedEvent?.explanation?.topContributingFeatures?.length > 0 || selectedEvent?.topFeatures?.length > 0 ? (
            <FeatureImportance
              features={selectedEvent.explanation?.topContributingFeatures || selectedEvent.topFeatures || []}
            />
          ) : (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Feature contribution</h3>
              <p className="text-sm text-slate-500">Select an event in the timeline to view top contributing features.</p>
            </div>
          )}
          <UserProfile profile={userProfile?.profile} events={userProfile?.recentEvents ?? []} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          TrustCal ML — AI-driven identity risk scoring for adaptive access control. Privacy-preserving simulated identity logs.
        </div>
      </footer>
    </div>
  );
}

export default App;
