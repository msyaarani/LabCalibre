import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Settings, 
  Mail, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle, 
  Server, 
  Cpu, 
  ShieldCheck,
  Bell
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, resetAllData } = useApp();
  const [activeTab, setActiveTab] = useState<'logs' | 'system'>('logs');
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data back to the initial sample database?')) {
      resetAllData();
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        onClose();
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                Laboratory System Settings & Notification Logs
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">Emergency email dispatch audit and integration telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50/50 gap-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-2 font-bold border-b-2 flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Emergency Alert Logs ({notifications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`py-2 font-bold border-b-2 flex items-center gap-2 ${
              activeTab === 'system'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>System Integration Telemetry</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {resetDone && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sample database successfully restored to default state.</span>
            </div>
          )}

          {activeTab === 'logs' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-mono">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Automated Email Dispatch Outbox (FR-005, FR-007)
                </span>
                <span className="text-[10px]">Compliance Latency &lt; 1 min</span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No notification logs recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded border text-xs ${
                        n.type === 'emergency_quarantine'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <div className="flex items-center gap-2">
                          {n.type === 'emergency_quarantine' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <Bell className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                          <span className="font-mono text-xs">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString('en-US')}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Recipient: {n.recipient}</span>
                        <span>STATUS: DISPATCHED (SMTP)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2.5 font-mono">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-teal-700" />
                  AI Engine & Backend Architecture
                </h3>
                <div className="grid grid-cols-2 gap-3 text-slate-600 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">AI Extraction Engine:</span>
                    <span className="font-semibold text-slate-900">Google Gemini API (Multimodal)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Model Alias:</span>
                    <span className="text-slate-900 font-bold">gemini-3.8-flash</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Output Protocol:</span>
                    <span className="text-slate-900">Strict JSON Schema Validation</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Compliance Standard:</span>
                    <span className="text-slate-900">MS ISO/IEC 17025 & OIML</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Role-Based Access Control (RBAC Matrix)
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px] leading-relaxed font-mono">
                  <li><strong>Operator:</strong> Enter daily verifications, upload external certs, scan QR codes.</li>
                  <li><strong>Supervisor:</strong> Review pending records, approve / reject (Approval queue), toggle quarantine status.</li>
                  <li><strong>Officer:</strong> Laboratory audit compliance oversight, final review, export CSV audit logs.</li>
                </ul>
              </div>

              {/* Reset Data Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded font-mono text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Sample Data to Factory Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
