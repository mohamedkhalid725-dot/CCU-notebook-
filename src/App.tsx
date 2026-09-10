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
import { PatientFileModal } from './components/PatientFileModal';
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
import { HeartPulse } from 'lucide-react';

import {
  subscribeToAuth,
  fetchCloudPatients,
  savePatientToCloud,
  deletePatientFromCloud,
  syncAllPatientsToCloud,
  logoutUser
} from './services/firebase';

export default function App() {
  // =========================================================
  // Security State
  // =========================================================

  const [securitySettings, setSecuritySettings] =
    useState<AppSecuritySettings>(() => getSecuritySettings());

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<string>('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // =========================================================
  // Cloud & Firebase State
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
  // Clinical & Census State
  // =========================================================

  const [patients, setPatients] = useState<PatientRecord[]>([]);

  const [totalBeds, setTotalBeds] = useState<number>(() => {
    const saved = localStorage.getItem('icu_total_beds');
    return saved ? Math.max(3, Number(saved)) : 6;
  });

  const [specialtyMode, setSpecialtyMode] =
    useState<SpecialtyMode>('all');

  // Bottom navigation
  const [activeTab, setActiveTab] =
    useState<AppTab>('home');

  const [fieldConfig, setFieldConfig] =
    useState<FieldVisibilityConfig>(() => getFieldConfig());

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
  // Handle successful unlock
  // =========================================================

  const handleUnlockSuccess = async (pin: string) => {
    setActivePin(pin);
    setIsUnlocked(true);
    setLastActivity(Date.now());

    try {
      const loaded = await loadPatients(pin);
      setPatients(loaded);
    } catch (err) {
      console.error('Failed to load patient records', err);
    }
  };

  // =========================================================
  // Auth & Cloud Sync listener
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

          setCloudSyncStatus('synced');
        } catch (err) {
          console.error(
            'Failed to sync cloud patients on auth change:',
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
  // Immediate lock
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
  // Save patient list
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
  // Update single patient
  // =========================================================

  const handleUpdatePatient = useCallback(
    async (updatedPatient: PatientRecord) => {
      setPatients((prev) => {
        const next = prev.map((p) =>
          p.id === updatedPatient.id
            ? updatedPatient
            : p
        );

        if (activePin) {
          savePatients(next, activePin);
        }

        return next;
      });

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
    [activePin, currentUser]
  );

  // =========================================================
  // Delete patient
  // =========================================================

  const handleDeletePatient = useCallback(
    async (patientId: string) => {
      setPatients((prev) => {
        const next = prev.filter(
          (p) => p.id !== patientId
        );

        if (activePin) {
          savePatients(next, activePin);
        }

        return next;
      });

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
    [activePin, selectedPatientId, currentUser]
  );

  // =========================================================
  // Admit patient
  // =========================================================

  const handleAdmitPatient = useCallback(
    async (newPatient: PatientRecord) => {
      setPatients((prev) => {
        const filtered = prev.filter(
          (p) =>
            p.isDischarged ||
            Number(p.bedNumber) !==
              Number(newPatient.bedNumber)
        );

        const next = [...filtered, newPatient];

        if (activePin) {
          savePatients(next, activePin);
        }

        return next;
      });

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
    [activePin, currentUser]
  );

  // =========================================================
  // Discharge patient
  // =========================================================

  const handleDischargePatient = useCallback(
    async (
      patientId: string,
      details: DischargeDetails
    ) => {
      let dischargedRecord: PatientRecord | null = null;

      setPatients((prev) => {
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

        const next = prev.map((p) => {
          if (p.id !== patientId) return p;

          const dischargeNote: ProgressNote = {
            id: `note-${Date.now()}`,
            timestamp: `${mm}/${dd} — ${timeStr}`,
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

        if (activePin) {
          savePatients(next, activePin);
        }

        return next;
      });

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
    [activePin, currentUser]
  );

  // =========================================================
  // Readmit patient
  // =========================================================

  const handleReadmitPatient = useCallback(
    async (
      patientId: string,
      targetBedNumber: number,
      status: BedStatus
    ) => {
      let readmittedRecord: PatientRecord | null = null;

      setPatients((prev) => {
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

        const isOccupied = prev.some(
          (p) =>
            !p.isDischarged &&
            Number(p.bedNumber) ===
              Number(targetBedNumber)
        );

        if (isOccupied) {
          alert(
            `Bed ${targetBedNumber} is currently occupied! Please select an empty bed.`
          );

          return prev;
        }

        const next = prev.map((p) => {
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

        if (activePin) {
          savePatients(next, activePin);
        }

        return next;
      });

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
    [activePin, currentUser]
  );

  // =========================================================
  // Manual cloud sync
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

  // =========================================================
  // Pull cloud data
  // =========================================================

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
  // Change total beds
  // =========================================================

  const handleChangeTotalBeds = (
    newCount: number
  ) => {
    setTotalBeds(newCount);

    localStorage.setItem(
      'icu_total_beds',
      String(newCount)
    );
  };

  // =========================================================
  // Save field config
  // =========================================================

  const handleSaveFieldConfig = (
    newConfig: FieldVisibilityConfig
  ) => {
    setFieldConfig(newConfig);
    saveFieldConfig(newConfig);
  };

  // =========================================================
  // Auto-lock listeners
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
  // Active patient
  // =========================================================

  const activePatientRecord = selectedPatientId
    ? patients.find(
        (p) => p.id === selectedPatientId
      ) || null
    : null;

  // =========================================================
  // Available beds
  // =========================================================

  const occupiedBedNumbers = new Set(
    patients
      .filter(
        (p) =>
          !p.isDischarged &&
          p.bedNumber
      )
      .map((p) => Number(p.bedNumber))
  );

  const availableBeds = Array.from(
    { length: totalBeds },
    (_, i) => i + 1
  ).filter(
    (b) => !occupiedBedNumbers.has(b)
  );

  // =========================================================
  // Initial Auth Loading
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Navigation */}
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

      {/* Main Workspace */}
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
        <CensusView
          patients={patients}
          totalBeds={totalBeds}
          specialtyMode={specialtyMode}

          onSelectPatient={(patient) =>
            setSelectedPatientId(
              patient.id
            )
          }

          onAdmitToBed={(bedNum) =>
            setAdmitBedNumber(bedNum)
          }

          onDischargePatient={(patient) =>
            setPatientToDischarge(patient)
          }

          onReadmitPatient={(patient) =>
            setPatientToReadmit(patient)
          }

          onChangeTotalBeds={
            handleChangeTotalBeds
          }
        />
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

      {/* Admit Patient */}
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

      {/* Field Customizer */}
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
