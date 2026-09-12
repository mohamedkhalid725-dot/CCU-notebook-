import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  Trash2,
  LogOut,
  RotateCcw,
  User,
  History,
  Stethoscope,
  TestTube2,
  Wind,
  Activity,
  Heart,
  Film,
  Pill,
  Syringe,
  Wrench,
  ClipboardList,
  Flame,
  Droplet,
  BedDouble,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import {
  PatientRecord,
  FieldVisibilityConfig,
  SpecialtyMode,
} from '../types';

import { PatientOverview } from './patient/PatientOverview';
import { PatientHistory } from './patient/PatientHistory';
import { PatientExamination } from './patient/PatientExamination';
import { PatientLabs } from './patient/PatientLabs';
import { PatientABG } from './patient/PatientABG';
import { PatientECG } from './patient/PatientECG';
import { PatientEcho } from './patient/PatientEcho';
import { PatientImaging } from './patient/PatientImaging';
import { PatientMedications } from './patient/PatientMedications';
import { PatientInfusions } from './patient/PatientInfusions';
import { PatientProcedures } from './patient/PatientProcedures';
import { PatientDailyRounds } from './patient/PatientDailyRounds';
import { PatientTimeline } from './patient/PatientTimeline';
import { PatientDischarge } from './patient/PatientDischarge';
import { PatientVitalsIO } from './patient/PatientVitalsIO';
import { PatientVentilation } from './patient/PatientVentilation';

interface PatientFileModalProps {
  patient: PatientRecord;
  fieldConfig: FieldVisibilityConfig;
  specialtyMode: SpecialtyMode;
  onUpdatePatient: (patient: PatientRecord) => void;
  onDeletePatient: (patient: PatientRecord) => void;
  onDischargePatient: (patient: PatientRecord) => void;
  onReadmitPatient: (patient: PatientRecord) => void;
  onPrintPatient: (patient: PatientRecord) => void;
  onClose: () => void;
}

type TabKey =
  | 'overview'
  | 'vitals_io'
  | 'ventilation'
  | 'history'
  | 'examination'
  | 'labs'
  | 'abg'
  | 'ecg'
  | 'echo'
  | 'imaging'
  | 'medications'
  | 'infusions'
  | 'procedures'
  | 'rounds'
  | 'events'
  | 'discharge';

export default function PatientFileModal({
  patient,
  fieldConfig,
  specialtyMode,
  onUpdatePatient,
  onDeletePatient,
  onDischargePatient,
  onReadmitPatient,
  onPrintPatient,
  onClose,
}: PatientFileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

  // Status color helper
  const getStatusBadgeColor = (status: PatientRecord['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'deteriorating':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'guarded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      case 'stable':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'post-op':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'discharged':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  const handleStatusChange = (newStatus: PatientRecord['status']) => {
    onUpdatePatient({
      ...patient,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  };

  const tabs: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: number | string }> = [
    { id: 'overview', label: 'Overview', icon: <User size={15} /> },
    {
      id: 'vitals_io',
      label: 'Vitals & I/O',
      icon: <Droplet size={15} />,
      badge: (patient.vitals?.length || 0) + (patient.fluidBalanceRecords?.length || patient.ioRecords?.length || 0) || undefined,
    },
    {
      id: 'ventilation',
      label: 'Ventilator',
      icon: <Wind size={15} />,
      badge: patient.ventilationRecords?.length || (patient.icuVentilator?.mode && patient.icuVentilator.mode !== 'Room Air' ? 1 : undefined),
    },
    { id: 'history', label: 'History', icon: <History size={15} /> },
    { id: 'examination', label: 'Physical Exam', icon: <Stethoscope size={15} /> },
    {
      id: 'labs',
      label: 'Labs & Biomarkers',
      icon: <TestTube2 size={15} />,
      badge: patient.labPanels?.length || undefined,
    },
    {
      id: 'abg',
      label: 'ABG',
      icon: <Wind size={15} />,
      badge: patient.abgRecords?.length || undefined,
    },
    {
      id: 'ecg',
      label: '12-Lead ECG',
      icon: <Activity size={15} />,
      badge: patient.ecgRecords?.length || undefined,
    },
    {
      id: 'echo',
      label: 'Echo (TTE)',
      icon: <Heart size={15} />,
      badge: patient.echoStudies?.length || undefined,
    },
    {
      id: 'imaging',
      label: 'Radiology & CT',
      icon: <Film size={15} />,
      badge: patient.imagingStudies?.length || undefined,
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: <Pill size={15} />,
      badge: patient.medications?.filter((m) => m.status === 'active').length || undefined,
    },
    {
      id: 'infusions',
      label: 'Infusions',
      icon: <Syringe size={15} />,
      badge: patient.infusions?.filter((i) => i.status === 'running' || i.status === 'active').length || undefined,
    },
    {
      id: 'procedures',
      label: 'Procedures',
      icon: <Wrench size={15} />,
      badge: patient.procedures?.length || undefined,
    },
    {
      id: 'rounds',
      label: 'Daily Rounds',
      icon: <ClipboardList size={15} />,
      badge: (patient.dailyNotes?.length || patient.progressNotes?.length) || undefined,
    },
    {
      id: 'events',
      label: 'Events & Code',
      icon: <Flame size={15} />,
      badge: patient.clinicalEvents?.length || undefined,
    },
    { id: 'discharge', label: 'Discharge Plan', icon: <LogOut size={15} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl h-[94vh] max-h-[950px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Sticky Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              <BedDouble size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {patient.name}
                </h2>
                {patient.gender && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({patient.gender}, {patient.age || '—'}y)
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {patient.bedName ? patient.bedName : `Bed ${patient.bedNumber}`}
                </span>
                {patient.mrn && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    MRN: {patient.mrn}
                  </span>
                )}
              </div>

              {(patient.primaryDiagnosis || patient.diagnosis) && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {patient.primaryDiagnosis || patient.diagnosis}
                </p>
              )}
            </div>
          </div>

          {/* Actions & Status Selection */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Acuity Status dropdown */}
            <select
              value={patient.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className={`text-xs font-bold uppercase rounded-xl px-2.5 py-1.5 border cursor-pointer ${getStatusBadgeColor(
                patient.status
              )}`}
            >
              <option value="stable" className="dark:bg-slate-900">Stable</option>
              <option value="guarded" className="dark:bg-slate-900">Guarded</option>
              <option value="deteriorating" className="dark:bg-slate-900">Deteriorating</option>
              <option value="critical" className="dark:bg-slate-900">Critical</option>
              <option value="post-op" className="dark:bg-slate-900">Post-Op</option>
              <option value="discharged" className="dark:bg-slate-900">Discharged</option>
            </select>

            {/* Export PDF Button */}
            <button
              onClick={() => onPrintPatient(patient)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition shadow-xs"
              title="Export Clinical File to PDF"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* Discharge Button */}
            {patient.status !== 'discharged' ? (
              <button
                onClick={() => setShowDischargeConfirm(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                title="Discharge Patient"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => onReadmitPatient(patient)}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                title="Readmit Patient"
              >
                <RotateCcw size={16} />
              </button>
            )}

            {/* Delete Patient Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete Record"
            >
              <Trash2 size={16} />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Tab Navigation Scrollable Bar */}
        <nav className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Modal Scrollable Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'overview' && (
                <PatientOverview
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'vitals_io' && (
                <PatientVitalsIO
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'ventilation' && (
                <PatientVentilation
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'history' && (
                <PatientHistory
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'examination' && (
                <PatientExamination
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'labs' && (
                <PatientLabs
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'abg' && (
                <PatientABG
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'ecg' && (
                <PatientECG
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'echo' && (
                <PatientEcho
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'imaging' && (
                <PatientImaging
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'medications' && (
                <PatientMedications
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'infusions' && (
                <PatientInfusions
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'procedures' && (
                <PatientProcedures
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'rounds' && (
                <PatientDailyRounds
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'events' && (
                <PatientTimeline
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {activeTab === 'discharge' && (
                <PatientDischarge
                  patient={patient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Patient Record?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This will permanently delete the clinical file for <strong>{patient.name}</strong>. This cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeletePatient(patient);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discharge Confirmation Modal */}
        {showDischargeConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Discharge {patient.name}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This will release the bed and move the patient file to the Discharged Registry.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setShowDischargeConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDischargePatient(patient);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition"
                >
                  Discharge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
