import React, { useState } from 'react';
import { Loader } from 'lucide-react';
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

const inputClass = 'w-full border border-slate-300 rounded px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const CustomLoginForm = ({ onEvaluate, backendOnline = false }) => {
  const [formData, setFormData] = useState({
    userId: '',
    userType: 'employee',
    deviceType: 'unknown',
    deviceId: '',
    region: 'US-East',
    timestamp: new Date().toISOString().slice(0, 16),
    failedAttempts: 0,
    isNewUser: false,
    ipAddress: '',
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
        userId: formData.userId.trim() || undefined,
        userType: formData.userType,
        deviceType: formData.deviceType,
        deviceId: formData.deviceId.trim() || undefined,
        region: formData.region,
        timestamp: new Date(formData.timestamp).toISOString(),
        failedAttempts: formData.failedAttempts,
        isNewUser: formData.isNewUser,
        ipAddress: formData.ipAddress.trim() || undefined,
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
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Custom Login Evaluation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>User ID (optional)</label>
            <input type="text" name="userId" value={formData.userId} onChange={handleChange} className={inputClass} placeholder="Auto UUID if empty" />
          </div>
          <div>
            <label className={labelClass}>Timestamp</label>
            <input type="datetime-local" name="timestamp" value={formData.timestamp} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>User Type</label>
            <select name="userType" value={formData.userType} onChange={handleChange} className={inputClass}>
              {USER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Device Type</label>
            <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={inputClass}>
              {DEVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Device ID</label>
            <input type="text" name="deviceId" value={formData.deviceId} onChange={handleChange} className={inputClass} placeholder="e.g. device_abc" />
          </div>
          <div>
            <label className={labelClass}>Region</label>
            <select name="region" value={formData.region} onChange={handleChange} className={inputClass}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Failed Attempts</label>
            <input type="number" name="failedAttempts" value={formData.failedAttempts} onChange={handleChange} min={0} max={10} className={inputClass} />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isNewUser" name="isNewUser" checked={formData.isNewUser} onChange={handleChange} className="rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="isNewUser" className="text-sm text-slate-700">New user</label>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>IP address (optional)</label>
            <input type="text" name="ipAddress" value={formData.ipAddress} onChange={handleChange} className={inputClass} placeholder="Region derived if empty" />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !backendOnline}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : 'Evaluate Login Risk'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Risk evaluation result</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-500 uppercase">Anomaly score</div>
              <div className="text-lg font-semibold text-slate-900">{(result.anomalyScore * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">Risk score</div>
              <div className="text-lg font-semibold text-slate-900">{result.riskScore}/100</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">Decision</div>
              <div className={`text-lg font-semibold uppercase ${result.decision === 'block' ? 'text-primary' : result.decision === 'mfa' ? 'text-amber-600' : 'text-slate-700'}`}>
                {result.decision}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
            <div>Model confidence: {result.modelConfidence != null ? (result.modelConfidence * 100).toFixed(0) : '—'}%</div>
            <div>Processing time: {result.processingTimeMs != null ? `${result.processingTimeMs} ms` : '—'}</div>
          </div>
          {result.featureContributions?.length > 0 && (
            <>
              <div className="text-xs font-medium text-slate-500 uppercase mb-2">Top anomalous features</div>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mb-2">
                {result.featureContributions.slice(0, 3).map((f, i) => (
                  <li key={i}>{f.feature}: {f.deviationScore?.toFixed(3)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomLoginForm;
