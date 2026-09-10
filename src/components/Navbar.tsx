import React from 'react';
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
  MoreHorizontal
} from 'lucide-react';

import {
  SpecialtyMode,
  PatientRecord,
  AppTab
} from '../types';

import { PWAInstallButton } from '../services/pwa';
import { User } from 'firebase/auth';

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

  const tabs: {
    id: AppTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'home',
      label: 'Home',
