import React from 'react';
import { useApp } from '../context/AppContext';
import { Instrument } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  QrCode, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Building2,
  Sliders
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenQrScan: () => void;
  onOpenVerification: () => void;
  onOpenExternalCert: () => void;
  onOpenInstrumentProfile: (instrument: Instrument) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenQrScan,
  onOpenVerification,
  onOpenExternalCert,
  onOpenInstrumentProfile,
}) => {
  const { instruments, records } = useApp();

  const activeInstruments = instruments.filter((i) => i.isActive);
  const totalCount = activeInstruments.length;
  const activeCount = activeInstruments.filter((i) => i.status === 'active').length;
  const dueSoonCount = activeInstruments.filter((i) => i.status === 'due_soon').length;
  const quarantinedInstruments = activeInstruments.filter((i) => i.status === 'out_of_service');
  const quarantineCount = quarantinedInstruments.length;

  const pendingApprovals = records.filter((r) => r.isActive && r.approvalStatus === 'Pending');

  // Calculate upcoming due dates
  const today = new Date();
  const getDaysUntilDue = (dueDateStr: string) => {
    if (!dueDateStr || dueDateStr.toLowerCase().includes('immediate') || dueDateStr.toLowerCase().includes('pending') || dueDateStr.toLowerCase().includes('action')) {
      return -999;
    }
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return -999;
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dueWithin30 = activeInstruments
    .map((inst) => ({
      ...inst,
      daysLeft: getDaysUntilDue(inst.nextDueDate),
    }))
    .filter((inst) => (inst.daysLeft <= 30 || inst.status === 'due_soon') && inst.status !== 'out_of_service')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const recentRecords = records.filter((r) => r.isActive).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Auto-Quarantine Emergency Strip (FR-005) - Crisp & Urgent */}
      {quarantineCount > 0 && (
        <section aria-label="Quarantine Alert" className="bg-rose-50 border border-rose-300 rounded-lg p-3.5 sm:p-4 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-800 text-[11px] uppercase tracking-wider bg-rose-200/80 px-1.5 py-0.5 rounded">
                  AUTO-QUARANTINE ACTIVE
                </span>
                <span className="font-semibold text-rose-900">
                  {quarantineCount} instrument(s) restricted from laboratory operation
                </span>
              </div>
              <p className="text-rose-800 mt-1 leading-relaxed">
                Instrument failed tolerance verification and was automatically placed in "Out of Service" status. Review test records for corrective service.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                {quarantinedInstruments.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onOpenInstrumentProfile(q)}
                    className="font-bold underline text-rose-900 hover:text-rose-750 flex items-center gap-1"
                  >
                    <span>{q.id} · {q.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('instruments')}
            className="self-start sm:self-center px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded transition-colors whitespace-nowrap shrink-0"
          >
            Manage Quarantine
          </button>
        </section>
      )}

      {/* Operational Workstation Header & Fast-Trigger Bench */}
      <section aria-label="Calibration Operations Center" className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>CALIBRATION & TESTING LABORATORY</span>
              <span>·</span>
              <span className="text-teal-700 font-semibold">TEST BENCH #01</span>
              <span>·</span>
              <span>DATE: {today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Laboratory Calibration Operations Center
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated tolerance limit verification, MS ISO/IEC 17025 schedule compliance, and QR tracking.
            </p>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Compliance Rate</span>
              <span className="text-base font-mono font-bold text-teal-800">
                {Math.round((activeCount / (totalCount || 1)) * 100)}%
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Pending Approvals</span>
              <span className="text-base font-mono font-bold text-amber-700">
                {pendingApprovals.length}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Primary Operational Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          {/* Action 1: QR Scan */}
          <button
            type="button"
            onClick={onOpenQrScan}
            className="flex items-start gap-3.5 p-3.5 rounded border border-slate-200 hover:border-teal-600 hover:bg-slate-50/80 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 block truncate">
                Scan QR Code Tag
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Camera scan & rapid ID lookup (&lt; 3s)
              </span>
            </div>
          </button>

          {/* Action 2: Internal Verification */}
          <button
            type="button"
            onClick={onOpenVerification}
            className="flex items-start gap-3.5 p-3.5 rounded border border-slate-200 hover:border-teal-600 hover:bg-slate-50/80 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 block truncate">
                Daily Verification
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Reading check with auto-calc tolerance
              </span>
            </div>
          </button>

          {/* Action 3: External Cert (AI) */}
          <button
            type="button"
            onClick={onOpenExternalCert}
            className="flex items-start gap-3.5 p-3.5 rounded border border-slate-200 hover:border-teal-600 hover:bg-slate-50/80 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950 block truncate">
                Upload External Cert
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Extract accreditation certificate via AI
              </span>
            </div>
          </button>

          {/* Action 4: Approval Queue */}
          <button
            type="button"
            onClick={() => onNavigateTab('approvals')}
            className="flex items-start gap-3.5 p-3.5 rounded border border-slate-200 hover:border-teal-600 hover:bg-slate-50/80 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 group-hover:text-amber-950 block truncate flex items-center justify-between">
                <span>Approval Queue</span>
                {pendingApprovals.length > 0 && (
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded">
                    {pendingApprovals.length}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Supervisor verification review workflow
              </span>
            </div>
          </button>
        </div>

        {/* Interactive Experience Quick Launcher */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            onClick={() => onNavigateTab('virtual-bench')}
            className="p-3.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-teal-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sliders className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-950 block">
                  Interactive Virtual Metrology Test Bench
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Simulate live balance readings, draft chamber airflow, and tare controls
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-700 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div 
            onClick={() => onNavigateTab('lab-map')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950 block">
                  LGM UPKS Laboratory Floor Plan Map
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Explore 8 physical lab rooms, live telemetry, and stationed instruments
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>
      </section>

      {/* KPI Telemetry Matrix */}
      <section aria-label="Laboratory Metrics Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Instruments */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Total Inventory</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2">
            {totalCount} <span className="text-xs font-normal text-slate-500 font-sans">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Registered laboratory instruments
          </p>
        </div>

        {/* Compliant / Active */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-teal-800 flex items-center justify-between">
            <span>Active & Valid</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-teal-800 mt-2">
            {activeCount} <span className="text-xs font-normal text-teal-700 font-sans">units</span>
          </div>
          <p className="text-[11px] text-teal-700 mt-1">
            Within calibration validity period
          </p>
        </div>

        {/* Due Soon */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-800 flex items-center justify-between">
            <span>Approaching Due Date</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-700 mt-2">
            {dueSoonCount} <span className="text-xs font-normal text-amber-600 font-sans">units</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            Expiring within &le; 30 days
          </p>
        </div>

        {/* Quarantined */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-800 flex items-center justify-between">
            <span>Quarantined (Failed)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-700 mt-2">
            {quarantineCount} <span className="text-xs font-normal text-rose-600 font-sans">units</span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1">
            {quarantineCount === 0 ? 'Zero unhandled failures' : 'Corrective maintenance required'}
          </p>
        </div>
      </section>

      {/* Main 2-Column Split: Calibration Schedule Horizon & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calibration Schedule Horizon (FR-007) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>Calibration Schedule Horizon (FR-007)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automated tracking of calibration expiry dates across compliance windows (30, 14, 7 days).
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('instruments')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Full Schedule</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {dueWithin30.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              All laboratory instruments possess valid calibration certificates. None expiring within &le; 30 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dueWithin30.map((inst) => {
                const isCritical = inst.daysLeft <= 7;
                const isWarning = inst.daysLeft <= 14;

                return (
                  <div
                    key={inst.id}
                    onClick={() => onOpenInstrumentProfile(inst)}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 cursor-pointer transition-colors px-1 rounded group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {inst.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 truncate">
                          {inst.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                        <span>SN: {inst.serialNo}</span>
                        <span>·</span>
                        <span>Location: {inst.location}</span>
                        <span>·</span>
                        <span>Tolerance: ±{inst.toleranceLimit} {inst.unit}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          inst.daysLeft === -999 || isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {inst.daysLeft === -999 ? 'Action Required' : inst.daysLeft <= 0 ? 'Overdue' : `${inst.daysLeft} Days Left`}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        Due: {inst.nextDueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Calibration Audit Stream */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <span>Recent Audit Trail Activity</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Latest verification tests & calibration certificates logged
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit-reports')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Audit Logs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded border border-slate-200/80 hover:bg-slate-50/70 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-slate-500">{rec.id}</span>
                    <span className="font-bold text-slate-900 truncate">{rec.instrumentName}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      rec.resultStatus === 'Pass' || rec.resultStatus === 'Lulus'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {rec.resultStatus === 'Pass' || rec.resultStatus === 'Lulus' ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="font-mono">
                    {rec.type === 'Internal' ? 'Internal Verification' : 'External Certificate'} · {rec.date}
                  </span>
                  <span
                    className={`font-semibold ${
                      rec.approvalStatus === 'Approved'
                        ? 'text-emerald-700'
                        : rec.approvalStatus === 'Rejected'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {rec.approvalStatus === 'Approved' ? '✓ Approved' : rec.approvalStatus === 'Rejected' ? '✗ Rejected' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
