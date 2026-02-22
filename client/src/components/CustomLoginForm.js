import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, ChevronRight, User, Hash, Globe, Smartphone, Clock, Mail, ShieldCheck, AlertTriangle, Shield } from 'lucide-react';
import { evaluateLogin } from '../services/api';

const REGIONS = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'AP-South', 'AP-North', 'Other'];
const USER_TYPES = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'guest', label: 'Guest' },
];

const InputField = ({ label, name, icon: Icon, value, onChange, placeholder, type = "text", options = [], ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-6 group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFocused ? 'text-primary scale-110 drop-shadow-[0_0_8px_var(--primary)]' : 'text-primary/20'}`}>
        <Icon size={16} />
      </div>

      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-black/60 border rounded-sm py-4 pl-12 pr-4 text-[13px] font-mono text-white transition-all duration-300 outline-none appearance-none cursor-pointer
            ${isFocused ? 'border-primary ring-1 ring-primary/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'border-primary/10 hover:border-primary/30'}`}
          {...props}
        >
          {options.map(opt => <option key={opt} value={opt.toLowerCase()} className="bg-black text-white">{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-black/60 border rounded-sm py-4 pl-12 pr-4 text-[13px] font-mono text-white placeholder:text-white/5 transition-all duration-300 outline-none
            ${isFocused ? 'border-primary ring-1 ring-primary/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'border-primary/10 hover:border-primary/30'}`}
          placeholder={placeholder}
          {...props}
        />
      )}

      <label className={`absolute left-10 transition-all duration-300 pointer-events-none uppercase font-black tracking-[0.2em] text-[8px]
        ${isFocused || value ? '-top-2.5 bg-black px-2 text-primary opacity-100 scale-90' : 'top-4 text-primary/0 opacity-0'}`}>
        {label}
      </label>

      {/* Animated focus border segment */}
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-primary transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};

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
      setError('Adaptive Engine unreachable.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const eventData = {
        ...formData,
        timestamp: new Date(formData.timestamp).toISOString(),
      };
      const response = await evaluateLogin(eventData);
      if (response.success) {
        setResult(response.data);
        if (onEvaluate) onEvaluate();
      } else {
        setError(response.error || 'Intelligence analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Engine communication failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'hyper-card p-10 bg-black/80 backdrop-blur-md border border-primary/20 shadow-2xl overflow-hidden relative group'}>
      {/* Decorative Matrix Grids */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(0,255,65,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />

      <header className="mb-12 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
          <h3 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase opacity-60">
            Secure_Input_Portal
          </h3>
        </div>
        <p className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(0,255,65,0.2)]">Identity Audit <span className="text-primary font-mono text-sm opacity-40 ml-2">v4.0.2</span></p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InputField label="Identity Name" name="displayName" icon={User} value={formData.displayName} onChange={handleChange} placeholder="Identity name" />
          <InputField label="Subject UID" name="userId" icon={Hash} value={formData.userId} onChange={handleChange} placeholder="Terminal UID" />
          <InputField label="Deployment Zone" name="region" icon={Globe} value={formData.region} onChange={handleChange} type="select" options={REGIONS} />
          <InputField label="Context Role" name="userType" icon={Smartphone} value={formData.userType} onChange={handleChange} type="select" options={USER_TYPES.map(u => u.label)} />
          <InputField label="Device Mask" name="deviceId" icon={Smartphone} value={formData.deviceId} onChange={handleChange} placeholder="id_hw_...." />
          <InputField label="Access Time" name="timestamp" icon={Clock} value={formData.timestamp} onChange={handleChange} type="datetime-local" />
        </div>

        {/* Failed Attempts Slider - Matrix Styled */}
        <div className="space-y-6 p-6 bg-black border border-primary/10 rounded-sm relative overflow-hidden group/slider">
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[9px] font-black tracking-[0.2em] text-primary/60 uppercase">Anomalous_Entries</span>
            <span className="text-2xl font-mono font-black text-primary drop-shadow-[0_0_8px_var(--primary)]">{formData.failedAttempts}</span>
          </div>
          <div className="relative h-2 flex items-center">
            <div className="absolute w-full h-1 bg-primary/10 rounded-full" />
            <div
              className="absolute h-1 bg-primary shadow-[0_0_10px_var(--primary)] rounded-full transition-all duration-300"
              style={{ width: `${formData.failedAttempts * 10}%` }}
            />
            <input
              type="range"
              min="0"
              max="10"
              name="failedAttempts"
              value={formData.failedAttempts}
              onChange={handleChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-primary rounded-sm shadow-[0_0_10px_var(--primary)] transition-all duration-300 pointer-events-none"
              style={{ left: `calc(${formData.failedAttempts * 10}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[7px] font-black text-primary/30 uppercase tracking-[0.2em] relative z-10">
            <span>Base_Baseline</span>
            <span>Critical_Overload</span>
          </div>
        </div>

        <div className="flex items-center gap-6 p-6 bg-black border border-primary/10 rounded-sm relative group/switch">
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, isNewUser: !p.isNewUser }))}
            className={`relative w-12 h-6 rounded-sm transition-all duration-500 border ${formData.isNewUser ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,255,65,0.2)]' : 'bg-black border-primary/20'}`}
          >
            <motion.div
              layout
              className={`absolute top-1 left-1 w-3.5 h-3.5 rounded-sm transition-colors duration-500 ${formData.isNewUser ? 'bg-primary' : 'bg-primary/40'}`}
              animate={{ x: formData.isNewUser ? 24 : 0 }}
            />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.1em] text-white uppercase">Identity_Ghosting_Mode</span>
            <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest mt-1">Enforce zero-knowledge isolation</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !backendOnline}
          className="relative w-full py-5 bg-black border border-primary text-primary font-black tracking-[0.4em] uppercase text-xs shadow-lg shadow-primary/5 relative overflow-hidden group/btn disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
          <div className="relative flex items-center justify-center gap-4">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : (
              <>
                <Shield className="w-4 h-4 animate-flicker" />
                <span>Bypass Isolation</span>
              </>
            )}
          </div>
        </motion.button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-[10px] font-black uppercase tracking-widest text-center"
        >
          {error}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-10 bg-black/90 border border-primary/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
            <ShieldCheck size={200} className="text-primary" />
          </div>

          <div className="flex flex-col gap-10 relative z-10">
            <div>
              <h4 className="text-[9px] font-black tracking-[0.5em] text-primary/40 uppercase mb-4">Neural_Audit_Complete</h4>
              <div className="flex items-baseline gap-4">
                <span className={`text-8xl font-black font-mono tracking-tighter ${result.decision === 'block' ? 'text-danger drop-shadow-[0_0_20px_rgba(255,0,51,0.4)]' : result.decision === 'mfa' ? 'text-accent drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]' : 'text-primary drop-shadow-[0_0_20px_rgba(0,255,65,0.4)]'}`}>
                  {result.riskScore}
                </span>
                <span className="text-xs font-black text-primary/40 uppercase tracking-widest">/ Intelligence_Index</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-black border border-primary/10 group/item hover:border-primary/40 transition-colors">
                <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-3">Model_Confidence</p>
                <p className="text-3xl font-mono font-black text-white">{(result.modelConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="p-6 bg-black border border-primary/10 group/item hover:border-primary/40 transition-colors">
                <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-3">Latency_Pulse</p>
                <p className="text-3xl font-mono font-black text-white">{result.processingTimeMs}<span className="text-xs opacity-40 ml-1">ms</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomLoginForm;
