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
  savePatients,
  getAppTheme,
  applyThemeToDom,
  type AppTheme
} from './services/storage';

import {
  setAppLanguage,
  initializeLanguage,
  applyLanguageToDom,
  type AppLanguage,
  t
} from './services/i18n';

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
  SlidersHorizontal,
  Languages
} from 'lucide-react';

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
  // Security
  // =========================================================

  const [securitySettings, setSecuritySettings] =
    useState<AppSecuritySettings>(() => {
      try {
        return getSecuritySettings();
      } catch {
        return {
          pinEnabled: false,
          autoLockMinutes: 0
        } as AppSecuritySettings;
      }
    });

  // =========================================================
  // Language
  // =========================================================

  const [language, setLanguageState] =
    useState<AppLanguage>(() => {
      try {
        return initializeLanguage();
      } catch {
        return 'en';
      }
    });

  // =========================================================
  // Theme
  // =========================================================

  const [theme, setTheme] =
    useState<AppTheme>(() => {
      try {
        return getAppTheme();
      } catch {
        return 'dark';
      }
    });

  const [isDarkTheme, setIsDarkTheme] =
    useState<boolean>(() => {
      try {
        if (
          typeof window === 'undefined' ||
          typeof window.matchMedia !== 'function'
        ) {
          return true;
        }

        const savedTheme = getAppTheme();

        return (
          savedTheme === 'dark' ||
          (
            savedTheme === 'system' &&
            window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches
          )
        );
      } catch {
        return true;
      }
    });

  // =========================================================
  // Session
  // =========================================================

  const [isUnlocked, setIsUnlocked] =
    useState<boolean>(false);

  const [activePin, setActivePin] =
    useState<string>('');

  const [lastActivity, setLastActivity] =
    useState<number>(Date.now());

  // =========================================================
  // Firebase / Cloud
  // =========================================================

  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState<boolean>(true);

  const [isOfflineBypassed, setIsOfflineBypassed] =
    useState<boolean>(false);

  const [cloudSyncStatus, setCloudSyncStatus] =
    useState<'synced' | 'syncing' | 'offline' | 'error'>(
      'offline'
    );

  const [showCloudAccountModal, setShowCloudAccountModal] =
    useState<boolean>(false);

  // =========================================================
  // Clinical State
  // =========================================================

  const [patients, setPatients] =
    useState<PatientRecord[]>([]);

  const [totalBeds, setTotalBeds] =
    useState<number>(() => {
      try {
        const saved =
          localStorage.getItem('icu_total_beds');

        const parsed =
          saved ? Number(saved) : 6;

        if (!Number.isFinite(parsed)) {
          return 6;
        }

        return Math.max(
          3,
          Math.floor(parsed)
        );
      } catch {
        return 6;
      }
    });

  const [specialtyMode, setSpecialtyMode] =
    useState<SpecialtyMode>('all');

  const [activeTab, setActiveTab] =
    useState<AppTab>('home');

  const [fieldConfig, setFieldConfig] =
    useState<FieldVisibilityConfig>(() => {
      try {
        return getFieldConfig();
      } catch {
        return {} as FieldVisibilityConfig;
      }
    });

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
  // Language Initialization
  // =========================================================

  useEffect(() => {
    try {
      setAppLanguage(language);
      applyLanguageToDom(language);
    } catch (err) {
      console.error(
        'Language initialization failed:',
        err
      );
    }
  }, [language]);

  // =========================================================
  // Theme Synchronization
  //
  // Supports:
  // - Dark
  // - Light
  // - System
  // - Navbar theme changes
  // - OS theme changes
  // =========================================================

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const updateTheme = () => {
      try {
        const currentTheme =
          getAppTheme();

        setTheme(currentTheme);

        const systemDark =
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function'
            ? window.matchMedia(
                '(prefers-color-scheme: dark)'
              ).matches
            : false;

        const dark =
          currentTheme === 'dark' ||
          (
            currentTheme === 'system' &&
            systemDark
          );

        setIsDarkTheme(dark);

        applyThemeToDom(
          currentTheme
        );
      } catch (err) {
        console.error(
          'Theme synchronization failed:',
          err
        );
      }
    };

    updateTheme();

    let mediaQuery: MediaQueryList | null = null;

    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      mediaQuery =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        );

      mediaQuery.addEventListener?.(
        'change',
        updateTheme
      );
    }

    /*
     * Navbar changes the theme directly in localStorage
     * and on document.documentElement.
     *
     * MutationObserver makes App react immediately,
     * even though localStorage "storage" events do not
     * fire in the same browser tab.
     */
    const observer =
      new MutationObserver(() => {
        updateTheme();
      });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['class']
      }
    );

    const handleStorage =
      (event: StorageEvent) => {
        if (
          event.key === 'cardiovault_theme' ||
          event.key === 'icu_total_beds'
        ) {
          updateTheme();
        }
      };

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () => {
      mediaQuery?.removeEventListener?.(
        'change',
        updateTheme
      );

      observer.disconnect();

      window.removeEventListener(
        'storage',
        handleStorage
      );
    };
  }, []);

  // =========================================================
  // Unlock
  // =========================================================

  const handleUnlockSuccess = async (
    pin: string
  ) => {
    setActivePin(
      typeof pin === 'string'
        ? pin
        : ''
    );

    setIsUnlocked(true);
    setLastActivity(
      Date.now()
    );

    try {
      const loaded =
        await loadPatients(pin);

      setPatients(
        Array.isArray(loaded)
          ? loaded.filter(Boolean)
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load patient records:',
        err
      );

      setPatients([]);
    }
  };

  // =========================================================
  // Auth
  // =========================================================

  useEffect(() => {
    let mounted = true;

    let unsubscribe:
      | (() => void)
      | undefined;

    try {
      unsubscribe =
        subscribeToAuth(
          async (user) => {
            if (!mounted) return;

            setCurrentUser(user);
            setAuthLoading(false);

            if (!user) {
              setCloudSyncStatus(
                'offline'
              );

              return;
            }

            setIsUnlocked(true);
            setCloudSyncStatus(
              'syncing'
            );

            try {
              const cloudData =
                await fetchCloudPatients(
                  user.uid
                );

              if (!mounted) return;

              const safeCloudData =
                Array.isArray(cloudData)
                  ? cloudData.filter(Boolean)
                  : [];

              if (
                safeCloudData.length > 0
              ) {
                setPatients(
                  safeCloudData
                );

                if (activePin) {
                  try {
                    await savePatients(
                      safeCloudData,
                      activePin
                    );
                  } catch (
                    storageError
                  ) {
                    console.error(
                      'Failed to save cloud data locally:',
                      storageError
                    );
                  }
                }
              } else {
                setPatients(
                  (localPatients) => {
                    const safeLocalPatients =
                      Array.isArray(
                        localPatients
                      )
                        ? localPatients.filter(
                            Boolean
                          )
                        : [];

                    if (
                      safeLocalPatients.length >
                      0
                    ) {
                      syncAllPatientsToCloud(
                        user.uid,
                        safeLocalPatients
                      ).catch(
                        (syncError) => {
                          console.error(
                            'Initial cloud sync failed:',
                            syncError
                          );

                          if (mounted) {
                            setCloudSyncStatus(
                              'error'
                            );
                          }
                        }
                      );
                    }

                    return safeLocalPatients;
                  }
                );
              }

              if (mounted) {
                setCloudSyncStatus(
                  'synced'
                );
              }
            } catch (err) {
              console.error(
                'Failed to sync cloud patients:',
                err
              );

              if (mounted) {
                setCloudSyncStatus(
                  'error'
                );
              }
            }
          }
        );
    } catch (err) {
      console.error(
        'Auth subscription failed:',
        err
      );

      setAuthLoading(false);
      setCurrentUser(null);
    }

    return () => {
      mounted = false;

      try {
        unsubscribe?.();
      } catch (err) {
        console.error(
          'Auth unsubscribe failed:',
          err
        );
      }
    };
  }, [activePin]);

  // =========================================================
  // Lock
  // =========================================================

  const handleLockApp = useCallback(() => {
    setIsUnlocked(false);
    setActivePin('');

    setSelectedPatientId(null);
    setAdmitBedNumber(null);

    setPatientToDischarge(null);
    setPatientToReadmit(null);
    setPatientToPrint(null);

    setShowCalculators(false);
    setShowCustomizer(false);
    setShowSecurityModal(false);
    setShowPrintView(false);
    setShowCloudAccountModal(false);

    try {
      setSecuritySettings(
        getSecuritySettings()
      );
    } catch (err) {
      console.error(
        'Failed to reload security settings:',
        err
      );
    }
  }, []);

  // =========================================================
  // Logout
  // =========================================================

  const handleLogout = useCallback(
    async () => {
      try {
        await logoutUser();
      } catch (err) {
        console.error(
          'Logout error:',
          err
        );
      }

      setCurrentUser(null);
      setIsOfflineBypassed(false);
      setIsUnlocked(false);
      setActivePin('');
      setPatients([]);

      setSelectedPatientId(null);
      setAdmitBedNumber(null);
      setPatientToDischarge(null);
      setPatientToReadmit(null);
      setPatientToPrint(null);

      setShowCloudAccountModal(false);
      setShowPrintView(false);

      setActiveTab('home');
    },
    []
  );

  // =========================================================
  // Save Patients
  // =========================================================

  const updatePatients = useCallback(
    async (
      newPatients: PatientRecord[]
    ) => {
      const safePatients =
        Array.isArray(newPatients)
          ? newPatients.filter(Boolean)
          : [];

      setPatients(
        safePatients
      );

      if (activePin) {
        try {
          await savePatients(
            safePatients,
            activePin
          );
        } catch (err) {
          console.error(
            'Local patient save failed:',
            err
          );
        }
      }

      if (currentUser) {
        setCloudSyncStatus(
          'syncing'
        );

        try {
          await syncAllPatientsToCloud(
            currentUser.uid,
            safePatients
          );

          setCloudSyncStatus(
            'synced'
          );
        } catch (err) {
          console.error(
            'Cloud batch sync error:',
            err
          );

          setCloudSyncStatus(
            'error'
          );
        }
      }
    },
    [activePin, currentUser]
  );

  // =========================================================
  // Update Patient
  // =========================================================

  const handleUpdatePatient =
    useCallback(
      async (
        updatedPatient: PatientRecord
      ) => {
        if (!updatedPatient?.id) {
          console.warn(
            'Invalid patient update ignored.'
          );

          return;
        }

        const nextPatients =
          patients.map((p) =>
            p?.id === updatedPatient.id
              ? updatedPatient
              : p
          );

        setPatients(
          nextPatients
        );

        if (activePin) {
          try {
            await savePatients(
              nextPatients,
              activePin
            );
          } catch (err) {
            console.error(
              'Local patient update failed:',
              err
            );
          }
        }

        if (currentUser) {
          setCloudSyncStatus(
            'syncing'
          );

          try {
            await savePatientToCloud(
              currentUser.uid,
              updatedPatient
            );

            setCloudSyncStatus(
              'synced'
            );
          } catch (err) {
            console.error(
              'Cloud save failed:',
              err
            );

            setCloudSyncStatus(
              'error'
            );
          }
        }
      },
      [
        patients,
        activePin,
        currentUser
      ]
    );

  // =========================================================
  // Delete Patient
  // =========================================================

  const handleDeletePatient =
    useCallback(
      async (
        patientId: string
      ) => {
        if (!patientId) return;

        const nextPatients =
          patients.filter(
            (p) =>
              p?.id !== patientId
          );

        setPatients(
          nextPatients
        );

        if (activePin) {
          try {
            await savePatients(
              nextPatients,
              activePin
            );
          } catch (err) {
            console.error(
              'Local patient delete failed:',
              err
            );
          }
        }

        if (
          selectedPatientId ===
          patientId
        ) {
          setSelectedPatientId(
            null
          );
        }

        if (
          patientToPrint?.id ===
          patientId
        ) {
          setPatientToPrint(
            null
          );

          setShowPrintView(
            false
          );
        }

        if (currentUser) {
          setCloudSyncStatus(
            'syncing'
          );

          try {
            await deletePatientFromCloud(
              currentUser.uid,
              patientId
            );

            setCloudSyncStatus(
              'synced'
            );
          } catch (err) {
            console.error(
              'Cloud delete failed:',
              err
            );

            setCloudSyncStatus(
              'error'
            );
          }
        }
      },
      [
        patients,
        activePin,
        selectedPatientId,
        currentUser,
        patientToPrint
      ]
    );

  // =========================================================
  // Admit
  // =========================================================

  const handleAdmitPatient =
    useCallback(
      async (
        newPatient: PatientRecord
      ) => {
        if (!newPatient?.id) {
          console.warn(
            'Invalid patient admission ignored.'
          );

          return;
        }

        const newBedNumber =
          Number(
            newPatient.bedNumber
          );

        const filtered =
          patients.filter(
            (p) =>
              p?.isDischarged ||
              !Number.isFinite(
                newBedNumber
              ) ||
              Number(p?.bedNumber) !==
                newBedNumber
          );

        const next = [
          ...filtered,
          newPatient
        ];

        setPatients(next);

        if (activePin) {
          try {
            await savePatients(
              next,
              activePin
            );
          } catch (err) {
            console.error(
              'Local admit save failed:',
              err
            );
          }
        }

        setAdmitBedNumber(
          null
        );

        if (currentUser) {
          setCloudSyncStatus(
            'syncing'
          );

          try {
            await savePatientToCloud(
              currentUser.uid,
              newPatient
            );

            setCloudSyncStatus(
              'synced'
            );
          } catch (err) {
            console.error(
              'Cloud admit save failed:',
              err
            );

            setCloudSyncStatus(
              'error'
            );
          }
        }
      },
      [
        patients,
        activePin,
        currentUser
      ]
    );

  // =========================================================
  // Discharge
  // =========================================================

  const handleDischargePatient =
    useCallback(
      async (
        patientId: string,
        details: DischargeDetails
      ) => {
        if (
          !patientId ||
          !details
        ) {
          return;
        }

        let dischargedRecord:
          | PatientRecord
          | null = null;

        const now =
          new Date();

        const mm =
          String(
            now.getMonth() + 1
          ).padStart(2, '0');

        const dd =
          String(
            now.getDate()
          ).padStart(2, '0');

        const timeStr =
          now.toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          );

        const next =
          patients.map((p) => {
            if (
              p?.id !== patientId
            ) {
              return p;
            }

            const existingNotes =
              Array.isArray(
                p.progressNotes
              )
                ? p.progressNotes
                : [];

            const dischargeNote:
              ProgressNote = {
                id:
                  `note-${Date.now()}`,

                timestamp:
                  `${mm}/${dd} — ${timeStr}`,

                author:
                  details.dischargedBy ||
                  p.attendingPhysician ||
                  'Attending Physician',

                tag:
                  'Handover',

                subjective:
                  `Discharge protocol executed. Destination: ${details.disposition}.`,

                objective:
                  `Condition at discharge: ${details.conditionAtDischarge}. Discharged from Bed ${p.bedNumber}.`,

                assessment:
                  `Discharged from ICU/CCU. Diagnosis: ${p.primaryDiagnosis || 'Not documented'}.`,

                plan:
                  `Summary: ${details.dischargeSummary || ''}\n` +
                  `Floor/Discharge Meds: ${details.dischargeMedications || 'See list'}\n` +
                  `Follow-up: ${details.followUpInstructions || 'Routine follow-up'}`
              };

            const updated:
              PatientRecord = {
                ...p,

                isDischarged:
                  true,

                previousBedNumber:
                  p.bedNumber,

                bedNumber:
                  '',

                status:
                  'discharged' as BedStatus,

                dischargeDetails:
                  details,

                progressNotes: [
                  ...existingNotes,
                  dischargeNote
                ],

                lastUpdated:
                  `${now.toISOString().slice(0, 10)} ${timeStr}`
              };

            dischargedRecord =
              updated;

            return updated;
          });

        setPatients(next);

        if (activePin) {
          try {
            await savePatients(
              next,
              activePin
            );
          } catch (err) {
            console.error(
              'Local discharge save failed:',
              err
            );
          }
        }

        setPatientToDischarge(
          null
        );

        if (
          currentUser &&
          dischargedRecord
        ) {
          setCloudSyncStatus(
            'syncing'
          );

          try {
            await savePatientToCloud(
              currentUser.uid,
              dischargedRecord
            );

            setCloudSyncStatus(
              'synced'
            );
          } catch (err) {
            console.error(
              'Cloud discharge save failed:',
              err
            );

            setCloudSyncStatus(
              'error'
            );
          }
        }
      },
      [
        patients,
        activePin,
        currentUser
      ]
    );

  // =========================================================
  // Readmit
  // =========================================================

  const handleReadmitPatient =
    useCallback(
      async (
        patientId: string,
        targetBedNumber: number,
        status: BedStatus
      ) => {
        if (!patientId) return;

        const safeBedNumber =
          Number(
            targetBedNumber
          );

        if (
          !Number.isFinite(
            safeBedNumber
          )
        ) {
          return;
        }

        const isOccupied =
          patients.some(
            (p) =>
              !p?.isDischarged &&
              Number(
                p?.bedNumber
              ) ===
                safeBedNumber
          );

        if (isOccupied) {
          alert(
            `Bed ${safeBedNumber} is currently occupied! Please select an empty bed.`
          );

          return;
        }

        let readmittedRecord:
          | PatientRecord
          | null = null;

        const now =
          new Date();

        const mm =
          String(
            now.getMonth() + 1
          ).padStart(2, '0');

        const dd =
          String(
            now.getDate()
          ).padStart(2, '0');

        const timeStr =
          now.toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          );

        const next =
          patients.map((p) => {
            if (
              p?.id !== patientId
            ) {
              return p;
            }

            const existingNotes =
              Array.isArray(
                p.progressNotes
              )
                ? p.progressNotes
                : [];

            const readmitNote:
              ProgressNote = {
                id:
                  `note-${Date.now()}`,

                timestamp:
                  `${mm}/${dd} — ${timeStr}`,

                author:
                  p.attendingPhysician ||
                  'Attending Physician',

                tag:
                  'Round',

                subjective:
                  `Patient re-admitted to intensive care (Assigned Bed ${safeBedNumber}).`,

                objective:
                  `Re-admission evaluation. Continuous hemodynamic monitoring initiated.`,

                assessment:
                  `Active ICU/CCU clinical management resumed for ${p.primaryDiagnosis || 'patient'}.`,

                plan:
                  '1. Connected to bedside telemetry & monitoring\n' +
                  '2. Vital signs and laboratory panel reassessment\n' +
                  '3. Continue targeted protocol'
              };

            const updated:
              PatientRecord = {
                ...p,

                isDischarged:
                  false,

                bedNumber:
                  safeBedNumber,

                status,

                progressNotes: [
                  ...existingNotes,
                  readmitNote
                ],

                lastUpdated:
                  `${now.toISOString().slice(0, 10)} ${timeStr}`
              };

            readmittedRecord =
              updated;

            return updated;
          });

        setPatients(next);

        if (activePin) {
          try {
            await savePatients(
              next,
              activePin
            );
          } catch (err) {
            console.error(
              'Local readmit save failed:',
              err
            );
          }
        }

        setPatientToReadmit(
          null
        );

        if (
          currentUser &&
          readmittedRecord
        ) {
          setCloudSyncStatus(
            'syncing'
          );

          try {
            await savePatientToCloud(
              currentUser.uid,
              readmittedRecord
            );

            setCloudSyncStatus(
              'synced'
            );
          } catch (err) {
            console.error(
              'Cloud readmit save failed:',
              err
            );

            setCloudSyncStatus(
              'error'
            );
          }
        }
      },
      [
        patients,
        activePin,
        currentUser
      ]
    );

  // =========================================================
  // Cloud Sync
  // =========================================================

  const handleManualSync =
    async () => {
      if (!currentUser) return;

      setCloudSyncStatus(
        'syncing'
      );

      try {
        await syncAllPatientsToCloud(
          currentUser.uid,
          safePatients
        );

        setCloudSyncStatus(
          'synced'
        );
      } catch (err) {
        console.error(
          'Manual sync failed:',
          err
        );

        setCloudSyncStatus(
          'error'
        );
      }
    };

  const handlePullCloudData =
    async () => {
      if (!currentUser) return;

      setCloudSyncStatus(
        'syncing'
      );

      try {
        const cloudData =
          await fetchCloudPatients(
            currentUser.uid
          );

        const safeCloudData =
          Array.isArray(cloudData)
            ? cloudData.filter(Boolean)
            : [];

        setPatients(
          safeCloudData
        );

        if (activePin) {
          try {
            await savePatients(
              safeCloudData,
              activePin
            );
          } catch (
            storageError
          ) {
            console.error(
              'Failed to cache cloud data:',
              storageError
            );
          }
        }

        setCloudSyncStatus(
          'synced'
        );
      } catch (err) {
        console.error(
          'Pull cloud data failed:',
          err
        );

        setCloudSyncStatus(
          'error'
        );
      }
    };

  // =========================================================
  // Beds
  // =========================================================

  const handleChangeTotalBeds =
    (newCount: number) => {
      const numeric =
        Number(newCount);

      if (
        !Number.isFinite(
          numeric
        )
      ) {
        return;
      }

      const safeCount =
        Math.max(
          3,
          Math.floor(numeric)
        );

      setTotalBeds(
        safeCount
      );

      try {
        localStorage.setItem(
          'icu_total_beds',
          String(safeCount)
        );
      } catch (err) {
        console.error(
          'Failed to save bed count:',
          err
        );
      }
    };

  const handleUpdatePatientBed =
    useCallback(
      async (
        patientId: string,
        newBedNumber:
          | string
          | number
      ) => {
        const targetPatient =
          patients.find(
            (p) =>
              p?.id === patientId
          );

        if (!targetPatient) {
          return;
        }

        const updated:
          PatientRecord = {
            ...targetPatient,
            bedNumber:
              String(
                newBedNumber
              )
          };

        await handleUpdatePatient(
          updated
        );
      },
      [
        patients,
        handleUpdatePatient
      ]
    );

  // =========================================================
  // Field Config
  // =========================================================

  const handleSaveFieldConfig =
    (
      newConfig:
        FieldVisibilityConfig
    ) => {
      if (!newConfig) {
        return;
      }

      setFieldConfig(
        newConfig
      );

      try {
        saveFieldConfig(
          newConfig
        );
      } catch (err) {
        console.error(
          'Failed to save field configuration:',
          err
        );
      }
    };

  // =========================================================
  // Auto Lock
  // =========================================================

  useEffect(() => {
    if (!isUnlocked) return;

    const updateActivity =
      () =>
        setLastActivity(
          Date.now()
        );

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

    const handleVisibilityChange =
      () => {
        if (
          document.hidden &&
          securitySettings.autoLockMinutes ===
            0
        ) {
          handleLockApp();
        }
      };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    const interval =
      window.setInterval(() => {
        if (
          securitySettings.autoLockMinutes >
          0
        ) {
          const inactiveMs =
            Date.now() -
            lastActivity;

          const limitMs =
            securitySettings.autoLockMinutes *
            60 *
            1000;

          if (
            inactiveMs >=
            limitMs
          ) {
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

      window.clearInterval(
        interval
      );
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

  const safePatients =
    Array.isArray(patients)
      ? patients.filter(Boolean)
      : [];

  const activePatients =
    safePatients.filter(
      (p) =>
        !p.isDischarged
    );

  const archivedPatients =
    safePatients.filter(
      (p) =>
        p.isDischarged
    );

  const occupiedPatients =
    activePatients.filter(
      (p) =>
        p.bedNumber !== '' &&
        p.bedNumber !== null &&
        p.bedNumber !== undefined
    );

  const occupiedCount =
    occupiedPatients.length;

  const availableCount =
    Math.max(
      0,
      totalBeds -
        occupiedCount
    );

  const criticalCount =
    activePatients.filter(
      (p) =>
        p.status ===
          'critical' ||
        p.status ===
          'deteriorating'
    ).length;

  const stableCount =
    activePatients.filter(
      (p) =>
        p.status ===
        'stable'
    ).length;

  const guardedCount =
    activePatients.filter(
      (p) =>
        p.status ===
        'guarded'
    ).length;

  const occupiedBedNumbers =
    new Set(
      occupiedPatients
        .map(
          (p) =>
            Number(
              p.bedNumber
            )
        )
        .filter(
          (n) =>
            Number.isFinite(n)
        )
    );

  const availableBeds =
    Array.from(
      {
        length: Math.max(
          0,
          totalBeds
        )
      },
      (_, i) =>
        i + 1
    ).filter(
      (b) =>
        !occupiedBedNumbers.has(
          b
        )
    );

  const activePatientRecord =
    selectedPatientId
      ? safePatients.find(
          (p) =>
            p.id ===
            selectedPatientId
        ) || null
      : null;

  const normalizedSearch =
    String(
      patientSearch || ''
    )
      .trim()
      .toLowerCase();

  const filteredPatients =
    safePatients.filter(
      (p) => {
        if (
          !normalizedSearch
        ) {
          return true;
        }

        return (
          String(
            p?.name || ''
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||

          String(
            p?.mrn || ''
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||

          String(
            p?.primaryDiagnosis ||
              ''
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||

          String(
            p?.bedNumber ??
              ''
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            )
        );
      }
    );

  // =========================================================
  // UI Helpers
  // =========================================================

  const tr = (
    path: string,
    fallback: string
  ) => {
    try {
      const translated =
        t(
          path,
          language
        );

      return translated ===
        path
        ? fallback
        : translated;
    } catch {
      return fallback;
    }
  };

  const surface =
    isDarkTheme
      ? 'bg-slate-900/70 border-slate-800'
      : 'bg-white border-slate-200';

  const surfaceSolid =
    isDarkTheme
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-slate-200';

  const secondarySurface =
    isDarkTheme
      ? 'bg-slate-800/70'
      : 'bg-slate-100';

  const primaryText =
    isDarkTheme
      ? 'text-white'
      : 'text-slate-900';

  const secondaryText =
    isDarkTheme
      ? 'text-slate-400'
      : 'text-slate-600';

  const mutedText =
    'text-slate-500';

  const textAlign =
    language === 'ar'
      ? 'text-right'
      : 'text-left';

  const direction =
    language === 'ar'
      ? 'rtl'
      : 'ltr';

  // Prevent unused state warnings while still
  // keeping theme synchronized for future settings.
  void theme;

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
    value:
      | number
      | string;
    icon: React.ElementType;
    subtitle: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full ${textAlign}
        rounded-2xl
        border
        ${surfaceSolid}
        p-4
        transition
        ${
          isDarkTheme
            ? 'hover:bg-slate-800/80'
            : 'hover:bg-slate-50'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">

          <p
            className={`text-xs ${secondaryText}`}
          >
            {title}
          </p>

          <p
            className={`text-2xl font-bold mt-1 ${primaryText}`}
          >
            {value}
          </p>

          <p
            className={`text-[11px] mt-1 ${mutedText}`}
          >
            {subtitle}
          </p>

        </div>

        <div
          className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            shrink-0
            ${secondarySurface}
          `}
        >
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
  }) => {
    const patientName =
      String(
        patient?.name || ''
      ).trim();

    const diagnosis =
      String(
        patient?.primaryDiagnosis ||
          ''
      ).trim();

    const status =
      String(
        patient?.status ||
          'unknown'
      );

    return (
      <button
        type="button"
        onClick={() =>
          patient?.id &&
          setSelectedPatientId(
            patient.id
          )
        }
        className={`
          w-full ${textAlign}
          p-4 rounded-2xl
          border
          ${surfaceSolid}
          transition
          ${
            isDarkTheme
              ? 'hover:bg-slate-800'
              : 'hover:bg-slate-50'
          }
        `}
      >
        <div className="flex items-center gap-3">

          <div
            className={`
              w-11 h-11
              rounded-xl
              flex items-center justify-center
              shrink-0
              ${secondarySurface}
            `}
          >
            <HeartPulse className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2 min-w-0">

              <p
                className={`font-semibold truncate ${primaryText}`}
              >
                {patientName ||
                  tr(
                    'patients.unnamed',
                    'Unnamed Patient'
                  )}
              </p>

              {!archived && (
                <span
                  className={`
                    text-[9px]
                    px-2 py-0.5
                    rounded-full
                    shrink-0
                    ${
                      status ===
                        'critical' ||
                      status ===
                        'deteriorating'
                        ? isDarkTheme
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-rose-100 text-rose-700'
                        : status ===
                            'stable'
                          ? isDarkTheme
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-700'
                          : isDarkTheme
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-amber-100 text-amber-700'
                    }
                  `}
                >
                  {status}
                </span>
              )}

            </div>

            <p
              className={`text-xs mt-1 truncate ${secondaryText}`}
            >
              {diagnosis ||
                tr(
                  'patients.noDiagnosis',
                  'No diagnosis recorded'
                )}
            </p>

            <div
              className={`
                flex flex-wrap
                gap-x-3 gap-y-1
                mt-2 text-[10px]
                ${mutedText}
              `}
            >
              <span>
                ID:{' '}
                {patient?.mrn ||
                  '—'}
              </span>

              <span>
                {patient?.age ||
                  '—'}{' '}
                {tr(
                  'common.years',
                  'yrs'
                )}
              </span>

              {patient?.bedNumber !==
                '' && (
                <span>
                  {tr(
                    'common.bed',
                    'Bed'
                  )}{' '}
                  {patient?.bedNumber ??
                    '—'}
                </span>
              )}
            </div>

          </div>

          <ChevronRight
            className={`
              w-4 h-4 shrink-0
              ${mutedText}
              ${
                language === 'ar'
                  ? 'rotate-180'
                  : ''
              }
            `}
          />

        </div>
      </button>
    );
  };

  // =========================================================
  // Home Page
  // =========================================================

  const HomePage = () => (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className={textAlign}>

          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            {tr(
              'dashboard.title',
              'Clinical Dashboard'
            )}
          </p>

          <h2
            className={`text-2xl font-bold mt-1 ${primaryText}`}
          >
            CardioVault
          </h2>

          <p
            className={`text-sm mt-1 ${secondaryText}`}
          >
            {tr(
              'dashboard.subtitle',
              'ICU & CCU patient management'
            )}
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setAdmitBedNumber(
              availableBeds[0] ||
                1
            )
          }
          className="
            flex items-center justify-center gap-2
            bg-cyan-600
            hover:bg-cyan-500
            text-white
            px-4 py-3
            rounded-xl
            font-semibold
            text-sm
          "
        >
          <Plus className="w-4 h-4" />

          {tr(
            'patients.admit',
            'Admit Patient'
          )}
        </button>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <StatCard
          title={tr(
            'dashboard.totalBeds',
            'Total Beds'
          )}
          value={
            totalBeds
          }
          subtitle={`${occupiedCount} ${tr(
            'dashboard.occupied',
            'occupied'
          )}`}
          icon={BedDouble}
          onClick={() =>
            setActiveTab(
              'beds'
            )
          }
        />

        <StatCard
          title={tr(
            'dashboard.available',
            'Available'
          )}
          value={
            availableCount
          }
          subtitle={tr(
            'dashboard.bedsAvailable',
            'Beds available'
          )}
          icon={CheckCircle2}
          onClick={() =>
            setActiveTab(
              'beds'
            )
          }
        />

        <StatCard
          title={tr(
            'dashboard.critical',
            'Critical'
          )}
          value={
            criticalCount
          }
          subtitle={tr(
            'dashboard.criticalSubtitle',
            'Critical / deteriorating'
          )}
          icon={AlertTriangle}
          onClick={() =>
            setActiveTab(
              'patients'
            )
          }
        />

        <StatCard
          title={tr(
            'dashboard.archive',
            'Archive'
          )}
          value={
            archivedPatients.length
          }
          subtitle={tr(
            'dashboard.dischargedCases',
            'Discharged cases'
          )}
          icon={Archive}
          onClick={() =>
            setActiveTab(
              'archive'
            )
          }
        />

      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div
          className={`
            lg:col-span-2
            rounded-2xl border
            ${surface}
            p-4
          `}
        >

          <div className="flex items-center justify-between gap-3 mb-4">

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'dashboard.currentPatients',
                  'Current Patients'
                )}
              </h3>

              <p
                className={`text-xs mt-1 ${mutedText}`}
              >
                {tr(
                  'dashboard.activeCases',
                  'Active ICU / CCU cases'
                )}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'patients'
                )
              }
              className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              {tr(
                'common.viewAll',
                'View all'
              )}
            </button>

          </div>

          {activePatients.length ===
          0 ? (
            <div className="py-12 text-center">

              <Users
                className={`
                  w-10 h-10 mx-auto
                  ${
                    isDarkTheme
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }
                `}
              />

              <p
                className={`text-sm mt-3 ${secondaryText}`}
              >
                {tr(
                  'dashboard.noActivePatients',
                  'No active patients'
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  setAdmitBedNumber(
                    availableBeds[0] ||
                      1
                  )
                }
                className="text-xs text-cyan-400 mt-2"
              >
                {tr(
                  'dashboard.addFirstPatient',
                  'Add first patient'
                )}
              </button>

            </div>
          ) : (
            <div className="space-y-2">
              {activePatients
                .slice(0, 5)
                .map(
                  (
                    patient
                  ) => (
                    <PatientRow
                      key={
                        patient.id
                      }
                      patient={
                        patient
                      }
                    />
                  )
                )}
            </div>
          )}

        </div>

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-4
          `}
        >

          <h3
            className={`font-semibold ${primaryText}`}
          >
            {tr(
              'dashboard.bedOverview',
              'Bed Overview'
            )}
          </h3>

          <div className="mt-4 space-y-3">

            <div className="flex items-center justify-between">

              <span
                className={`text-xs ${secondaryText}`}
              >
                {tr(
                  'dashboard.occupied',
                  'Occupied'
                )}
              </span>

              <span className="text-sm font-semibold text-cyan-300">
                {occupiedCount}
              </span>

            </div>

            <div
              className={`
                h-2 rounded-full overflow-hidden
                ${
                  isDarkTheme
                    ? 'bg-slate-800'
                    : 'bg-slate-200'
                }
              `}
            >
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{
                  width: `${
                    totalBeds
                      ? Math.min(
                          100,
                          (
                            occupiedCount /
                            totalBeds
                          ) *
                            100
                        )
                      : 0
                  }%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">

              <div
                className={`
                  rounded-xl p-3
                  ${secondarySurface}
                `}
              >
                <p
                  className={`text-[10px] ${mutedText}`}
                >
                  {tr(
                    'dashboard.stable',
                    'Stable'
                  )}
                </p>

                <p className="text-lg font-bold text-emerald-400">
                  {stableCount}
                </p>
              </div>

              <div
                className={`
                  rounded-xl p-3
                  ${secondarySurface}
                `}
              >
                <p
                  className={`text-[10px] ${mutedText}`}
                >
                  {tr(
                    'dashboard.guarded',
                    'Guarded'
                  )}
                </p>

                <p className="text-lg font-bold text-amber-400">
                  {guardedCount}
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                'beds'
              )
            }
            className={`
              w-full mt-4 py-2.5
              rounded-xl border
              text-xs
              ${
                isDarkTheme
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }
            `}
          >
            {tr(
              'dashboard.openBedBoard',
              'Open Bed Board'
            )}
          </button>

        </div>
      </div>

      <div
        className={`
          rounded-2xl border
          ${surface}
          p-4
        `}
      >

        <div className="flex items-center gap-2 mb-4">

          <Activity className="w-4 h-4 text-cyan-400" />

          <h3
            className={`font-semibold ${primaryText}`}
          >
            {tr(
              'dashboard.quickTools',
              'Quick Clinical Tools'
            )}
          </h3>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

          <button
            type="button"
            onClick={() =>
              setShowCalculators(
                true
              )
            }
            className={`
              p-3 rounded-xl
              ${textAlign}
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <Activity className="w-4 h-4 text-amber-400" />

            <p
              className={`text-xs font-semibold mt-2 ${primaryText}`}
            >
              {tr(
                'dashboard.calculators',
                'Calculators'
              )}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowCustomizer(
                true
              )
            }
            className={`
              p-3 rounded-xl
              ${textAlign}
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />

            <p
              className={`text-xs font-semibold mt-2 ${primaryText}`}
            >
              {tr(
                'dashboard.customize',
                'Customize'
              )}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowCloudAccountModal(
                true
              )
            }
            className={`
              p-3 rounded-xl
              ${textAlign}
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />

            <p
              className={`text-xs font-semibold mt-2 ${primaryText}`}
            >
              {tr(
                'dashboard.cloudSync',
                'Cloud Sync'
              )}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowSecurityModal(
                true
              )
            }
            className={`
              p-3 rounded-xl
              ${textAlign}
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <ShieldCheck className="w-4 h-4 text-violet-400" />

            <p
              className={`text-xs font-semibold mt-2 ${primaryText}`}
            >
              {tr(
                'dashboard.security',
                'Security'
              )}
            </p>
          </button>

        </div>
      </div>

    </div>
  );

  // =========================================================
  // Patients Page
  // =========================================================

  const PatientsPage = () => {
    const visiblePatients =
      filteredPatients.filter(
        (p) =>
          !p.isDischarged
      );

    return (
      <div className="space-y-5">

        <div className={textAlign}>

          <h2
            className={`text-2xl font-bold ${primaryText}`}
          >
            {tr(
              'patients.title',
              'Patients'
            )}
          </h2>

          <p
            className={`text-sm mt-1 ${secondaryText}`}
          >
            {tr(
              'patients.subtitle',
              'Active ICU / CCU patient records'
            )}
          </p>

        </div>

        <div className="relative">

          <Search
            className={`
              absolute
              ${
                language === 'ar'
                  ? 'right-3'
                  : 'left-3'
              }
              top-1/2
              -translate-y-1/2
              w-4 h-4
              ${mutedText}
            `}
          />

          <input
            value={
              patientSearch
            }
            onChange={(e) =>
              setPatientSearch(
                e.target.value
              )
            }
            placeholder={tr(
              'patients.search',
              'Search by name, ID, diagnosis or bed...'
            )}
            dir={direction}
            className={`
              w-full
              border
              rounded-xl
              ${
                isDarkTheme
                  ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }
              ${
                language === 'ar'
                  ? 'pr-10 pl-4'
                  : 'pl-10 pr-4'
              }
              py-3
              text-sm
              outline-none
              focus:border-cyan-600
            `}
          />

        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">

          <span
            className={`
              px-3 py-1.5 rounded-full
              ${
                isDarkTheme
                  ? 'bg-cyan-950 text-cyan-300'
                  : 'bg-cyan-100 text-cyan-700'
              }
              text-xs whitespace-nowrap
            `}
          >
            {tr(
              'patients.active',
              'Active'
            )}
            : {activePatients.length}
          </span>

          <span
            className={`
              px-3 py-1.5 rounded-full
              ${
                isDarkTheme
                  ? 'bg-rose-950 text-rose-300'
                  : 'bg-rose-100 text-rose-700'
              }
              text-xs whitespace-nowrap
            `}
          >
            {tr(
              'patients.critical',
              'Critical'
            )}
            : {criticalCount}
          </span>

          <span
            className={`
              px-3 py-1.5 rounded-full
              ${
                isDarkTheme
                  ? 'bg-emerald-950 text-emerald-300'
                  : 'bg-emerald-100 text-emerald-700'
              }
              text-xs whitespace-nowrap
            `}
          >
            {tr(
              'patients.stable',
              'Stable'
            )}
            : {stableCount}
          </span>

        </div>

        {visiblePatients.length ===
        0 ? (

          <div
            className={`
              rounded-2xl border
              ${surface}
              py-16 text-center
            `}
          >
            <Users
              className={`
                w-12 h-12 mx-auto
                ${
                  isDarkTheme
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }
              `}
            />

            <p
              className={`text-sm mt-3 ${secondaryText}`}
            >
              {tr(
                'patients.noMatching',
                'No matching active patients'
              )}
            </p>
          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-3">

            {visiblePatients.map(
              (patient) => (
                <PatientRow
                  key={
                    patient.id
                  }
                  patient={
                    patient
                  }
                />
              )
            )}

          </div>
        )}

      </div>
    );
  };

  // =========================================================
  // Beds Page
  // =========================================================

  const BedsPage = () => (
    <CensusView
      patients={
        safePatients
      }
      totalBeds={
        totalBeds
      }
      specialtyMode={
        specialtyMode
      }
      onSelectPatient={(pt) =>
        pt?.id &&
        setSelectedPatientId(
          pt.id
        )
      }
      onAdmitToBed={(bedNum) =>
        setAdmitBedNumber(
          Number(bedNum) || 1
        )
      }
      onDischargePatient={(pt) =>
        pt &&
        setPatientToDischarge(
          pt
        )
      }
      onReadmitPatient={(pt) =>
        pt &&
        setPatientToReadmit(
          pt
        )
      }
      onChangeTotalBeds={
        handleChangeTotalBeds
      }
      onUpdatePatientBed={
        handleUpdatePatientBed
      }
    />
  );

  // =========================================================
  // Archive Page
  // =========================================================

  const ArchivePage = () => {
    const visiblePatients =
      filteredPatients.filter(
        (p) =>
          p.isDischarged
      );

    return (
      <div className="space-y-5">

        <div className={textAlign}>

          <h2
            className={`text-2xl font-bold ${primaryText}`}
          >
            {tr(
              'archive.title',
              'Archive'
            )}
          </h2>

          <p
            className={`text-sm mt-1 ${secondaryText}`}
          >
            {tr(
              'archive.subtitle',
              'Discharged patients and completed cases'
            )}
          </p>

        </div>

        <div className="relative">

          <Search
            className={`
              absolute
              ${
                language === 'ar'
                  ? 'right-3'
                  : 'left-3'
              }
              top-1/2
              -translate-y-1/2
              w-4 h-4
              ${mutedText}
            `}
          />

          <input
            value={
              patientSearch
            }
            onChange={(e) =>
              setPatientSearch(
                e.target.value
              )
            }
            placeholder={tr(
              'archive.search',
              'Search archived patients...'
            )}
            dir={direction}
            className={`
              w-full
              border
              rounded-xl
              ${
                isDarkTheme
                  ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }
              ${
                language === 'ar'
                  ? 'pr-10 pl-4'
                  : 'pl-10 pr-4'
              }
              py-3
              text-sm
              outline-none
              focus:border-cyan-600
            `}
          />

        </div>

        {visiblePatients.length ===
        0 ? (

          <div
            className={`
              rounded-2xl border
              ${surface}
              py-16 text-center
            `}
          >

            <Archive
              className={`
                w-12 h-12 mx-auto
                ${
                  isDarkTheme
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }
              `}
            />

            <p
              className={`text-sm mt-3 ${secondaryText}`}
            >
              {tr(
                'archive.empty',
                'Archive is empty'
              )}
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-3">

            {visiblePatients.map(
              (patient) => (
                <PatientRow
                  key={
                    patient.id
                  }
                  patient={
                    patient
                  }
                  archived
                />
              )
            )}

          </div>
        )}

      </div>
    );
  };

  // =========================================================
  // Settings Page
  // =========================================================

  const SettingsPage = () => (
    <div className="space-y-5">

      <div className={textAlign}>

        <h2
          className={`text-2xl font-bold ${primaryText}`}
        >
          {tr(
            'settings.title',
            'Settings'
          )}
        </h2>

        <p
          className={`text-sm mt-1 ${secondaryText}`}
        >
          {tr(
            'settings.subtitle',
            'CardioVault configuration'
          )}
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {/* Bed Configuration */}

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-5
          `}
        >

          <div className="flex items-center gap-3 mb-4">

            <BedDouble className="w-5 h-5 text-cyan-400" />

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'settings.bedConfiguration',
                  'Bed Configuration'
                )}
              </h3>

              <p
                className={`text-[11px] ${mutedText}`}
              >
                {tr(
                  'settings.bedDescription',
                  'Set the total number of ICU/CCU beds'
                )}
              </p>

            </div>

          </div>

          <label
            className={`text-xs ${secondaryText}`}
          >
            {tr(
              'settings.totalBeds',
              'Total Beds'
            )}
          </label>

          <div className="flex gap-2 mt-2">

            <input
              type="number"
              min={3}
              value={
                totalBeds
              }
              onChange={(e) =>
                handleChangeTotalBeds(
                  Number(
                    e.target.value
                  )
                )
              }
              className={`
                flex-1
                border
                rounded-xl
                px-3 py-3
                outline-none
                focus:border-cyan-600
                ${
                  isDarkTheme
                    ? 'bg-slate-950 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }
              `}
            />

            <div
              className={`
                px-4 rounded-xl
                flex items-center
                text-xs
                ${secondaryText}
                ${secondarySurface}
              `}
            >
              {tr(
                'settings.beds',
                'beds'
              )}
            </div>

          </div>

          <p
            className={`text-[10px] mt-2 ${mutedText}`}
          >
            {tr(
              'settings.minimumBeds',
              'Minimum 3 beds.'
            )}
          </p>

        </div>

        {/* Security */}

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-5
          `}
        >

          <div className="flex items-center gap-3 mb-4">

            <ShieldCheck className="w-5 h-5 text-violet-400" />

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'settings.security',
                  'Security'
                )}
              </h3>

              <p
                className={`text-[11px] ${mutedText}`}
              >
                {tr(
                  'settings.securityDescription',
                  'PIN and automatic lock'
                )}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowSecurityModal(
                true
              )
            }
            className={`
              w-full
              flex items-center justify-between
              p-3 rounded-xl
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <span
              className={`text-sm ${primaryText}`}
            >
              {tr(
                'settings.securitySettings',
                'Security Settings'
              )}
            </span>

            <ChevronRight
              className={`
                w-4 h-4 ${mutedText}
                ${
                  language === 'ar'
                    ? 'rotate-180'
                    : ''
                }
              `}
            />
          </button>

        </div>

        {/* Patient Fields */}

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-5
          `}
        >

          <div className="flex items-center gap-3 mb-4">

            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'settings.patientFields',
                  'Patient Fields'
                )}
              </h3>

              <p
                className={`text-[11px] ${mutedText}`}
              >
                {tr(
                  'settings.patientFieldsDescription',
                  'Customize visible clinical sections'
                )}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowCustomizer(
                true
              )
            }
            className={`
              w-full
              flex items-center justify-between
              p-3 rounded-xl
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            <span
              className={`text-sm ${primaryText}`}
            >
              {tr(
                'settings.customizeFields',
                'Customize Fields'
              )}
            </span>

            <ChevronRight
              className={`
                w-4 h-4 ${mutedText}
                ${
                  language === 'ar'
                    ? 'rotate-180'
                    : ''
                }
              `}
            />
          </button>

        </div>

        {/* Language */}

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-5
          `}
        >

          <div className="flex items-center gap-3 mb-4">

            <Languages className="w-5 h-5 text-cyan-400" />

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'settings.language',
                  language === 'ar'
                    ? 'اللغة'
                    : 'Language'
                )}
              </h3>

              <p
                className={`text-[11px] ${mutedText}`}
              >
                {tr(
                  'settings.languageDescription',
                  language === 'ar'
                    ? 'اختر لغة واجهة التطبيق'
                    : 'Choose the application language'
                )}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                setLanguageState(
                  'en'
                )
              }
              className={`
                p-3 rounded-xl
                border
                text-sm
                font-semibold
                transition
                ${
                  language ===
                  'en'
                    ? isDarkTheme
                      ? 'border-cyan-600 bg-cyan-950 text-cyan-300'
                      : 'border-cyan-600 bg-cyan-50 text-cyan-700'
                    : isDarkTheme
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              English
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguageState(
                  'ar'
                )
              }
              className={`
                p-3 rounded-xl
                border
                text-sm
                font-semibold
                transition
                ${
                  language ===
                  'ar'
                    ? isDarkTheme
                      ? 'border-cyan-600 bg-cyan-950 text-cyan-300'
                      : 'border-cyan-600 bg-cyan-50 text-cyan-700'
                    : isDarkTheme
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              العربية
            </button>

          </div>

        </div>

        {/* Cloud Sync */}

        <div
          className={`
            rounded-2xl border
            ${surface}
            p-5
          `}
        >

          <div className="flex items-center gap-3 mb-4">

            <Cloud className="w-5 h-5 text-emerald-400" />

            <div className={textAlign}>

              <h3
                className={`font-semibold ${primaryText}`}
              >
                {tr(
                  'settings.cloudSync',
                  'Cloud Sync'
                )}
              </h3>

              <p
                className={`text-[11px] ${mutedText}`}
              >
                {tr(
                  'settings.cloudDescription',
                  'Backup and multi-device sync'
                )}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 mb-3">

            {cloudSyncStatus ===
            'syncing' ? (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : cloudSyncStatus ===
              'synced' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : cloudSyncStatus ===
              'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <Clock3 className="w-4 h-4 text-slate-500" />
            )}

            <span
              className={`text-xs ${secondaryText}`}
            >
              {cloudSyncStatus ===
              'syncing'
                ? tr(
                    'settings.syncing',
                    'Syncing...'
                  )
                : cloudSyncStatus ===
                    'synced'
                  ? tr(
                      'settings.synced',
                      'Synced'
                    )
                  : cloudSyncStatus ===
                      'error'
                    ? tr(
                        'settings.syncError',
                        'Sync error'
                      )
                    : tr(
                        'settings.offline',
                        'Offline'
                      )}
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowCloudAccountModal(
                true
              )
            }
            className={`
              w-full p-3 rounded-xl
              text-sm
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }
            `}
          >
            {tr(
              'settings.cloudAccount',
              'Cloud Account'
            )}
          </button>

        </div>

      </div>

      {/* Session */}

      <div
        className={`
          rounded-2xl border
          ${surface}
          p-5
        `}
      >

        <div className="flex items-center gap-3">

          <LogOut className="w-5 h-5 text-rose-400" />

          <div className={`flex-1 ${textAlign}`}>

            <h3
              className={`font-semibold ${primaryText}`}
            >
              {tr(
                'settings.session',
                'Session'
              )}
            </h3>

            <p
              className={`text-[11px] ${mutedText}`}
            >
              {currentUser?.email ||
                tr(
                  'settings.offlineLocal',
                  'Offline / Local mode'
                )}
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleLockApp
            }
            className={`
              px-3 py-2
              rounded-xl
              text-xs
              ${
                isDarkTheme
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }
            `}
          >
            {tr(
              'settings.lock',
              'Lock'
            )}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className={`
                px-3 py-2
                rounded-xl
                text-xs
                ${
                  isDarkTheme
                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-300'
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                }
              `}
            >
              {tr(
                'settings.logout',
                'Logout'
              )}
            </button>
          )}

        </div>
      </div>

      {/* Footer */}

      <div
        className={`
          rounded-2xl border
          ${
            isDarkTheme
              ? 'border-slate-800 bg-slate-900/50'
              : 'border-slate-200 bg-slate-50'
          }
          p-4
        `}
      >

        <div className="flex items-center gap-2">

          <Wrench
            className={`w-4 h-4 ${mutedText}`}
          />

          <p
            className={`text-xs ${mutedText}`}
          >
            CardioVault • ICU & CCU Clinical Notebook
          </p>

        </div>

      </div>

    </div>
  );

  // =========================================================
  // Render Active Page
  // =========================================================

  const renderActivePage =
    () => {
      switch (activeTab) {
        case 'patients':
          return (
            <PatientsPage />
          );

        case 'beds':
          return (
            <BedsPage />
          );

        case 'archive':
          return (
            <ArchivePage />
          );

        case 'settings':
          return (
            <SettingsPage />
          );

        case 'home':
        default:
          return (
            <HomePage />
          );
      }
    };

  // =========================================================
  // Auth Loading
  // =========================================================

  if (authLoading) {
    return (
      <div
        dir={direction}
        className={`
          min-h-screen
          flex flex-col
          items-center justify-center
          p-4
          ${
            isDarkTheme
              ? 'bg-slate-950 text-slate-100'
              : 'bg-slate-50 text-slate-900'
          }
        `}
      >

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-xl mb-4 animate-pulse">

          <div
            className={`
              w-full h-full
              rounded-[14px]
              flex items-center justify-center
              ${
                isDarkTheme
                  ? 'bg-slate-900'
                  : 'bg-white'
              }
            `}
          >
            <HeartPulse className="w-7 h-7 text-cyan-400" />
          </div>

        </div>

        <p
          className={`text-sm font-semibold ${
            isDarkTheme
              ? 'text-slate-200'
              : 'text-slate-700'
          }`}
        >
          {language === 'ar'
            ? 'جاري التحقق من جلسة العمل السريرية...'
            : 'Checking clinical session...'}
        </p>

        <p
          className={`text-xs mt-1 ${mutedText}`}
        >
          CardioVault
        </p>

      </div>
    );
  }

  // =========================================================
  // Login
  // =========================================================

  if (
    !currentUser &&
    !isOfflineBypassed
  ) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setIsUnlocked(
            true
          );
        }}
        onContinueOffline={
          async (pin) => {
            setIsOfflineBypassed(
              true
            );

            const pinToUse =
              typeof pin === 'string' &&
              pin.length > 0
                ? pin
                : '0000';

            setActivePin(
              pinToUse
            );

            setIsUnlocked(
              true
            );

            try {
              const loaded =
                await loadPatients(
                  pinToUse
                );

              setPatients(
                Array.isArray(
                  loaded
                )
                  ? loaded.filter(
                      Boolean
                    )
                  : []
              );
            } catch (err) {
              console.error(
                'Failed to load offline patients:',
                err
              );

              setPatients([]);
            }
          }
        }
        securitySettings={
          securitySettings
        }
      />
    );
  }

  // =========================================================
  // Lock Screen
  // =========================================================

  if (!isUnlocked) {
    return (
      <LockScreen
        securitySettings={
          securitySettings
        }
        onUnlockSuccess={
          handleUnlockSuccess
        }
      />
    );
  }

  // =========================================================
  // Main Application
  // =========================================================

  return (
    <div
      dir={direction}
      lang={language}
      className={`
        min-h-screen
        flex flex-col
        selection:bg-cyan-500/30
        selection:text-cyan-200
        ${
          isDarkTheme
            ? 'bg-slate-950 text-slate-100'
            : 'bg-slate-50 text-slate-900'
        }
      `}
    >

      <Navbar
        specialtyMode={
          specialtyMode
        }
        onSetSpecialtyMode={
          setSpecialtyMode
        }

        activeTab={
          activeTab
        }
        onTabChange={
          setActiveTab
        }

        patients={
          safePatients
        }
        totalBeds={
          totalBeds
        }

        currentUser={
          currentUser
        }
        cloudSyncStatus={
          cloudSyncStatus
        }

        onOpenCloudAccount={() =>
          setShowCloudAccountModal(
            true
          )
        }

        onOpenNewPatientModal={() =>
          setAdmitBedNumber(
            availableBeds[0] ||
              1
          )
        }

        onOpenCalculators={() =>
          setShowCalculators(
            true
          )
        }

        onOpenCustomizer={() =>
          setShowCustomizer(
            true
          )
        }

        onOpenSecurity={() =>
          setShowSecurityModal(
            true
          )
        }

        onOpenApkGuide={() =>
          setShowApkModal(
            true
          )
        }

        onOpenPrintHandover={() =>
          setShowPrintView(
            true
          )
        }

        onLockSession={
          handleLockApp
        }

        onLogout={
          handleLogout
        }
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
          patient={
            activePatientRecord
          }
          fieldConfig={
            fieldConfig
          }
          specialtyMode={
            specialtyMode
          }

          onUpdatePatient={
            handleUpdatePatient
          }

          onDeletePatient={
            handleDeletePatient
          }

          onDischargePatient={
            (pt) =>
              pt &&
              setPatientToDischarge(
                pt
              )
          }

          onReadmitPatient={
            (pt) =>
              pt &&
              setPatientToReadmit(
                pt
              )
          }

          onPrintPatient={
            (pt) => {
              if (!pt) return;

              setPatientToPrint(
                pt
              );

              setShowPrintView(
                true
              );
            }
          }

          onClose={() =>
            setSelectedPatientId(
              null
            )
          }
        />
      )}

      {/* Admit */}

      {admitBedNumber !==
        null && (
        <AdmitPatientModal
          bedNumber={
            admitBedNumber
          }
          specialtyMode={
            specialtyMode
          }
          onAdmit={
            handleAdmitPatient
          }
          onClose={() =>
            setAdmitBedNumber(
              null
            )
          }
        />
      )}

      {/* Calculators */}

      {showCalculators && (
        <ClinicalCalculatorsModal
          onClose={() =>
            setShowCalculators(
              false
            )
          }
        />
      )}

      {/* Customizer */}

      {showCustomizer && (
        <FieldCustomizerModal
          config={
            fieldConfig
          }
          onSaveConfig={
            handleSaveFieldConfig
          }
          onClose={() =>
            setShowCustomizer(
              false
            )
          }
        />
      )}

      {/* Security */}

      {showSecurityModal && (
        <SecuritySettingsModal
          securitySettings={
            securitySettings
          }

          patients={
            safePatients
          }

          currentActivePin={
            activePin
          }

          onUpdateSecurity={
            (newSettings) =>
              setSecuritySettings(
                newSettings
              )
          }

          onRestorePatients={
            (restored) =>
              updatePatients(
                Array.isArray(
                  restored
                )
                  ? restored
                  : []
              )
          }

          onClose={() =>
            setShowSecurityModal(
              false
            )
          }
        />
      )}

      {/* APK Guide */}

      {showApkModal && (
        <AndroidApkModal
          onClose={() =>
            setShowApkModal(
              false
            )
          }
        />
      )}

      {/* Print */}

      {showPrintView && (
        <PrintableView
          patients={
            safePatients
          }
          activePatient={
            patientToPrint
          }

          onClose={() => {
            setShowPrintView(
              false
            );

            setPatientToPrint(
              null
            );
          }}
        />
      )}

      {/* Discharge */}

      {patientToDischarge && (
        <DischargePatientModal
          patient={
            patientToDischarge
          }

          onConfirmDischarge={
            handleDischargePatient
          }

          onClose={() =>
            setPatientToDischarge(
              null
            )
          }
        />
      )}

      {/* Readmit */}

      {patientToReadmit && (
        <ReadmitPatientModal
          patient={
            patientToReadmit
          }

          availableBeds={
            availableBeds
          }

          onReadmit={
            handleReadmitPatient
          }

          onClose={() =>
            setPatientToReadmit(
              null
            )
          }
        />
      )}

      {/* Cloud */}

      {showCloudAccountModal && (
        <CloudAccountModal
          currentUser={
            currentUser
          }

          cloudSyncStatus={
            cloudSyncStatus
          }

          patients={
            safePatients
          }

          onManualSync={
            handleManualSync
          }

          onPullCloudData={
            handlePullCloudData
          }

          onClose={() =>
            setShowCloudAccountModal(
              false
            )
          }
        />
      )}

    </div>
  );
}
