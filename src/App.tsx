import React, { useState, useEffect, useCallback } from 'react';
import { 
  PatientRecord, 
  SpecialtyMode, 
  FieldVisibilityConfig, 
  AppSecuritySettings,
  DischargeDetails,
  BedStatus,
  ProgressNote
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
import { User } from 'firebase/auth';
import { 
  subscribeToAuth, 
  fetchCloudPatients, 
  savePatientToCloud, 
  deletePatientFromCloud, 
  syncAllPatientsToCloud 
} from './services/firebase';

export default function App() {
  // Security State
  const [securitySettings, setSecuritySettings] = useState<AppSecuritySettings>(() => getSecuritySettings());
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<string>('');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Cloud & Firebase State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [showCloudAccountModal, setShowCloudAccountModal] = useState<boolean>(false);

  // Clinical & Census State
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [totalBeds, setTotalBeds] = useState<number>(() => {
    const saved = localStorage.getItem('icu_total_beds');
    return saved ? Math.max(3, Number(saved)) : 6;
  });
  const [specialtyMode, setSpecialtyMode] = useState<SpecialtyMode>('combined');
  const [fieldConfig, setFieldConfig] = useState<FieldVisibilityConfig>(() => getFieldConfig());

  // Modals
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [admitBedNumber, setAdmitBedNumber] = useState<number | null>(null);
  const [patientToDischarge, setPatientToDischarge] = useState<PatientRecord | null>(null);
  const [patientToReadmit, setPatientToReadmit] = useState<PatientRecord | null>(null);
  const [showCalculators, setShowCalculators] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  const [patientToPrint, setPatientToPrint] = useState<PatientRecord | null>(null);

  // Handle successful unlock from LockScreen
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

  // Auth & Cloud Sync listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('syncing');
        try {
          const cloudData = await fetchCloudPatients(user.uid);
          if (cloudData && cloudData.length > 0) {
            setPatients(cloudData);
            if (activePin) {
              await savePatients(cloudData, activePin);
            }
          } else if (patients.length > 0) {
            // First time this user connects: upload initial local patients to cloud
            await syncAllPatientsToCloud(user.uid, patients);
          }
          setCloudSyncStatus('synced');
        } catch (err) {
          console.error('Failed to sync cloud patients on auth change:', err);
          setCloudSyncStatus('error');
        }
      } else {
        setCloudSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, [activePin]);

  // Immediate lock
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
    // Refresh security settings in case changed
    setSecuritySettings(getSecuritySettings());
  }, []);

  // Save changes to patient list and re-encrypt
  const updatePatients = useCallback(async (newPatients: PatientRecord[]) => {
    setPatients(newPatients);
    if (activePin) {
      await savePatients(newPatients, activePin);
    }
    if (currentUser) {
      setCloudSyncStatus('syncing');
      try {
        await syncAllPatientsToCloud(currentUser.uid, newPatients);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud batch sync error:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, currentUser]);

  // Update a single patient
  const handleUpdatePatient = useCallback(async (updatedPatient: PatientRecord) => {
    setPatients(prev => {
      const next = prev.map(p => p.id === updatedPatient.id ? updatedPatient : p);
      if (activePin) {
        savePatients(next, activePin);
      }
      return next;
    });

    if (currentUser) {
      setCloudSyncStatus('syncing');
      try {
        await savePatientToCloud(currentUser.uid, updatedPatient);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud save failed:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, currentUser]);

  // Delete a patient
  const handleDeletePatient = useCallback(async (patientId: string) => {
    setPatients(prev => {
      const next = prev.filter(p => p.id !== patientId);
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
        await deletePatientFromCloud(currentUser.uid, patientId);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud delete failed:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, selectedPatientId, currentUser]);

  // Admit a patient to a bed
  const handleAdmitPatient = useCallback(async (newPatient: PatientRecord) => {
    setPatients(prev => {
      // If an active patient already occupies this bed, replace or shift
      const filtered = prev.filter(p => p.isDischarged || Number(p.bedNumber) !== Number(newPatient.bedNumber));
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
        await savePatientToCloud(currentUser.uid, newPatient);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud admit save failed:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, currentUser]);

  // Discharge patient from bed to Medical Records Archive
  const handleDischargePatient = useCallback(async (patientId: string, details: DischargeDetails) => {
    let dischargedRecord: PatientRecord | null = null;

    setPatients(prev => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const next = prev.map(p => {
        if (p.id !== patientId) return p;

        const dischargeNote: ProgressNote = {
          id: `note-${Date.now()}`,
          timestamp: `${mm}/${dd} — ${timeStr}`,
          author: details.dischargedBy || p.attendingPhysician || 'Attending Physician',
          tag: 'Handover',
          subjective: `Discharge protocol executed. Destination: ${details.disposition}.`,
          objective: `Condition at discharge: ${details.conditionAtDischarge}. Discharged from Bed ${p.bedNumber}.`,
          assessment: `Discharged from ICU/CCU. Diagnosis: ${p.primaryDiagnosis}.`,
          plan: `Summary: ${details.dischargeSummary}\nFloor/Discharge Meds: ${details.dischargeMedications || 'See list'}\nFollow-up: ${details.followUpInstructions || 'Routine follow-up'}`
        };

        const updated: PatientRecord = {
          ...p,
          isDischarged: true,
          previousBedNumber: p.bedNumber,
          bedNumber: '',
          status: 'discharged' as BedStatus,
          dischargeDetails: details,
          progressNotes: [...p.progressNotes, dischargeNote],
          lastUpdated: `${now.toISOString().slice(0, 10)} ${timeStr}`
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
        await savePatientToCloud(currentUser.uid, dischargedRecord);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud discharge save failed:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, currentUser]);

  // Re-admit patient from archive back to an active bed
  const handleReadmitPatient = useCallback(async (patientId: string, targetBedNumber: number, status: BedStatus) => {
    let readmittedRecord: PatientRecord | null = null;

    setPatients(prev => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Ensure target bed is not occupied by an active patient
      const isOccupied = prev.some(p => !p.isDischarged && Number(p.bedNumber) === Number(targetBedNumber));
      if (isOccupied) {
        alert(`Bed ${targetBedNumber} is currently occupied! Please select an empty bed.`);
        return prev;
      }

      const next = prev.map(p => {
        if (p.id !== patientId) return p;

        const readmitNote: ProgressNote = {
          id: `note-${Date.now()}`,
          timestamp: `${mm}/${dd} — ${timeStr}`,
          author: p.attendingPhysician || 'Attending Physician',
          tag: 'Round',
          subjective: `Patient re-admitted to intensive care (Assigned Bed ${targetBedNumber}).`,
          objective: `Re-admission evaluation. Continuous hemodynamic monitoring initiated.`,
          assessment: `Active ICU/CCU clinical management resumed for ${p.primaryDiagnosis}.`,
          plan: '1. Connected to bedside telemetry & monitoring\n2. Vital signs and laboratory panel reassessment\n3. Continue targeted protocol'
        };

        const updated: PatientRecord = {
          ...p,
          isDischarged: false,
          bedNumber: targetBedNumber,
          status,
          progressNotes: [...p.progressNotes, readmitNote],
          lastUpdated: `${now.toISOString().slice(0, 10)} ${timeStr}`
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
        await savePatientToCloud(currentUser.uid, readmittedRecord);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error('Cloud readmit save failed:', e);
        setCloudSyncStatus('error');
      }
    }
  }, [activePin, currentUser]);

  // Manual trigger for pushing to cloud
  const handleManualSync = async () => {
    if (!currentUser) return;
    setCloudSyncStatus('syncing');
    try {
      await syncAllPatientsToCloud(currentUser.uid, patients);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Manual sync failed:', err);
      setCloudSyncStatus('error');
    }
  };

  // Manual trigger for pulling from cloud
  const handlePullCloudData = async () => {
    if (!currentUser) return;
    setCloudSyncStatus('syncing');
    try {
      const cloudData = await fetchCloudPatients(currentUser.uid);
      setPatients(cloudData);
      if (activePin) {
        await savePatients(cloudData, activePin);
      }
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Pull cloud data failed:', err);
      setCloudSyncStatus('error');
    }
  };

  // Change total beds count
  const handleChangeTotalBeds = (newCount: number) => {
    setTotalBeds(newCount);
    localStorage.setItem('icu_total_beds', String(newCount));
  };

  // Save customized fields config
  const handleSaveFieldConfig = (newConfig: FieldVisibilityConfig) => {
    setFieldConfig(newConfig);
    saveFieldConfig(newConfig);
  };

  // Auto-lock listeners
  useEffect(() => {
    if (!isUnlocked) return;

    // Track user activity
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (securitySettings.autoLockMinutes === 0) {
          handleLockApp();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Inactivity timer interval check
    const interval = setInterval(() => {
      if (securitySettings.autoLockMinutes > 0) {
        const inactiveMs = Date.now() - lastActivity;
        const limitMs = securitySettings.autoLockMinutes * 60 * 1000;
        if (inactiveMs >= limitMs) {
          handleLockApp();
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isUnlocked, lastActivity, securitySettings.autoLockMinutes, handleLockApp]);

  // Currently selected patient record for detail modal
  const activePatientRecord = selectedPatientId
    ? patients.find(p => p.id === selectedPatientId) || null
    : null;

  // Calculate available beds for re-admission
  const occupiedBedNumbers = new Set(
    patients.filter(p => !p.isDischarged && p.bedNumber).map(p => Number(p.bedNumber))
  );
  const availableBeds = Array.from({ length: totalBeds }, (_, i) => i + 1).filter(b => !occupiedBedNumbers.has(b));

  // Render LockScreen if locked
  if (!isUnlocked) {
    return (
      <LockScreen
        securitySettings={securitySettings}
        onUnlockSuccess={handleUnlockSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Navbar */}
      <Navbar
        specialtyMode={specialtyMode}
        onSetSpecialtyMode={setSpecialtyMode}
        patients={patients}
        totalBeds={totalBeds}
        currentUser={currentUser}
        cloudSyncStatus={cloudSyncStatus}
        onOpenCloudAccount={() => setShowCloudAccountModal(true)}
        onOpenNewPatientModal={() => setAdmitBedNumber(availableBeds[0] || 1)}
        onOpenCalculators={() => setShowCalculators(true)}
        onOpenCustomizer={() => setShowCustomizer(true)}
        onOpenSecurity={() => setShowSecurityModal(true)}
        onOpenApkGuide={() => setShowApkModal(true)}
        onOpenPrintHandover={() => setShowPrintView(true)}
        onLockSession={handleLockApp}
      />

      {/* Main Census Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CensusView
          patients={patients}
          totalBeds={totalBeds}
          specialtyMode={specialtyMode}
          onSelectPatient={(patient) => setSelectedPatientId(patient.id)}
          onAdmitToBed={(bedNum) => setAdmitBedNumber(bedNum)}
          onDischargePatient={(patient) => setPatientToDischarge(patient)}
          onReadmitPatient={(patient) => setPatientToReadmit(patient)}
          onChangeTotalBeds={handleChangeTotalBeds}
        />
      </main>

      {/* MODAL 1: Patient File Modal (Detailed ICU/CCU chart) */}
      {activePatientRecord && (
        <PatientFileModal
          patient={activePatientRecord}
          fieldConfig={fieldConfig}
          specialtyMode={specialtyMode}
          onUpdatePatient={handleUpdatePatient}
          onDeletePatient={handleDeletePatient}
          onDischargePatient={(pt) => setPatientToDischarge(pt)}
          onReadmitPatient={(pt) => setPatientToReadmit(pt)}
          onPrintPatient={(pt) => {
            setPatientToPrint(pt);
            setShowPrintView(true);
          }}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {/* MODAL 2: Admit Patient to Bed */}
      {admitBedNumber !== null && (
        <AdmitPatientModal
          bedNumber={admitBedNumber}
          specialtyMode={specialtyMode}
          onAdmit={handleAdmitPatient}
          onClose={() => setAdmitBedNumber(null)}
        />
      )}

      {/* MODAL 3: Clinical Calculators (SOFA, GCS, RASS, ABG, Fluid) */}
      {showCalculators && (
        <ClinicalCalculatorsModal
          onClose={() => setShowCalculators(false)}
        />
      )}

      {/* MODAL 4: Field Customizer (Toggle CCU/ICU specialized fields) */}
      {showCustomizer && (
        <FieldCustomizerModal
          config={fieldConfig}
          onSaveConfig={handleSaveFieldConfig}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {/* MODAL 5: Security & Encrypted Backup Settings */}
      {showSecurityModal && (
        <SecuritySettingsModal
          securitySettings={securitySettings}
          patients={patients}
          currentActivePin={activePin}
          onUpdateSecurity={(newSettings) => setSecuritySettings(newSettings)}
          onRestorePatients={(restored) => updatePatients(restored)}
          onClose={() => setShowSecurityModal(false)}
        />
      )}

      {/* MODAL 6: Android APK & WebAPK installation guide */}
      {showApkModal && (
        <AndroidApkModal
          onClose={() => setShowApkModal(false)}
        />
      )}

      {/* MODAL 7: Print / PDF Handover Sheet */}
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

      {/* MODAL 8: Discharge Patient Modal (Free bed, preserve medical record) */}
      {patientToDischarge && (
        <DischargePatientModal
          patient={patientToDischarge}
          onConfirmDischarge={handleDischargePatient}
          onClose={() => setPatientToDischarge(null)}
        />
      )}

      {/* MODAL 9: Re-admit Patient Modal (Assign to bed from archive) */}
      {patientToReadmit && (
        <ReadmitPatientModal
          patient={patientToReadmit}
          availableBeds={availableBeds}
          onReadmit={handleReadmitPatient}
          onClose={() => setPatientToReadmit(null)}
        />
      )}

      {/* MODAL 10: Cloud Account & Firestore Sync */}
      {showCloudAccountModal && (
        <CloudAccountModal
          currentUser={currentUser}
          cloudSyncStatus={cloudSyncStatus}
          patients={patients}
          onManualSync={handleManualSync}
          onPullCloudData={handlePullCloudData}
          onClose={() => setShowCloudAccountModal(false)}
        />
      )}
    </div>
  );
}
