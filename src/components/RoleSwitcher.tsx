import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Award, Building2 } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useApp();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; code: string }[] = [
    {
      id: 'operator',
      label: 'Lab Operator',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      code: 'OPR-L1',
    },
    {
      id: 'supervisor',
      label: 'Quality Supervisor',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      code: 'SPV-QA',
    },
    {
      id: 'officer',
      label: 'Compliance Officer',
      icon: <Award className="w-3.5 h-3.5" />,
      code: 'OFF-AUDIT',
    },
  ];

  return (
    <aside aria-label="Workstation & Role Status Bar" className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px] select-none no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Lab Unit Metadata */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>LGM Testing & Metrology Division</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono hidden md:inline">
            ISO/IEC 17025 Accredited
          </span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            SYS: NOMINAL
          </span>
        </div>

        {/* Right: Clean Segmented Role Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider hidden sm:inline">
            Simulate Role:
          </span>
          <div className="flex items-center p-0.5 bg-slate-950/80 rounded border border-slate-800">
            {roles.map((r) => {
              const isActive = currentUser.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => switchRole(r.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                  <span className={`text-[9px] font-mono px-1 rounded ${
                    isActive ? 'bg-teal-900/60 text-teal-200' : 'text-slate-500'
                  }`}>
                    {r.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
