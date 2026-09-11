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

  const [theme, setThemeState] = useState<AppTheme>(() => getAppTheme());
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
    setThemeState(nextTheme);
    setAppTheme(nextTheme);
    applyThemeToDom(nextTheme);
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

      <header className="hidden md:block sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">

          <div className="flex items-center justify-between gap-4">

            {/* Brand */}

            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-3 text-left min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0 shadow-sm">

                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400" />
                </div>

              </div>

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h1 className="text-sm lg:text-base font-bold text-white tracking-tight truncate">
                    CardioVault
                  </h1>

                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">

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

                  <span>
                    Beds:{' '}
                    <strong className="text-slate-200">
                      {occupiedCount}/{totalBeds}
                    </strong>
                  </span>

                  <span className="text-slate-600">
                    •
                  </span>

                  <span className="text-rose-400">
                    Critical:{' '}
                    <strong>
                      {criticalCount}
                    </strong>
                  </span>

                  <span className="text-slate-600">
                    •
                  </span>

                  <span className="text-emerald-400">
                    Stable:{' '}
                    <strong>
                      {stableCount}
                    </strong>
                  </span>

                </p>

              </div>

            </button>

            {/* Desktop Navigation */}

            <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">

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
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
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
                      ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700/70 text-cyan-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
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
                        ? 'animate-bounce text-cyan-400'
                        : currentUser
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                    }
                  `}
                />
              </button>

              <button
                onClick={onOpenCalculators}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition"
                title="Clinical Calculators"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
                title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Laptop className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              <button
                onClick={() =>
                  onTabChange('settings')
                }
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
                title="Settings"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Specialty Switcher */}

          <div className="flex items-center justify-center mt-3 pt-3 border-t border-slate-800">

            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">

              <button
                onClick={() =>
                  onSetSpecialtyMode('all')
                }
                className={`
                  px-4 py-1.5 rounded-lg
                  font-medium transition
                  ${
                    specialtyMode === 'all'
                      ? 'bg-slate-800 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
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
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
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
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                ICU Critical Care
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =========================================================
          MOBILE TOP HEADER
          ========================================================= */}

      <header className="md:hidden sticky top-0 z-30 pt-[env(safe-area-inset-top)] bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">

        <div className="px-4 py-3">

          <div className="flex items-center justify-between gap-3">

            <button
              onClick={() =>
                onTabChange('home')
              }
              className="flex items-center gap-2.5 min-w-0"
            >

              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0">

                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-cyan-400" />
                </div>

              </div>

              <div className="text-left min-w-0">

                <h1 className="text-sm font-bold text-white truncate">
                  CardioVault
                </h1>

                <p className="text-[10px] text-slate-400">

                  {occupiedCount}/{totalBeds} beds

                  <span className="mx-1 text-slate-600">
                    •
                  </span>

                  <span className="text-rose-400">
                    {criticalCount} critical
                  </span>

                </p>

              </div>

            </button>

            <div className="flex items-center gap-1.5 shrink-0">

              <button
                onClick={onOpenNewPatientModal}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95"
                title="Admit Patient"
              >
                <Plus className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCloudAccount}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700"
                title="Cloud Account"
              >
                <Cloud
                  className={`
                    w-4 h-4
                    ${
                      cloudSyncStatus === 'syncing'
                        ? 'animate-bounce text-cyan-400'
                        : currentUser
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                    }
                  `}
                />
              </button>

              <button
                onClick={handleToggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Laptop className="w-4 h-4 text-emerald-400" />
                )}
              </button>

            </div>

          </div>

    

        </div>

      </header>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION
          ========================================================= */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">

        <div className="relative max-w-lg mx-auto px-2 pb-[env(safe-area-inset-bottom)]">

          {/* Floating Add Patient */}

          <button
            onClick={onOpenNewPatientModal}
            className="
              absolute
              left-1/2
              -translate-x-1/2
              -top-7
              w-14
              h-14
              rounded-full
              bg-cyan-600
              hover:bg-cyan-500
              text-white
              shadow-lg
              shadow-cyan-950/40
              border-4
              border-slate-950
              flex
              items-center
              justify-center
              transition
              active:scale-90
            "
            title="Add Patient"
          >
            <Plus className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-5 h-[68px]">

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
                    flex flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-xl
                    transition
                    ${
                      active
                        ? 'text-cyan-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5
                      ${
                        active
                          ? 'stroke-[2.5]'
                          : ''
                      }
                    `}
                  />

                  <span className="text-[9px] font-semibold">
                    {tab.label}
                  </span>

                </button>
              );
            })}

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
