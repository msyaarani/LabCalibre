import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, users, currentUser } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = loginWithGoogle(customEmail, customName);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setCustomEmail('');
        setCustomName('');
      }, 700);
    }
  };

  const handleSelectPreconfiguredUser = (email: string, name: string) => {
    setErrorMessage(null);
    const res = loginWithGoogle(email, name);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                Google Workspace SSO (FR-001)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">Sign in with authorized @syarikat.com account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick 1-Click SSO Selection */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">
              Select Pre-Configured Staff Account (Instant Test):
            </span>
            <div className="space-y-1.5 font-mono">
              {users.map((u) => {
                const isCurrent = currentUser.email === u.email;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectPreconfiguredUser(u.email, u.name)}
                    className={`w-full text-left p-2 rounded border transition-all flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-teal-50 border-teal-500 text-teal-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-slate-800 group-hover:text-teal-900">
                        {u.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {u.email}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200">
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-white px-2 text-slate-400">Or Test Any Custom Email</span>
            </div>
          </div>

          {/* Custom Email Form */}
          <form onSubmit={handleCustomLogin} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Full Name:
              </label>
              <input
                type="text"
                placeholder="e.g., Alex Johnson"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Corporate Email Address (@syarikat.com) *:
              </label>
              <input
                type="text"
                required
                placeholder="e.g., employee@syarikat.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Attempts using non-corporate domains (e.g. @gmail.com) will be rejected per FR-001.
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded shadow-xs transition-colors"
            >
              <span>Sign In with Google SSO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
