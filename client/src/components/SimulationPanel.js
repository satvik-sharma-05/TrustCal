import React, { useState } from 'react';
import { Play, Loader } from 'lucide-react';
import { runSimulation } from '../services/api';

const SimulationPanel = ({ onSimulate }) => {
  const [scenario, setScenario] = useState('normal');
  const [userId, setUserId] = useState('test_user');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { value: 'normal', label: 'Normal Login' },
    { value: 'newDevice', label: 'New Device' },
    { value: 'geoAnomaly', label: 'Geographic Anomaly' },
    { value: 'failedAttempts', label: 'Failed Attempts Spike' },
    { value: 'privileged', label: 'Privileged User Anomaly' },
    { value: 'multiFactor', label: 'Multi-Factor Anomaly' },
    { value: 'newUser', label: 'New User' },
  ];

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const result = await runSimulation(scenario, userId, count);
      if (onSimulate) {
        onSimulate(result);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl border border-dark-700 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6">Simulation Engine</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-dark-400 mb-2">Scenario</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {scenarios.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-dark-400 mb-2">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="test_user"
          />
        </div>

        <div>
          <label className="block text-sm text-dark-400 mb-2">Count</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run Simulation
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimulationPanel;
