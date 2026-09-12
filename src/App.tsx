import React, { useState, useEffect, useCallback } from 'react';
import {
  PatientRecord,
  SpecialtyMode,
  FieldVisibilityConfig,
  AppSecuritySettings,
  DischargeDetails,
  BedStatus,
  ProgressNote,
  AppTab
} from './types';

import {
  getSecuritySettings,
  getFieldConfig,
  saveFieldConfig,
  loadPatients,
  savePatients
} from './services/storage';

import { LockScreen } from './components/LockScreen';
import { Navbar } from './components/Navbar';
import { CensusView } from './components/CensusView';
import PatientFileModal from './components/PatientFileModal';
import { ClinicalCalculatorsModal } from './components/ClinicalCalculatorsModal';
import { FieldCustomizerModal } from './components/FieldCustomizerModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { PrintableView } from './components/PrintableView';
import { AdmitPatientModal } from './components/AdmitPatientModal';
import { DischargePatientModal } from './components/DischargePatientModal';
import { ReadmitPatientModal } from './components/ReadmitPatientModal';
import { CloudAccountModal } from './components/CloudAccountModal';
import { LoginScreen } from './components/LoginScreen';

import { User } from 'firebase/auth';

import {
  HeartPulse,
  Users,
  BedDouble,
  Archive,
  Settings,
  Search,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Cloud,
  RefreshCw,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

import {
  subscribeToAuth,
  fetchCloudPatients,
  savePatientToCloud,
  deletePatientFromCloud,
  syncAllPatientsToCloud,
  saveUserSettingsToCloud,
  fetchUserSettingsFromCloud,
  logoutUser
} from './services/firebase';

export default function App() {
  // =========================================================
  // Security
  // =========================================================

  const [securitySettings, setSecuritySettings] =
    useState<AppSecuritySettings>(() => getSecuritySettings());

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<string>('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // =========================================================
  // Firebase / Cloud
  // =========================================================

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOfflineBypassed, setIsOfflineBypassed] =
    useState<boolean>(false);

  const [cloudSyncStatus, setCloudSyncStatus] =
    useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');

  const [showCloudAccountModal, setShowCloudAccountModal] =
    useState<boolean>(false);

  // =========================================================
  // Clinical State
  // =========================================================

  const [patients, setPatients] = useState<PatientRecord[]>([]);

  const [totalBeds, setTotalBeds] = useState<number>(() => {
    const saved = localStorage.getItem('icu_total_beds');
    const parsed = saved ? Number(saved) : 6;
    return Number.isFinite(parsed) ? Math.max(3, parsed) : 6;
  });

  const [specialtyMode, setSpecialtyMode] =
    useState<SpecialtyMode>('all');

  const [activeTab, setActiveTab] =
    useState<AppTab>('home');

  const [fieldConfig, setFieldConfig] =
    useState<FieldVisibilityConfig>(() => getFieldConfig());

  const [patientSearch, setPatientSearch] =
    useState<string>('');

  // =========================================================
  // Modals
  // =========================================================

  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>(null);

  const [admitBedNumber, setAdmitBedNumber] =
    useState<number | null>(null);

  const [patientToDischarge, setPatientToDischarge] =
    useState<PatientRecord | null>(null);

  const [patientToReadmit, setPatientToReadmit] =
    useState<PatientRecord | null>(null);

  const [showCalculators, setShowCalculators] =
    useState<boolean>(false);

  const [showCustomizer, setShowCustomizer] =
    useState<boolean>(false);

  const [showSecurityModal, setShowSecurityModal] =
    useState<boolean>(false);

  const [showApkModal, setShowApkModal] =
    useState<boolean>(false);

  const [showPrintView, setShowPrintView] =
    useState<boolean>(false);

  const [patientToPrint, setPatientToPrint] =
    useState<PatientRecord | null>(null);

  // =========================================================
  // Unlock
  // =========================================================

  const handleUnlockSuccess = async (pin: string) => {
    setActivePin(pin);
    setIsUnlocked(true);
    setLastActivity(Date.now());

    try {
      const loaded = await loadPatients(pin);

      // If the user is logged in, restore patients from Cloud first.
      if (currentUser) {
        try {
          const cloudData = await fetchCloudPatients(
            currentUser.uid
          );

          if (cloudData.length > 0) {
            setPatients(cloudData);

            // Save the restored Cloud data locally
            // using the current PIN.
            await savePatients(
              cloudData,
              pin
            );

            setCloudSyncStatus('synced');
            return;
          }
        } catch (cloudErr) {
          console.error(
            'Failed to restore patients from cloud:',
            cloudErr
          );
        }
      }

      // If there is no Cloud data, use local data.
      setPatients(loaded);
    } catch (err) {
      console.error(
        'Failed to load patient records',
        err
      );
    }
  };

  // =========================================================
  // Auth
  // =========================================================

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        setIsUnlocked(true);
        setCloudSyncStatus('syncing');

        try {
          const cloudData = await fetchCloudPatients(user.uid);
          const cloudSettings = await fetchUserSettingsFromCloud(user.uid);

          if (cloudData && cloudData.length > 0) {
            setPatients(cloudData);

            if (activePin) {
              await savePatients(cloudData, activePin);
            }
          } else if (patients.length > 0) {
            await syncAllPatientsToCloud(
              user.uid,
              patients
            );
          }

          if (cloudSettings) {
            if (typeof cloudSettings.totalBeds === 'number') {
              const safeBeds = Math.max(
                3,
                Math.floor(cloudSettings.totalBeds)
              );
              setTotalBeds(safeBeds);
              localStorage.setItem(
                'icu_total_beds',
                String(safeBeds)
              );
            }

            if (
              cloudSettings.specialtyMode === 'all' ||
              cloudSettings.specialtyMode === 'ccu' ||
              cloudSettings.specialtyMode === 'icu'
            ) {
              setSpecialtyMode(cloudSettings.specialtyMode);
            }

            if (cloudSettings.fieldConfig) {
              setFieldConfig(cloudSettings.fieldConfig);
              saveFieldConfig(cloudSettings.fieldConfig);
            }
          } else {
            await saveUserSettingsToCloud(user.uid, {
              totalBeds,
              specialtyMode,
              fieldConfig
            });
          }

          setCloudSyncStatus('synced');
        } catch (err) {
          console.error(
            'Failed to sync cloud patients:',
            err
          );

          setCloudSyncStatus('error');
        }
      } else {
        setCloudSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, [activePin]);

  // =========================================================
  // Lock
  // =========================================================

  const handleLockApp = useCallback(() => {
    setIsUnlocked(false);
    setActivePin('');

    setSelectedPatientId(null);
    setAdmitBedNumber(null);

    setShowCalculators(false);
    setShowCustomizer(false);
    setShowSecurityModal(false);
    setShowPrintView(false);
    setShowCloudAccountModal(false);

    setSecuritySettings(getSecuritySettings());
  }, []);

  // =========================================================
  // Logout
  // =========================================================

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }

    setCurrentUser(null);
    setIsOfflineBypassed(false);
    setIsUnlocked(false);
    setActivePin('');
    setPatients([]);

    setSelectedPatientId(null);
    setAdmitBedNumber(null);
    setShowCloudAccountModal(false);

    setActiveTab('home');
  }, []);

  // =========================================================
  // Save patients
  // =========================================================

  const updatePatients = useCallback(
    async (newPatients: PatientRecord[]) => {
      setPatients(newPatients);

      if (activePin) {
        await savePatients(newPatients, activePin);
      }

      if (currentUser) {
        setCloudSyncStatus('syncing');

        try {
          await syncAllPatientsToCloud(
            currentUser.uid,
            newPatients
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error('Cloud batch sync error:', e);
          setCloudSyncStatus('error');
        }
      }
    },
    [activePin, currentUser]
  );

  // =========================================================
  // Update patient
  // =========================================================

  const handleUpdatePatient = useCallback(
    async (updatedPatient: PatientRecord) => {
      const nextPatients = patients.map((p) =>
        p.id === updatedPatient.id
          ? updatedPatient
          : p
      );

      setPatients(nextPatients);

      if (activePin) {
        await savePatients(nextPatients, activePin);
      }

      if (currentUser) {
        setCloudSyncStatus('syncing');

        try {
          await savePatientToCloud(
            currentUser.uid,
            updatedPatient
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error('Cloud save failed:', e);
          setCloudSyncStatus('error');
        }
      }
    },
    [patients, activePin, currentUser]
  );

  // =========================================================
  // Delete patient
  // =========================================================

  const handleDeletePatient = useCallback(
    async (patientId: string) => {
      const nextPatients = patients.filter(
        (p) => p.id !== patientId
      );

      setPatients(nextPatients);

      if (activePin) {
        await savePatients(nextPatients, activePin);
      }

      if (selectedPatientId === patientId) {
        setSelectedPatientId(null);
      }

      if (currentUser) {
        setCloudSyncStatus('syncing');

        try {
          await deletePatientFromCloud(
            currentUser.uid,
            patientId
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error('Cloud delete failed:', e);
          setCloudSyncStatus('error');
        }
      }
    },
    [
      patients,
      activePin,
      selectedPatientId,
      currentUser
    ]
  );

  // =========================================================
  // Admit
  // =========================================================

  const handleAdmitPatient = useCallback(
    async (newPatient: PatientRecord) => {
      const filtered = patients.filter(
        (p) =>
          p.isDischarged ||
          Number(p.bedNumber) !==
            Number(newPatient.bedNumber)
      );

      const next = [...filtered, newPatient];

      setPatients(next);

      if (activePin) {
        await savePatients(next, activePin);
      }

      setAdmitBedNumber(null);

      if (currentUser) {
        setCloudSyncStatus('syncing');

        try {
          await savePatientToCloud(
            currentUser.uid,
            newPatient
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error(
            'Cloud admit save failed:',
            e
          );

          setCloudSyncStatus('error');
        }
      }
    },
    [patients, activePin, currentUser]
  );

  // =========================================================
  // Discharge
  // =========================================================

  const handleDischargePatient = useCallback(
    async (
      patientId: string,
      details: DischargeDetails
    ) => {
      let dischargedRecord: PatientRecord | null = null;

      const now = new Date();

      const mm = String(
        now.getMonth() + 1
      ).padStart(2, '0');

      const dd = String(
        now.getDate()
      ).padStart(2, '0');

      const timeStr =
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

      const next = patients.map((p) => {
        if (p.id !== patientId) return p;

        const dischargeNote: ProgressNote = {
          id: `note-${Date.now()}`,

          timestamp:
            `${mm}/${dd} — ${timeStr}`,

          author:
            details.dischargedBy ||
            p.attendingPhysician ||
            'Attending Physician',

          tag: 'Handover',

          subjective:
            `Discharge protocol executed. Destination: ${details.disposition}.`,

          objective:
            `Condition at discharge: ${details.conditionAtDischarge}. Discharged from Bed ${p.bedNumber}.`,

          assessment:
            `Discharged from ICU/CCU. Diagnosis: ${p.primaryDiagnosis}.`,

          plan:
            `Summary: ${details.dischargeSummary}\n` +
            `Floor/Discharge Meds: ${details.dischargeMedications || 'See list'}\n` +
            `Follow-up: ${details.followUpInstructions || 'Routine follow-up'}`
        };

        const updated: PatientRecord = {
          ...p,
          isDischarged: true,
          previousBedNumber: p.bedNumber,
          bedNumber: '',
          status: 'discharged' as BedStatus,
          dischargeDetails: details,
          progressNotes: [
            ...p.progressNotes,
            dischargeNote
          ],
          lastUpdated:
            `${now.toISOString().slice(0, 10)} ${timeStr}`
        };

        dischargedRecord = updated;

        return updated;
      });

      setPatients(next);

      if (activePin) {
        await savePatients(next, activePin);
      }

      setPatientToDischarge(null);

      if (currentUser && dischargedRecord) {
        setCloudSyncStatus('syncing');

        try {
          await savePatientToCloud(
            currentUser.uid,
            dischargedRecord
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error(
            'Cloud discharge save failed:',
            e
          );

          setCloudSyncStatus('error');
        }
      }
    },
    [patients, activePin, currentUser]
  );

  // =========================================================
  // Readmit
  // =========================================================

  const handleReadmitPatient = useCallback(
    async (
      patientId: string,
      targetBedNumber: number,
      status: BedStatus
    ) => {
      const isOccupied = patients.some(
        (p) =>
          !p.isDischarged &&
          Number(p.bedNumber) ===
            Number(targetBedNumber)
      );

      if (isOccupied) {
        alert(
          `Bed ${targetBedNumber} is currently occupied! Please select an empty bed.`
        );
        return;
      }

      let readmittedRecord: PatientRecord | null = null;

      const now = new Date();

      const mm = String(
        now.getMonth() + 1
      ).padStart(2, '0');

      const dd = String(
        now.getDate()
      ).padStart(2, '0');

      const timeStr =
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

      const next = patients.map((p) => {
        if (p.id !== patientId) return p;

        const readmitNote: ProgressNote = {
          id: `note-${Date.now()}`,

          timestamp:
            `${mm}/${dd} — ${timeStr}`,

          author:
            p.attendingPhysician ||
            'Attending Physician',

          tag: 'Round',

          subjective:
            `Patient re-admitted to intensive care (Assigned Bed ${targetBedNumber}).`,

          objective:
            `Re-admission evaluation. Continuous hemodynamic monitoring initiated.`,

          assessment:
            `Active ICU/CCU clinical management resumed for ${p.primaryDiagnosis}.`,

          plan:
            '1. Connected to bedside telemetry & monitoring\n' +
            '2. Vital signs and laboratory panel reassessment\n' +
            '3. Continue targeted protocol'
        };

        const updated: PatientRecord = {
          ...p,

          isDischarged: false,

          bedNumber: targetBedNumber,

          status,

          progressNotes: [
            ...p.progressNotes,
            readmitNote
          ],

          lastUpdated:
            `${now.toISOString().slice(0, 10)} ${timeStr}`
        };

        readmittedRecord = updated;

        return updated;
      });

      setPatients(next);

      if (activePin) {
        await savePatients(next, activePin);
      }

      setPatientToReadmit(null);

      if (currentUser && readmittedRecord) {
        setCloudSyncStatus('syncing');

        try {
          await savePatientToCloud(
            currentUser.uid,
            readmittedRecord
          );

          setCloudSyncStatus('synced');
        } catch (e) {
          console.error(
            'Cloud readmit save failed:',
            e
          );

          setCloudSyncStatus('error');
        }
      }
    },
    [patients, activePin, currentUser]
  );

  // =========================================================
  // Cloud Sync
  // =========================================================

  const handleManualSync = async () => {
    if (!currentUser) return;

    setCloudSyncStatus('syncing');

    try {
      await syncAllPatientsToCloud(
        currentUser.uid,
        patients
      );

      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Manual sync failed:', err);
      setCloudSyncStatus('error');
    }
  };

  const handlePullCloudData = async () => {
    if (!currentUser) return;

    setCloudSyncStatus('syncing');

    try {
      const cloudData =
        await fetchCloudPatients(currentUser.uid);

      setPatients(cloudData);

      if (activePin) {
        await savePatients(
          cloudData,
          activePin
        );
      }

      setCloudSyncStatus('synced');
    } catch (err) {
      console.error(
        'Pull cloud data failed:',
        err
      );

      setCloudSyncStatus('error');
    }
  };

  // =========================================================
  // Beds
  // =========================================================

  const handleChangeTotalBeds = (
    newCount: number
  ) => {
    const safeCount = Math.max(
      3,
      Math.floor(newCount)
    );

    setTotalBeds(safeCount);

    localStorage.setItem(
      'icu_total_beds',
      String(safeCount)
    );

    if (currentUser) {
      saveUserSettingsToCloud(currentUser.uid, {
        totalBeds: safeCount
      }).catch((err) => {
        console.error('Failed to sync bed settings:', err);
      });
    }
  };

  const handleUpdatePatientBed = useCallback(
    async (patientId: string, newBedNumber: string | number) => {
      const targetPatient = patients.find((p) => p.id === patientId);
      if (!targetPatient) return;
      const updated: PatientRecord = {
        ...targetPatient,
        bedNumber: String(newBedNumber)
      };
      await handleUpdatePatient(updated);
    },
    [patients, handleUpdatePatient]
  );

  // =========================================================
  // Field Config
  // =========================================================

  const handleSaveFieldConfig = (
    newConfig: FieldVisibilityConfig
  ) => {
    setFieldConfig(newConfig);
    saveFieldConfig(newConfig);

    if (currentUser) {
      saveUserSettingsToCloud(currentUser.uid, {
        fieldConfig: newConfig
      }).catch((err) => {
        console.error('Failed to sync field configuration:', err);
      });
    }
  };

  // =========================================================
  // Auto Lock
  // =========================================================

  useEffect(() => {
    if (!isUnlocked) return;

    const updateActivity = () =>
      setLastActivity(Date.now());

    window.addEventListener(
      'mousemove',
      updateActivity,
      { passive: true }
    );

    window.addEventListener(
      'touchstart',
      updateActivity,
      { passive: true }
    );

    window.addEventListener(
      'keydown',
      updateActivity,
      { passive: true }
    );

    window.addEventListener(
      'click',
      updateActivity,
      { passive: true }
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (
          securitySettings.autoLockMinutes === 0
        ) {
          handleLockApp();
        }
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    const interval = setInterval(() => {
      if (
        securitySettings.autoLockMinutes > 0
      ) {
        const inactiveMs =
          Date.now() - lastActivity;

        const limitMs =
          securitySettings.autoLockMinutes *
          60 *
          1000;

        if (inactiveMs >= limitMs) {
          handleLockApp();
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener(
        'mousemove',
        updateActivity
      );

      window.removeEventListener(
        'touchstart',
        updateActivity
      );

      window.removeEventListener(
        'keydown',
        updateActivity
      );

      window.removeEventListener(
        'click',
        updateActivity
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      clearInterval(interval);
    };
  }, [
    isUnlocked,
    lastActivity,
    securitySettings.autoLockMinutes,
    handleLockApp
  ]);

  // =========================================================
  // Derived Data
  // =========================================================

  const activePatients = patients.filter(
    (p) => !p.isDischarged
  );

  const archivedPatients = patients.filter(
    (p) => p.isDischarged
  );

  const occupiedPatients = activePatients.filter(
    (p) =>
      p.bedNumber !== '' &&
      p.bedNumber !== null &&
      p.bedNumber !== undefined
  );

  const occupiedCount = occupiedPatients.length;

  const availableCount =
    Math.max(
      0,
      totalBeds - occupiedCount
    );

  const criticalCount =
    activePatients.filter(
      (p) =>
        p.status === 'critical' ||
        p.status === 'deteriorating'
    ).length;

  const stableCount =
    activePatients.filter(
      (p) => p.status === 'stable'
    ).length;

  const guardedCount =
    activePatients.filter(
      (p) => p.status === 'guarded'
    ).length;

  const occupiedBedNumbers = new Set(
    occupiedPatients.map(
      (p) => Number(p.bedNumber)
    )
  );

  const availableBeds = Array.from(
    { length: totalBeds },
    (_, i) => i + 1
  ).filter(
    (b) => !occupiedBedNumbers.has(b)
  );

  const activePatientRecord = selectedPatientId
    ? patients.find(
        (p) => p.id === selectedPatientId
      ) || null
    : null;

  const filteredPatients = patients.filter((p) => {
    const q =
      patientSearch
        .trim()
        .toLowerCase();

    if (!q) return true;

    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.primaryDiagnosis
        .toLowerCase()
        .includes(q) ||
      String(p.bedNumber)
        .toLowerCase()
        .includes(q)
    );
  });

  // =========================================================
  // Small UI Components
  // =========================================================

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    onClick
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    subtitle: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className="
        w-full text-left
        rounded-2xl
        border border-slate-800
        bg-slate-900/80
        p-4
        hover:bg-slate-800/80
        transition
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p className="text-2xl font-bold text-white mt-1">
            {value}
          </p>

          <p className="text-[11px] text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
    </button>
  );

  const PatientRow = ({
    patient,
    archived = false
  }: {
    patient: PatientRecord;
    archived?: boolean;
    key?: React.Key;
  }) => (
    <button
      onClick={() =>
        setSelectedPatientId(patient.id)
      }
      className="
        w-full
        text-left
        p-4
        rounded-2xl
        border border-slate-800
        bg-slate-900/80
        hover:bg-slate-800
        transition
      "
    >
      <div className="flex items-center gap-3">
        <div className="
          w-11 h-11
          rounded-xl
          bg-slate-800
          flex items-center justify-center
          shrink-0
        ">
          <HeartPulse className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white truncate">
              {patient.name || 'Unnamed Patient'}
            </p>

            {!archived && (
              <span className={`
                text-[9px]
                px-2 py-0.5
                rounded-full
                ${
                  patient.status === 'critical' ||
                  patient.status === 'deteriorating'
                    ? 'bg-rose-950 text-rose-300'
                    : patient.status === 'stable'
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-amber-950 text-amber-300'
                }
              `}>
                {patient.status}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1 truncate">
            {patient.primaryDiagnosis || 'No diagnosis recorded'}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-500">
            <span>
              ID: {patient.mrn || '—'}
            </span>

            <span>
              {patient.age || '—'} yrs
            </span>

            {patient.bedNumber !== '' && (
              <span>
                Bed {patient.bedNumber}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
      </div>
    </button>
  );

  // =========================================================
  // Home Page
  // =========================================================

  const HomePage = () => (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            Clinical Dashboard
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            CardioVault
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ICU & CCU patient management
          </p>
        </div>

        <button
          onClick={() =>
            setAdmitBedNumber(
              availableBeds[0] || 1
            )
          }
          className="
            flex items-center justify-center gap-2
            bg-cyan-600
            hover:bg-cyan-500
            text-slate-900 dark:text-white
            px-4 py-3
            rounded-xl
            font-semibold
            text-sm
          "
        >
          <Plus className="w-4 h-4" />
          Admit Patient
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Beds"
          value={totalBeds}
          subtitle={`${occupiedCount} occupied`}
          icon={BedDouble}
          onClick={() =>
            setActiveTab('beds')
          }
        />

        <StatCard
          title="Available"
          value={availableCount}
          subtitle="Beds available"
          icon={CheckCircle2}
          onClick={() =>
            setActiveTab('beds')
          }
        />

        <StatCard
          title="Critical"
          value={criticalCount}
          subtitle="Critical / deteriorating"
          icon={AlertTriangle}
          onClick={() =>
            setActiveTab('patients')
          }
        />

        <StatCard
          title="Archive"
          value={archivedPatients.length}
          subtitle="Discharged cases"
          icon={Archive}
          onClick={() =>
            setActiveTab('archive')
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Current Patients
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Active ICU / CCU cases
              </p>
            </div>

            <button
              onClick={() =>
                setActiveTab('patients')
              }
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              View all
            </button>
          </div>

          {activePatients.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-700 mx-auto" />

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                No active patients
              </p>

              <button
                onClick={() =>
                  setAdmitBedNumber(
                    availableBeds[0] || 1
                  )
                }
                className="text-xs text-cyan-400 mt-2"
              >
                Add first patient
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {activePatients
                .slice(0, 5)
                .map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">

          <h3 className="font-semibold text-slate-900 dark:text-white">
            Bed Overview
          </h3>

          <div className="mt-4 space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Occupied
              </span>

              <span className="text-sm font-semibold text-cyan-300">
                {occupiedCount}
              </span>
            </div>

            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{
                  width: `${
                    totalBeds
                      ? Math.min(
                          100,
                          (occupiedCount /
                            totalBeds) *
                            100
                        )
                      : 0
                  }%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">

              <div className="rounded-xl bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/70 p-3">
                <p className="text-[10px] text-slate-500">
                  Stable
                </p>

                <p className="text-lg font-bold text-emerald-400">
                  {stableCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/70 p-3">
                <p className="text-[10px] text-slate-500">
                  Guarded
                </p>

                <p className="text-lg font-bold text-amber-400">
                  {guardedCount}
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={() =>
              setActiveTab('beds')
            }
            className="
              w-full
              mt-4
              py-2.5
              rounded-xl
              border border-slate-700
              text-xs
              text-slate-700 dark:text-slate-300
              hover:bg-slate-100 dark:bg-slate-800
            "
          >
            Open Bed Board
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4">

        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />

          <h3 className="font-semibold text-slate-900 dark:text-white">
            Quick Clinical Tools
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

          <button
            onClick={() =>
              setShowCalculators(true)
            }
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
              Calculators
            </p>
          </button>

          <button
            onClick={() =>
              setShowCustomizer(true)
            }
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
              Customize
            </p>
          </button>

          <button
            onClick={() =>
              setShowCloudAccountModal(true)
            }
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
              Cloud Sync
            </p>
          </button>

          <button
            onClick={() =>
              setShowSecurityModal(true)
            }
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
          >
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
              Security
            </p>
          </button>

        </div>
      </div>
    </div>
  );

  // =========================================================
  // Patients Page
  // =========================================================

  const PatientsPage = () => (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-white">
          Patients
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Active ICU / CCU patient records
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

        <input
          value={patientSearch}
          onChange={(e) =>
            setPatientSearch(e.target.value)
          }
          placeholder="Search by name, ID, diagnosis or bed..."
          className="
            w-full
            bg-slate-900
            border border-slate-800
            rounded-xl
            pl-10 pr-4 py-3
            text-sm
            text-white
            outline-none
            focus:border-cyan-600
          "
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <span className="px-3 py-1.5 rounded-full bg-cyan-950 text-cyan-300 text-xs whitespace-nowrap">
          Active: {activePatients.length}
        </span>

        <span className="px-3 py-1.5 rounded-full bg-rose-950 text-rose-300 text-xs whitespace-nowrap">
          Critical: {criticalCount}
        </span>

        <span className="px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 text-xs whitespace-nowrap">
          Stable: {stableCount}
        </span>
      </div>

      {filteredPatients.filter(
        (p) => !p.isDischarged
      ).length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 py-16 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto" />

          <p className="text-sm text-slate-400 mt-3">
            No matching active patients
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredPatients
            .filter((p) => !p.isDischarged)
            .map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
              />
            ))}
        </div>
      )}
    </div>
  );

  // =========================================================
  // Beds Page
  // =========================================================

  const BedsPage = () => (
    <CensusView
      patients={patients}
      totalBeds={totalBeds}
      specialtyMode={specialtyMode}
      onSelectPatient={(pt) => setSelectedPatientId(pt.id)}
      onAdmitToBed={(bedNum) => setAdmitBedNumber(Number(bedNum) || 1)}
      onDischargePatient={(pt) => setPatientToDischarge(pt)}
      onReadmitPatient={(pt) => setPatientToReadmit(pt)}
      onChangeTotalBeds={handleChangeTotalBeds}
      onUpdatePatientBed={handleUpdatePatientBed}
    />
  );

  // =========================================================
  // Archive Page
  // =========================================================

  const ArchivePage = () => (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-white">
          Archive
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Discharged patients and completed cases
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

        <input
          value={patientSearch}
          onChange={(e) =>
            setPatientSearch(e.target.value)
          }
          placeholder="Search archived patients..."
          className="
            w-full
            bg-slate-900
            border border-slate-800
            rounded-xl
            pl-10 pr-4 py-3
            text-sm
            text-white
            outline-none
            focus:border-cyan-600
          "
        />
      </div>

      {filteredPatients.filter(
        (p) => p.isDischarged
      ).length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 py-16 text-center">
          <Archive className="w-12 h-12 text-slate-700 mx-auto" />

          <p className="text-sm text-slate-400 mt-3">
            Archive is empty
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredPatients
            .filter((p) => p.isDischarged)
            .map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                archived
              />
            ))}
        </div>
      )}
    </div>
  );

  // =========================================================
  // Settings Page
  // =========================================================

  const SettingsPage = () => (
    <div className="space-y-5">

      <div>
        <h2 className="text-2xl font-bold text-white">
          Settings
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          CardioVault configuration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="w-5 h-5 text-cyan-400" />

            <div>
              <h3 className="font-semibold text-white">
                Bed Configuration
              </h3>

              <p className="text-[11px] text-slate-500">
                Set the total number of ICU/CCU beds
              </p>
            </div>
          </div>

          <label className="text-xs text-slate-400">
            Total Beds
          </label>

          <div className="flex gap-2 mt-2">

            <input
              type="number"
              min={3}
              value={totalBeds}
              onChange={(e) =>
                handleChangeTotalBeds(
                  Number(e.target.value)
                )
              }
              className="
                flex-1
                bg-slate-950
                border border-slate-700
                rounded-xl
                px-3 py-3
                text-white
                outline-none
                focus:border-cyan-600
              "
            />

            <div className="px-4 rounded-xl bg-slate-800 flex items-center text-xs text-slate-400">
              beds
            </div>

          </div>

          <p className="text-[10px] text-slate-600 mt-2">
            Minimum 3 beds.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-violet-400" />

            <div>
              <h3 className="font-semibold text-white">
                Security
              </h3>

              <p className="text-[11px] text-slate-500">
                PIN and automatic lock
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setShowSecurityModal(true)
            }
            className="
              w-full
              flex items-center justify-between
              p-3
              rounded-xl
              bg-slate-800
              hover:bg-slate-700
            "
          >
            <span className="text-sm text-slate-200">
              Security Settings
            </span>

            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />

            <div>
              <h3 className="font-semibold text-white">
                Patient Fields
              </h3>

              <p className="text-[11px] text-slate-500">
                Customize visible clinical sections
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setShowCustomizer(true)
            }
            className="
              w-full
              flex items-center justify-between
              p-3
              rounded-xl
              bg-slate-800
              hover:bg-slate-700
            "
          >
            <span className="text-sm text-slate-200">
              Customize Fields
            </span>

            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-5 h-5 text-emerald-400" />

            <div>
              <h3 className="font-semibold text-white">
                Cloud Sync
              </h3>

              <p className="text-[11px] text-slate-500">
                Backup and multi-device sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">

            {cloudSyncStatus === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : cloudSyncStatus === 'synced' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Clock3 className="w-4 h-4 text-slate-500" />
            )}

            <span className="text-xs text-slate-400">
              {cloudSyncStatus === 'syncing'
                ? 'Syncing...'
                : cloudSyncStatus === 'synced'
                  ? 'Synced'
                  : cloudSyncStatus === 'error'
                    ? 'Sync error'
                    : 'Offline'}
            </span>
          </div>

          <button
            onClick={() =>
              setShowCloudAccountModal(true)
            }
            className="
              w-full
              p-3
              rounded-xl
              bg-slate-800
              hover:bg-slate-700
              text-sm
              text-slate-200
            "
          >
            Cloud Account
          </button>
        </div>

      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

        <div className="flex items-center gap-3">
          <LogOut className="w-5 h-5 text-rose-400" />

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Session
            </h3>

            <p className="text-[11px] text-slate-500">
              {currentUser?.email || 'Offline / Local mode'}
            </p>
          </div>

          <button
            onClick={handleLockApp}
            className="
              px-3 py-2
              rounded-xl
              bg-slate-800
              hover:bg-slate-700
              text-xs
              text-slate-300
            "
          >
            Lock
          </button>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="
                px-3 py-2
                rounded-xl
                bg-rose-950
                hover:bg-rose-900
                text-xs
                text-rose-300
              "
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-500" />

          <p className="text-xs text-slate-500">
            CardioVault • ICU & CCU Clinical Notebook
          </p>
        </div>
      </div>

    </div>
  );

  // =========================================================
  // Render Active Page
  // =========================================================

  const renderActivePage = () => {
    switch (activeTab) {
      case 'patients':
        return <PatientsPage />;

      case 'beds':
        return <BedsPage />;

      case 'archive':
        return <ArchivePage />;

      case 'settings':
        return <SettingsPage />;

      case 'home':
      default:
        return <HomePage />;
    }
  };

  // =========================================================
  // Auth Loading
  // =========================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-xl mb-4 animate-pulse">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <HeartPulse className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-200">
          جاري التحقق من جلسة العمل السريرية...
        </p>

        <p className="text-xs text-slate-500 mt-1">
          CardioVault
        </p>
      </div>
    );
  }

  // =========================================================
  // Login
  // =========================================================

  if (!currentUser && !isOfflineBypassed) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setIsUnlocked(true);
        }}
        onContinueOffline={async (pin) => {
          setIsOfflineBypassed(true);

          const pinToUse =
            pin || '0000';

          setActivePin(pinToUse);
          setIsUnlocked(true);

          try {
            const loaded =
              await loadPatients(pinToUse);

            setPatients(loaded);
          } catch (err) {
            console.error(
              'Failed to load offline patients:',
              err
            );
          }
        }}
        securitySettings={securitySettings}
      />
    );
  }

  // =========================================================
  // Lock Screen
  // =========================================================

  if (!isUnlocked) {
    return (
      <LockScreen
        securitySettings={securitySettings}
        onUnlockSuccess={handleUnlockSuccess}
      />
    );
  }

  // =========================================================
  // Main Application
  // =========================================================

  return (
    <div className="
      min-h-screen
      bg-slate-950
      text-slate-100
      flex flex-col
      selection:bg-cyan-500/30
      selection:text-cyan-200
    ">

      <Navbar
        specialtyMode={specialtyMode}
        onSetSpecialtyMode={setSpecialtyMode}

        activeTab={activeTab}
        onTabChange={setActiveTab}

        patients={patients}
        totalBeds={totalBeds}

        currentUser={currentUser}
        cloudSyncStatus={cloudSyncStatus}

        onOpenCloudAccount={() =>
          setShowCloudAccountModal(true)
        }

        onOpenNewPatientModal={() =>
          setAdmitBedNumber(
            availableBeds[0] || 1
          )
        }

        onOpenCalculators={() =>
          setShowCalculators(true)
        }

        onOpenCustomizer={() =>
          setShowCustomizer(true)
        }

        onOpenSecurity={() =>
          setShowSecurityModal(true)
        }

        onOpenApkGuide={() =>
          setShowApkModal(true)
        }

        onOpenPrintHandover={() =>
          setShowPrintView(true)
        }

        onLockSession={handleLockApp}

        onLogout={handleLogout}
      />

      <main
        className="
          flex-1
          w-full
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-6
          pb-24
          md:pb-6
        "
      >

        {renderActivePage()}

      </main>

      {/* =====================================================
          Patient File
          ===================================================== */}

      {activePatientRecord && (
        <PatientFileModal
          patient={activePatientRecord}
          fieldConfig={fieldConfig}
          specialtyMode={specialtyMode}

          onUpdatePatient={
            handleUpdatePatient
          }

          onDeletePatient={
            handleDeletePatient
          }

          onDischargePatient={(pt) =>
            setPatientToDischarge(pt)
          }

          onReadmitPatient={(pt) =>
            setPatientToReadmit(pt)
          }

          onPrintPatient={(pt) => {
            setPatientToPrint(pt);
            setShowPrintView(true);
          }}

          onClose={() =>
            setSelectedPatientId(null)
          }
        />
      )}

      {/* Admit */}

      {admitBedNumber !== null && (
        <AdmitPatientModal
          bedNumber={admitBedNumber}
          specialtyMode={specialtyMode}
          onAdmit={handleAdmitPatient}
          onClose={() =>
            setAdmitBedNumber(null)
          }
        />
      )}

      {/* Calculators */}

      {showCalculators && (
        <ClinicalCalculatorsModal
          onClose={() =>
            setShowCalculators(false)
          }
        />
      )}

      {/* Customizer */}

      {showCustomizer && (
        <FieldCustomizerModal
          config={fieldConfig}
          onSaveConfig={
            handleSaveFieldConfig
          }
          onClose={() =>
            setShowCustomizer(false)
          }
        />
      )}

      {/* Security */}

      {showSecurityModal && (
        <SecuritySettingsModal
          securitySettings={
            securitySettings
          }

          patients={patients}

          currentActivePin={activePin}

          onUpdateSecurity={(newSettings) =>
            setSecuritySettings(
              newSettings
            )
          }

          onRestorePatients={(restored) =>
            updatePatients(restored)
          }

          onClose={() =>
            setShowSecurityModal(false)
          }
        />
      )}

      {/* APK Guide */}

      {showApkModal && (
        <AndroidApkModal
          onClose={() =>
            setShowApkModal(false)
          }
        />
      )}

      {/* Print */}

      {showPrintView && (
        <PrintableView
          patients={patients}
          activePatient={patientToPrint}

          onClose={() => {
            setShowPrintView(false);
            setPatientToPrint(null);
          }}
        />
      )}

      {/* Discharge */}

      {patientToDischarge && (
        <DischargePatientModal
          patient={patientToDischarge}

          onConfirmDischarge={
            handleDischargePatient
          }

          onClose={() =>
            setPatientToDischarge(null)
          }
        />
      )}

      {/* Readmit */}

      {patientToReadmit && (
        <ReadmitPatientModal
          patient={patientToReadmit}
          availableBeds={availableBeds}

          onReadmit={
            handleReadmitPatient
          }

          onClose={() =>
            setPatientToReadmit(null)
          }
        />
      )}

      {/* Cloud */}

      {showCloudAccountModal && (
        <CloudAccountModal
          currentUser={currentUser}
          cloudSyncStatus={
            cloudSyncStatus
          }
          patients={patients}

          onManualSync={
            handleManualSync
          }

          onPullCloudData={
            handlePullCloudData
          }

          onClose={() =>
            setShowCloudAccountModal(false)
          }
        />
      )}

    </div>
  );
}
