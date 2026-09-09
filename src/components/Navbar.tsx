import React from 'react';
import { 
  Activity, 
  Lock, 
  Settings, 
  Calculator, 
  Sliders, 
  HeartPulse, 
  Stethoscope, 
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Plus,
  Cloud
} from 'lucide-react';
import { SpecialtyMode, PatientRecord } from '../types';
import { PWAInstallButton } from '../services/pwa';
import { User } from 'firebase/auth';

interface NavbarProps {
  specialtyMode: SpecialtyMode;
  onSetSpecialtyMode: (mode: SpecialtyMode) => void;
  patients: PatientRecord[];
  totalBeds: number;
  currentUser: User | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  onOpenCloudAccount: () => void;
  onOpenNewPatientModal: () => void;
  onOpenCalculators: () => void;
  onOpenSecurity: () => void;
  onOpenCustomizer: () => void;
  onOpenApkGuide: () => void;
  onOpenPrintHandover: () => void;
  onLockSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  specialtyMode,
  onSetSpecialtyMode,
  patients,
  totalBeds,
  currentUser,
  cloudSyncStatus,
  onOpenCloudAccount,
  onOpenNewPatientModal,
  onOpenCalculators,
  onOpenSecurity,
  onOpenCustomizer,
  onOpenApkGuide,
  onOpenPrintHandover,
  onLockSession
}) => {
  const occupiedCount = patients.length;
  const criticalCount = patients.filter(p => p.status === 'critical' || p.status === 'deteriorating').length;
  const stableCount = patients.filter(p => p.status === 'stable').length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & ICU Census Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  ICU & CCU Clinical Notebook
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {currentUser ? (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>Local-First</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Beds: <strong className="text-slate-200">{occupiedCount}/{totalBeds}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">Critical: <strong>{criticalCount}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">Stable: <strong>{stableCount}</strong></span>
              </p>
            </div>
          </div>

          {/* Specialty View Switcher (CCU vs ICU vs All) */}
          <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onSetSpecialtyMode('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                specialtyMode === 'all'
                  ? 'bg-slate-800 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Systems
            </button>
            <button
              onClick={() => onSetSpecialtyMode('ccu')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition ${
                specialtyMode === 'ccu'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              CCU Cardiology
            </button>
            <button
              onClick={() => onSetSpecialtyMode('icu')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition ${
                specialtyMode === 'icu'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              ICU Critical Care
            </button>
          </div>

          {/* Action buttons & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cloud Sync & Account Button */}
            <button
              onClick={onOpenCloudAccount}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                currentUser
                  ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700/70 text-cyan-200'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={currentUser ? `Cloud Linked: ${currentUser.email}` : 'Link Cloud Account & Sync'}
            >
              <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-bounce text-cyan-400' : currentUser ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline">
                {currentUser ? (
                  <span className="flex items-center gap-1.5">
                    <span>{currentUser.displayName || currentUser.email?.split('@')[0] || 'Cloud'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </span>
                ) : (
                  'ربط سحابي'
                )}
              </span>
            </button>

            {/* Quick Admit Button */}
            <button
              onClick={onOpenNewPatientModal}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
              title="Admit new patient to bed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admit Patient</span>
              <span className="sm:hidden">Admit</span>
            </button>

            {/* Calculators Button */}
            <button
              onClick={onOpenCalculators}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition"
              title="Clinical Calculators (SOFA, GCS, RASS, ABG)"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Calculators</span>
            </button>

            {/* Customizer */}
            <button
              onClick={onOpenCustomizer}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition"
              title="Customize Fields & Sections"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Fields</span>
            </button>

            {/* Print Handover Sheet */}
            <button
              onClick={onOpenPrintHandover}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition"
              title="Print Census Handover Sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden xl:inline">Handover Print</span>
            </button>

            {/* PWA / APK Install Button */}
            <PWAInstallButton onShowApkGuide={onOpenApkGuide} />

            {/* Security & Backup settings */}
            <button
              onClick={onOpenSecurity}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
              title="Security, PIN & Encrypted Backup"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Lock Session */}
            <button
              onClick={onLockSession}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-slate-700/80 transition"
              title="Lock Session Now"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Specialty Switcher bar */}
        <div className="md:hidden flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-800 text-[11px]">
          <button
            onClick={() => onSetSpecialtyMode('all')}
            className={`flex-1 py-1 rounded text-center font-medium ${
              specialtyMode === 'all' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            All Fields
          </button>
          <button
            onClick={() => onSetSpecialtyMode('ccu')}
            className={`flex-1 py-1 rounded text-center font-medium flex items-center justify-center gap-1 ${
              specialtyMode === 'ccu' ? 'bg-rose-950 text-rose-300' : 'text-slate-400'
            }`}
          >
            <HeartPulse className="w-3 h-3 text-rose-400" />
            CCU
          </button>
          <button
            onClick={() => onSetSpecialtyMode('icu')}
            className={`flex-1 py-1 rounded text-center font-medium flex items-center justify-center gap-1 ${
              specialtyMode === 'icu' ? 'bg-blue-950 text-blue-300' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3 h-3 text-blue-400" />
            ICU
          </button>
        </div>
      </div>
    </header>
  );
};
