import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { labAudio } from '../utils/audio';
import { 
  FlaskConical, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  Settings,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
  Sparkles,
  Map
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onOpenQrScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenSettings,
}) => {
  const { currentUser, logout, notifications, unreadCount, markNotificationsAsRead, instruments } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(labAudio.getMuted());

  const handleToggleSound = () => {
    const muted = labAudio.toggleMute();
    setSoundMuted(muted);
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'virtual-bench', label: 'Virtual Test Bench', badge: 'Interactive' },
    { id: 'lab-map', label: 'Lab Map', badge: 'LGM Rooms' },
    { id: 'instruments', label: 'Instrument Inventory' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'audit-reports', label: 'Audit Reports' },
  ];

  const quarantinedCount = instruments.filter((i) => i.isActive && i.status === 'out_of_service').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-sm tracking-wider">
                <FlaskConical className="w-4 h-4 text-teal-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-teal-800 transition-colors">
                  LabCalibre
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight -mt-0.5">
                  CALIBRATION OS · v1.0
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`text-xs font-semibold py-4 whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px ${
                    isActive
                      ? 'text-teal-800 border-teal-700'
                      : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary action & User session controls */}
          <div className="flex items-center gap-2 shrink-0">
            {quarantinedCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                {quarantinedCount} Quarantined
              </span>
            )}

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title={soundMuted ? 'Unmute Acoustic Feedback' : 'Mute Acoustic Feedback'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-teal-700" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (unreadCount > 0) markNotificationsAsRead();
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md relative transition-colors"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Notifications & Alert Logs
                    </span>
                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs ${
                            notif.type === 'emergency_quarantine' ? 'bg-rose-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.type === 'emergency_quarantine' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800 text-xs">{notif.title}</p>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {new Date(notif.timestamp).toLocaleString('en-US')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors hidden sm:block"
              title="System Settings & Audit Log"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500 mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Active Staff:</p>
                    <p className="font-bold text-slate-900 truncate mt-0.5">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                        ROLE: {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded text-left transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-teal-700" />
                      <span>Switch Google Workspace Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded text-left transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Settings & Notification Logs</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1 shadow-md">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
