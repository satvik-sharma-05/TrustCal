import React, { useState } from 'react';
import { Loader, ChevronRight } from 'lucide-react';
import { evaluateLogin } from '../services/api';

const REGIONS = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'AP-South', 'AP-North', 'Other'];
const USER_TYPES = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'guest', label: 'Guest' },
];
const DEVICE_TYPES = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'server', label: 'Server' },
  { value: 'unknown', label: 'Unknown' },
];

const CustomLoginForm = ({ onEvaluate, backendOnline = false, embedded = false }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    userId: '',
    userType: 'employee',
    deviceType: 'unknown',
    deviceId: '',
    region: 'US-East',
    timestamp: new Date().toISOString().slice(0, 16),
    failedAttempts: 0,
    isNewUser: false,
    ipAddress: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'failedAttempts' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!backendOnline) {
      setError('Backend offline. Start the server first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const eventData = {
        displayName: formData.displayName.trim() || undefined,
        userId: formData.userId.trim() || undefined,
        userType: formData.userType,
        deviceType: formData.deviceType,
        deviceId: formData.deviceId.trim() || undefined,
        region: formData.region,
        timestamp: new Date(formData.timestamp).toISOString(),
        failedAttempts: formData.failedAttempts,
        isNewUser: formData.isNewUser,
        ipAddress: formData.ipAddress.trim() || undefined,
        email: formData.email.trim() || undefined,
      };
      const response = await evaluateLogin(eventData);
      if (response.success) {
        setResult(response.data);
        if (onEvaluate) onEvaluate();
      } else {
        setError(response.error || 'Evaluation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'glass-card p-6'}>
      <h3 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
        New Evaluation
        <span className="w-12 h-px bg-gradient-to-r from-purple/50 to-transparent" />
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-upper block mb-1.5">Name (optional)</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-purple transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">User ID (optional)</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-purple transition-colors"
              placeholder="Auto UUID if empty"
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">Timestamp</label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm focus:border-purple transition-colors"
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm focus:border-purple transition-colors bg-navy-mid/50"
            >
              {USER_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-navy-mid text-slate-200">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Device Type</label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm focus:border-purple transition-colors bg-navy-mid/50"
            >
              {DEVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-navy-mid text-slate-200">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Device ID</label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-purple transition-colors font-mono"
              placeholder="e.g. device_abc"
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm focus:border-purple transition-colors bg-navy-mid/50"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-navy-mid text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Failed Attempts</label>
            <input
              type="number"
              name="failedAttempts"
              value={formData.failedAttempts}
              onChange={handleChange}
              min={0}
              max={10}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm focus:border-purple transition-colors"
            />
          </div>
          <div className="col-span-2 flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={formData.isNewUser}
              onClick={() => setFormData((p) => ({ ...p, isNewUser: !p.isNewUser }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.isNewUser ? 'bg-purple' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isNewUser ? 'left-6' : 'left-1'}`}
              />
            </button>
            <label className="text-sm text-slate-400">New user</label>
          </div>
          <div>
            <label className="label-upper block mb-1.5">Email (optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-purple transition-colors"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="label-upper block mb-1.5">IP address (optional)</label>
            <input
              type="text"
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              className="w-full recessed-input px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-purple transition-colors font-mono"
              placeholder="Region derived if empty"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !backendOnline}
          className="w-full bg-purple hover:bg-purple/90 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.3)]"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              Evaluate Login Risk
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-crimson/10 border border-crimson/30 text-crimson text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 pt-5 border-t border-white/5">
          <h4 className="label-upper mb-3">Risk evaluation result</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="label-upper text-[10px]">Anomaly</div>
              <div className="text-lg font-light text-slate-200">{(result.anomalyScore * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="label-upper text-[10px]">Risk</div>
              <div className="text-lg font-light text-slate-200">{result.riskScore}/100</div>
            </div>
            <div>
              <div className="label-upper text-[10px]">Decision</div>
              <div
                className={`text-lg font-medium uppercase ${
                  result.decision === 'block' ? 'text-crimson' : result.decision === 'mfa' ? 'text-amber' : 'text-emerald'
                }`}
              >
                {result.decision}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>Model confidence: {result.modelConfidence != null ? (result.modelConfidence * 100).toFixed(0) : '—'}%</div>
            <div>Processing: {result.processingTimeMs != null ? `${result.processingTimeMs} ms` : '—'}</div>
          </div>
          {result.featureContributions?.length > 0 && (
            <div className="mt-3">
              <div className="label-upper text-[10px] mb-1.5">Top features</div>
              <ul className="space-y-1 text-sm text-slate-400 font-mono">
                {result.featureContributions.slice(0, 3).map((f, i) => (
                  <li key={i}>
                    {f.feature}: {f.deviationScore?.toFixed(3)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomLoginForm;
