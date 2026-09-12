import React, { useState, useEffect } from 'react';
import {
  Activity,
  Lock,
  Settings,
  Calculator,
  Sliders,
  HeartPulse,
  Printer,
  ShieldCheck,
  Plus,
  Cloud,
  LogOut,
  Home,
  Users,
  BedDouble,
  Archive,
  MoreHorizontal,
  Sun,
  Moon,
  Laptop,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';

import {
  SpecialtyMode,
  PatientRecord,
  AppTab
} from '../types';

import { PWAInstallButton } from '../services/pwa';
import { User } from 'firebase/auth';
import { getAppTheme, setAppTheme, applyThemeToDom, AppTheme } from '../services/storage';
import { initConnectivityListener, isDeviceOnline } from '../services/connectivity';

interface NavbarProps {
  specialtyMode: SpecialtyMode;
  onSetSpecialtyMode: (mode: SpecialtyMode) => void;

  patients: PatientRecord[];
  totalBeds: number;

  currentUser: User | null;

  cloudSyncStatus:
    | 'synced'
    | 'syncing'
    | 'offline'
    | 'error';

  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;

  theme?: AppTheme;
  onSetTheme?: (theme: AppTheme) => void;

  onOpenCloudAccount: () => void;
  onOpenNewPatientModal: () => void;
  onOpenCalculators: () => void;
  onOpenSecurity: () => void;
  onOpenCustomizer: () => void;
  onOpenApkGuide: () => void;
  onOpenPrintHandover: () => void;
  onLockSession: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  specialtyMode,
  onSetSpecialtyMode,

  patients,
  totalBeds,

  currentUser,
  cloudSyncStatus,

  activeTab,
  onTabChange,

  theme: propTheme,
  onSetTheme,

  onOpenCloudAccount,
  onOpenNewPatientModal,
  onOpenCalculators,
  onOpenSecurity,
  onOpenCustomizer,
  onOpenApkGuide,
  onOpenPrintHandover,
  onLockSession,
  onLogout
}) => {
  const occupiedCount = patients.filter(
    p =>
      !p.isDischarged &&
      p.bedNumber !== ''
  ).length;

  const criticalCount = patients.filter(
    p =>
      !p.isDischarged &&
      (
        p.status === 'critical' ||
        p.status === 'deteriorating'
      )
  ).length;

  const stableCount = patients.filter(
    p =>
      !p.isDischarged &&
      p.status === 'stable'
  ).length;

  const [localTheme, setLocalTheme] = useState<AppTheme>(() => getAppTheme());
  const theme = propTheme || localTheme;
  const [isOnline, setIsOnline] = useState<boolean>(() => isDeviceOnline());

  useEffect(() => {
    applyThemeToDom(theme);
    const cleanup = initConnectivityListener((online) => {
      setIsOnline(online);
    });
    return cleanup;
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    if (onSetTheme) {
      onSetTheme(nextTheme);
    } else {
      setLocalTheme(nextTheme);
      setAppTheme(nextTheme);
      applyThemeToDom(nextTheme);
    }
  };

  const tabs: {
    id: AppTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users
    },
    {
      id: 'beds',
      label: 'Beds',
      icon: BedDouble
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-1.5 text-center text-xs flex items-center justify-center gap-2 font-medium z-50">
          <WifiOff size={14} className="text-amber-400 animate-pulse" />
          <span>Offline Mode Active • All changes are securely saved in encrypted local notebook storage.</span>
        </div>
      )}

      {/* =========================================================
          DESKTOP / TABLET TOP HEADER
          ========================================================= */}

      <header className="hidden md:block sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">

          <div className="flex items-center justify-between gap-4">

            {/* Brand */}

            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-3 text-left min-w-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">

                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>

              </div>

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h1 className="text-sm lg:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    CardioVault
                  </h1>

                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">

                    {currentUser ? (
                      <>
                        <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Cloud Synced</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <span>Local-First</span>
                      </>
                    )}

                  </span>

                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">

                  <span>
                    Beds:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {occupiedCount}/{totalBeds}
                    </strong>
                  </span>

                  <span className="text-slate-300 dark:text-slate-600">
                    •
                  </span>

                  <span className="text-rose-600 dark:text-rose-400">
                    Critical:{' '}
                    <strong>
                      {criticalCount}
                    </strong>
                  </span>

                  <span className="text-slate-300 dark:text-slate-600">
                    •
                  </span>

                  <span className="text-emerald-600 dark:text-emerald-400">
                    Stable:{' '}
                    <strong>
                      {stableCount}
                    </strong>
                  </span>

                </p>

              </div>

            </button>

            {/* Desktop Navigation */}

            <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 p-1 rounded-xl border border-slate-200 dark:border-slate-800">

              {tabs.map(tab => {
                const Icon = tab.icon;
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      onTabChange(tab.id)
                    }
                    className={`
                      flex items-center gap-2
                      px-3 py-2 rounded-lg
                      text-xs font-semibold
                      transition-all
                      ${
                        active
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

            </nav>

            {/* Quick Actions */}

            <div className="flex items-center gap-1.5">

              <button
                onClick={onOpenNewPatientModal}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
                title="Admit new patient"
              >
                <Plus className="w-4 h-4" />
                <span>Admit</span>
              </button>

              <button
                onClick={onOpenCloudAccount}
                className={`
                  p-2 rounded-lg border transition
                  ${
                    currentUser
                      ? 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 border-cyan-200 dark:border-cyan-700/70 text-cyan-700 dark:text-cyan-200'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }
                `}
                title={
                  currentUser
                    ? `Cloud Linked: ${currentUser.email || ''}`
                    : 'Link Cloud Account & Sync'
                }
              >
                <Cloud
                  className={`
                    w-4 h-4
                    ${
                      cloudSyncStatus === 'syncing'
                        ? 'animate-bounce text-cyan-500 dark:text-cyan-400'
                        : currentUser
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-slate-400'
                    }
                  `}
                />
              </button>

              <button
                onClick={onOpenCalculators}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition"
                title="Clinical Calculators"
              >
                <Calculator className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </button>

              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition"
                title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Laptop className="w-4 h-4 text-emerald-500" />
                )}
              </button>

              <button
                onClick={() =>
                  onTabChange('settings')
                }
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition"
                title="Settings"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Specialty Switcher */}

          <div className="flex items-center justify-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">

            <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">

              <button
                onClick={() =>
                  onSetSpecialtyMode('all')
                }
                className={`
                  px-4 py-1.5 rounded-lg
                  font-medium transition
                  ${
                    specialtyMode === 'all'
                      ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                All Systems
              </button>

              <button
                onClick={() =>
                  onSetSpecialtyMode('ccu')
                }
                className={`
                  px-4 py-1.5 rounded-lg
                  font-medium flex items-center
                  gap-1.5 transition
                  ${
                    specialtyMode === 'ccu'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                CCU Cardiology
              </button>

              <button
                onClick={() =>
                  onSetSpecialtyMode('icu')
                }
                className={`
                  px-4 py-1.5 rounded-lg
                  font-medium flex items-center
                  gap-1.5 transition
                  ${
                    specialtyMode === 'icu'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <Activity className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                ICU Critical Care
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =========================================================
          MOBILE TOP HEADER
          ========================================================= */}

      <header className="md:hidden sticky top-0 z-30 pt-[max(env(safe-area-inset-top),0.5rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

        <div className="px-4 py-2.5">

          <div className="flex items-center justify-between gap-3">

            <button
              onClick={() =>
                onTabChange('home')
              }
              className="flex items-center gap-2.5 min-w-0"
            >

              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0 shadow-sm">

                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>

              </div>

              <div className="text-left min-w-0">

                <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  CardioVault
                </h1>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">

                  {occupiedCount}/{totalBeds} beds

                  <span className="mx-1 text-slate-300 dark:text-slate-600">
                    •
                  </span>

                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    {criticalCount} critical
                  </span>

                </p>

              </div>

            </button>

            <div className="flex items-center gap-1.5 shrink-0">

              <button
                onClick={onOpenNewPatientModal}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95 shadow-sm"
                title="Admit Patient"
              >
                <Plus className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCloudAccount}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                title="Cloud Account"
              >
                <Cloud
                  className={`
                    w-4 h-4
                    ${
                      cloudSyncStatus === 'syncing'
                        ? 'animate-bounce text-cyan-500 dark:text-cyan-400'
                        : currentUser
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-slate-400'
                    }
                  `}
                />
              </button>

              <button
                onClick={handleToggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
                title={`Theme: ${theme.toUpperCase()}`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Laptop className="w-4 h-4 text-emerald-500" />
                )}
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION (NON-OVERLAPPING)
          ========================================================= */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] transition-colors">

        <div className="max-w-lg mx-auto px-1 pb-[env(safe-area-inset-bottom)]">

          <div className="flex items-center justify-between h-[64px]">

            {/* 1. Home */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition min-w-0 ${
                activeTab === 'home'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Home className={`w-5 h-5 shrink-0 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight truncate">Home</span>
            </button>

            {/* 2. Patients */}
            <button
              onClick={() => onTabChange('patients')}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition min-w-0 ${
                activeTab === 'patients'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className={`w-5 h-5 shrink-0 ${activeTab === 'patients' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight truncate">Patients</span>
            </button>

            {/* 3. Central Add Patient (+) Button (Dedicated non-overlapping slot) */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <button
                onClick={onOpenNewPatientModal}
                className="w-11 h-11 -mt-3.5 rounded-full bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white shadow-lg shadow-cyan-600/30 border-2 border-white dark:border-slate-900 flex items-center justify-center transition"
                title="Admit Patient"
                aria-label="Admit Patient"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
              <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 tracking-tight">
                Admit
              </span>
            </div>

            {/* 4. Beds (Completely unblocked, unobstructed) */}
            <button
              onClick={() => onTabChange('beds')}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition min-w-0 ${
                activeTab === 'beds'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BedDouble className={`w-5 h-5 shrink-0 ${activeTab === 'beds' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight truncate">Beds</span>
            </button>

            {/* 5. Archive */}
            <button
              onClick={() => onTabChange('archive')}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition min-w-0 ${
                activeTab === 'archive'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Archive className={`w-5 h-5 shrink-0 ${activeTab === 'archive' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight truncate">Archive</span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => onTabChange('settings')}
              className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition min-w-0 ${
                activeTab === 'settings'
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight truncate">Settings</span>
            </button>

          </div>

        </div>

      </nav>

      {/* =========================================================
          Hidden Utility Actions
          ========================================================= */}

      <div className="hidden">

        <button onClick={onOpenSecurity}>
          <Lock />
        </button>

        <button onClick={onOpenCustomizer}>
          <Sliders />
        </button>

        <button onClick={onOpenApkGuide}>
          <Activity />
        </button>

        <button onClick={onOpenPrintHandover}>
          <Printer />
        </button>

        <button onClick={onLockSession}>
          <Lock />
        </button>

        <button onClick={onLogout}>
          <LogOut />
        </button>

        <PWAInstallButton />

      </div>

    </>
  );
};
