/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Dashboard } from './components/Dashboard';
import { InstrumentList } from './components/InstrumentList';
import { PendingApprovals } from './components/PendingApprovals';
import { AuditReportView } from './components/AuditReportView';
import { QrScannerModal } from './components/QrScannerModal';
import { InstrumentProfileModal } from './components/InstrumentProfileModal';
import { InternalVerificationModal } from './components/InternalVerificationModal';
import { ExternalCalibrationModal } from './components/ExternalCalibrationModal';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { SettingsModal } from './components/SettingsModal';
import { VirtualLabBench } from './components/VirtualLabBench';
import { LabFloorPlan } from './components/LabFloorPlan';
import { Instrument } from './types';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { instruments } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isExternalCertOpen, setIsExternalCertOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers
  const handleSelectFromQr = (instrumentId: string) => {
    const inst = instruments.find((i) => i.id === instrumentId);
    if (inst) {
      setSelectedInstrument(inst);
      setIsProfileOpen(true);
    }
  };

  const handleOpenInstrumentProfile = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setIsProfileOpen(true);
  };

  const handleStartVerification = (inst?: Instrument) => {
    setSelectedInstrument(inst || null);
    setIsVerificationOpen(true);
  };

  const handleStartExternalCert = (inst?: Instrument) => {
    setSelectedInstrument(inst || null);
    setIsExternalCertOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Test Toolbar: Role Switcher for RBAC evaluation */}
      <RoleSwitcher />

      {/* Primary Top Bar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQrScan={() => setIsQrScanOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={setActiveTab}
            onOpenQrScan={() => setIsQrScanOpen(true)}
            onOpenVerification={() => handleStartVerification()}
            onOpenExternalCert={() => handleStartExternalCert()}
            onOpenInstrumentProfile={handleOpenInstrumentProfile}
          />
        )}

        {activeTab === 'instruments' && (
          <InstrumentList
            onOpenInstrumentProfile={handleOpenInstrumentProfile}
            onStartVerification={handleStartVerification}
            onStartExternalCert={handleStartExternalCert}
          />
        )}

        {activeTab === 'virtual-bench' && (
          <VirtualLabBench
            onNavigateTab={setActiveTab}
            onOpenInstrumentProfile={handleOpenInstrumentProfile}
          />
        )}

        {activeTab === 'lab-map' && (
          <LabFloorPlan
            onOpenInstrumentProfile={handleOpenInstrumentProfile}
            onStartVerification={handleStartVerification}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'approvals' && <PendingApprovals />}

        {activeTab === 'audit-reports' && <AuditReportView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-slate-800">LabCalibre OS v1.0</span>
            <span>·</span>
            <span>Laboratory Instrument Calibration & Verification Management System</span>
          </div>
          <div>
            ISO/IEC 17025 & OIML Compliant · Malaysian Rubber Board (LGM)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QrScannerModal
        isOpen={isQrScanOpen}
        onClose={() => setIsQrScanOpen(false)}
        onSelectInstrument={handleSelectFromQr}
      />

      <InstrumentProfileModal
        instrument={selectedInstrument}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onStartVerification={(inst) => handleStartVerification(inst)}
        onStartExternalCert={(inst) => handleStartExternalCert(inst)}
      />

      <InternalVerificationModal
        initialInstrument={selectedInstrument}
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <ExternalCalibrationModal
        initialInstrument={selectedInstrument}
        isOpen={isExternalCertOpen}
        onClose={() => setIsExternalCertOpen(false)}
      />

      <GoogleLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
