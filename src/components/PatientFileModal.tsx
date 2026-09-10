import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  HeartPulse,
  Image as ImageIcon,
  Info,
  Pill,
  Printer,
  Scissors,
  Stethoscope,
  Syringe,
  Trash2,
  User,
  Wind,
  X,
} from 'lucide-react';

import {
  PatientRecord,
  FieldVisibilityConfig,
  SpecialtyMode,
  VitalSignEntry,
  ProgressNote,
  Medication,
  Procedure,
} from '../types';

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

type SectionKey =
  | 'overview'
  | 'vitals'
  | 'io'
  | 'labs'
  | 'abg'
  | 'cardiology'
  | 'icu'
  | 'medications'
  | 'procedures'
  | 'timeline';

const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusLabel = (status: PatientRecord['status']) => {
  switch (status) {
    case 'critical':
      return 'Critical';
    case 'deteriorating':
      return 'Deteriorating';
    case 'guarded':
      return 'Guarded';
    case 'stable':
      return 'Stable';
    case 'post-op':
      return 'Post-op';
    case 'discharged':
      return 'Discharged';
    default:
      return 'Empty';
  }
};

const statusClass = (status: PatientRecord['status']) => {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900';
    case 'deteriorating':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900';
    case 'guarded':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900';
    case 'stable':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
    case 'post-op':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
    case 'discharged':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const emptyVital = (): VitalSignEntry => ({
  timestamp: new Date().toISOString(),
  hr: '',
  bpSystolic: '',
  bpDiastolic: '',
  rr: '',
  spo2: '',
  temp: '',
});

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
  const [activeSection, setActiveSection] =
    useState<SectionKey>('overview');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

  const [editingBasicInfo, setEditingBasicInfo] = useState(false);

  const [draft, setDraft] = useState({
    name: patient.name,
    age: String(patient.age ?? ''),
    gender: patient.gender,
    bedNumber: String(patient.bedNumber ?? ''),
    mrn: patient.mrn ?? '',
    primaryDiagnosis: patient.primaryDiagnosis ?? '',
    chiefComplaint: patient.chiefComplaint ?? '',
    attendingPhysician: patient.attendingPhysician ?? '',
    consultations: patient.consultations ?? '',
    imagingSummary: patient.imagingSummary ?? '',
    dischargeTransferPlan: patient.dischargeTransferPlan ?? '',
  });

  const [newNote, setNewNote] = useState({
    title: '',
    assessment: '',
    plan: '',
    subjective: '',
    objective: '',
    tag: 'Round' as ProgressNote['tag'],
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dose: '',
    route: '',
    frequency: '',
    category: 'other' as Medication['category'],
  });

  const [newProcedure, setNewProcedure] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 16),
    site: '',
    performer: '',
    notes: '',
  });

  const [newVital, setNewVital] = useState<VitalSignEntry>(emptyVital());

  const latestVital = useMemo(() => {
    if (!patient.vitals?.length) return null;

    return [...patient.vitals].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )[0];
  }, [patient.vitals]);

  const latestLab = useMemo(() => {
    if (!patient.labs?.length) return null;

    return [...patient.labs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )[0];
  }, [patient.labs]);

  const latestABG = useMemo(() => {
    if (!patient.abgRecords?.length) return null;

    return [...patient.abgRecords].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )[0];
  }, [patient.abgRecords]);

  const updatePatient = (changes: Partial<PatientRecord>) => {
    onUpdatePatient({
      ...patient,
      ...changes,
      lastUpdated: new Date().toISOString(),
    });
  };

  const saveBasicInfo = () => {
    updatePatient({
      name: draft.name,
      age: draft.age,
      gender: draft.gender,
      bedNumber: draft.bedNumber,
      mrn: draft.mrn,
      primaryDiagnosis: draft.primaryDiagnosis,
      chiefComplaint: draft.chiefComplaint,
      attendingPhysician: draft.attendingPhysician,
      consultations: draft.consultations,
      imagingSummary: draft.imagingSummary,
      dischargeTransferPlan: draft.dischargeTransferPlan,
    });

    setEditingBasicInfo(false);
  };

  const addVital = () => {
    if (
      !newVital.hr &&
      !newVital.bpSystolic &&
      !newVital.spo2 &&
      !newVital.temp
    ) {
      return;
    }

    updatePatient({
      vitals: [...(patient.vitals || []), newVital],
    });

    setNewVital(emptyVital());
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) return;

    const medication: Medication = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: newMedication.name,
      dose: newMedication.dose,
      route: newMedication.route,
      frequency: newMedication.frequency,
      category: newMedication.category,
    };

    updatePatient({
      medications: [...(patient.medications || []), medication],
    });

    setNewMedication({
      name: '',
      dose: '',
      route: '',
      frequency: '',
      category: 'other',
    });
  };

  const removeMedication = (id: string) => {
    updatePatient({
      medications: (patient.medications || []).filter(
        medication => medication.id !== id
      ),
    });
  };

  const addProcedure = () => {
    if (!newProcedure.name.trim()) return;

    const procedure: Procedure = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: newProcedure.name,
      date: new Date(newProcedure.date).toISOString(),
      site: newProcedure.site || undefined,
      performer: newProcedure.performer || undefined,
      notes: newProcedure.notes || undefined,
    };

    updatePatient({
      procedures: [...(patient.procedures || []), procedure],
    });

    setNewProcedure({
      name: '',
      date: new Date().toISOString().slice(0, 16),
      site: '',
      performer: '',
      notes: '',
    });
  };

  const addProgressNote = () => {
    if (!newNote.assessment.trim() && !newNote.plan.trim()) return;

    const note: ProgressNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      author: patient.attendingPhysician || 'Doctor',
      title: newNote.title || 'Clinical Note',
      subjective: newNote.subjective,
      objective: newNote.objective,
      assessment: newNote.assessment,
      plan: newNote.plan,
      tag: newNote.tag,
    };

    updatePatient({
      progressNotes: [note, ...(patient.progressNotes || [])],
    });

    setNewNote({
      title: '',
      assessment: '',
      plan: '',
      subjective: '',
      objective: '',
      tag: 'Round',
    });

    setActiveSection('timeline');
  };

  const removeVital = (timestamp: string) => {
    updatePatient({
      vitals: (patient.vitals || []).filter(
        vital => vital.timestamp !== timestamp
      ),
    });
  };

  const removeProcedure = (id: string) => {
    updatePatient({
      procedures: (patient.procedures || []).filter(
        procedure => procedure.id !== id
      ),
    });
  };

  const sectionAllowed = (section: SectionKey) => {
    switch (section) {
      case 'overview':
        return fieldConfig.patientInfo;
      case 'vitals':
        return fieldConfig.vitals;
      case 'io':
        return fieldConfig.ioBalance;
      case 'labs':
        return fieldConfig.labs;
      case 'abg':
        return fieldConfig.abg;
      case 'cardiology':
        return fieldConfig.ccuCardiology;
      case 'icu':
        return fieldConfig.icuVentilator || fieldConfig.icuScores;
      case 'medications':
        return fieldConfig.medications;
      case 'procedures':
        return fieldConfig.procedures;
      case 'timeline':
        return fieldConfig.progressNotesTimeline;
      default:
        return true;
    }
  };

  const sections: {
    key: SectionKey;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <User size={17} />,
    },
    {
      key: 'vitals',
      label: 'Vitals',
      icon: <HeartPulse size={17} />,
    },
    {
      key: 'io',
      label: 'I/O',
      icon: <Activity size={17} />,
    },
    {
      key: 'labs',
      label: 'Labs',
      icon: <FileText size={17} />,
    },
    {
      key: 'abg',
      label: 'ABG',
      icon: <Wind size={17} />,
    },
    {
      key: 'cardiology',
      label: 'Cardiology',
      icon: <Stethoscope size={17} />,
    },
    {
      key: 'icu',
      label: 'ICU',
      icon: <Activity size={17} />,
    },
    {
      key: 'medications',
      label: 'Medications',
      icon: <Pill size={17} />,
    },
    {
      key: 'procedures',
      label: 'Procedures',
      icon: <Syringe size={17} />,
    },
    {
      key: 'timeline',
      label: 'Timeline',
      icon: <Clock size={17} />,
    },
  ];

  const visibleSections = sections.filter(sectionAllowed);

  const renderField = (
    label: string,
    value: React.ReactNode,
    className = ''
  ) => (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>

      <div className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
        {value || '—'}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Patient Overview
                </h3>
                <p className="text-sm text-slate-500">
                  Main clinical information
                </p>
              </div>

              <button
                onClick={() => setEditingBasicInfo(value => !value)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingBasicInfo ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingBasicInfo ? (
              <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Patient Name"
                    value={draft.name}
                    onChange={value =>
                      setDraft({ ...draft, name: value })
                    }
                  />

                  <Input
                    label="Age"
                    value={draft.age}
                    onChange={value =>
                      setDraft({ ...draft, age: value })
                    }
                  />

                  <Select
                    label="Gender"
                    value={draft.gender}
                    options={['Male', 'Female', 'Other']}
                    onChange={value =>
                      setDraft({
                        ...draft,
                        gender: value as PatientRecord['gender'],
                      })
                    }
                  />

                  <Input
                    label="Bed Number"
                    value={draft.bedNumber}
                    onChange={value =>
                      setDraft({ ...draft, bedNumber: value })
                    }
                  />

                  <Input
                    label="Patient ID / MRN"
                    value={draft.mrn}
                    onChange={value =>
                      setDraft({ ...draft, mrn: value })
                    }
                  />

                  <Input
                    label="Attending Physician"
                    value={draft.attendingPhysician}
                    onChange={value =>
                      setDraft({
                        ...draft,
                        attendingPhysician: value,
                      })
                    }
                  />

                  <Input
                    label="Primary Diagnosis"
                    value={draft.primaryDiagnosis}
                    onChange={value =>
                      setDraft({
                        ...draft,
                        primaryDiagnosis: value,
                      })
                    }
                  />

                  <Input
                    label="Chief Complaint"
                    value={draft.chiefComplaint}
                    onChange={value =>
                      setDraft({
                        ...draft,
                        chiefComplaint: value,
                      })
                    }
                  />
                </div>

                <TextArea
                  label="Consultations"
                  value={draft.consultations}
                  onChange={value =>
                    setDraft({
                      ...draft,
                      consultations: value,
                    })
                  }
                />

                <TextArea
                  label="Imaging Summary"
                  value={draft.imagingSummary}
                  onChange={value =>
                    setDraft({
                      ...draft,
                      imagingSummary: value,
                    })
                  }
                />

                <TextArea
                  label="Discharge / Transfer Plan"
                  value={draft.dischargeTransferPlan}
                  onChange={value =>
                    setDraft({
                      ...draft,
                      dischargeTransferPlan: value,
                    })
                  }
                />

                <button
                  onClick={saveBasicInfo}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  Save Patient Information
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {renderField('Age', patient.age)}
                  {renderField('Gender', patient.gender)}
                  {renderField('Bed', patient.bedNumber)}
                  {renderField('Patient ID', patient.mrn)}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderField(
                    'Primary Diagnosis',
                    patient.primaryDiagnosis
                  )}

                  {renderField(
                    'Attending Physician',
                    patient.attendingPhysician
                  )}

                  {fieldConfig.chiefComplaint &&
                    renderField(
                      'Chief Complaint',
                      patient.chiefComplaint
                    )}

                  {renderField(
                    'Admission',
                    formatDate(patient.admissionDate)
                  )}
                </div>

                {fieldConfig.history && (
                  <InfoBox
                    title="History of Present Illness"
                    value={patient.historyOfPresentIllness}
                  />
                )}

                {fieldConfig.examination && (
                  <InfoBox
                    title="Examination Summary"
                    value={patient.examinationSummary}
                  />
                )}

                {fieldConfig.patientInfo && (
                  <InfoBox
                    title="Past Medical History"
                    value={patient.pastMedicalHistory}
                  />
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderField(
                    'Code Status',
                    patient.codeStatus
                  )}

                  {renderField(
                    'Last Updated',
                    formatDate(patient.lastUpdated)
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 'vitals':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Vital Signs"
              subtitle="Record and review bedside observations"
            />

            {latestVital && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <MetricCard
                  label="HR"
                  value={`${latestVital.hr || '—'} bpm`}
                />
                <MetricCard
                  label="BP"
                  value={`${latestVital.bpSystolic || '—'}/${latestVital.bpDiastolic || '—'}`}
                />
                <MetricCard
                  label="SpO₂"
                  value={`${latestVital.spo2 || '—'}%`}
                />
                <MetricCard
                  label="RR"
                  value={`${latestVital.rr || '—'}/min`}
                />
                <MetricCard
                  label="Temp"
                  value={`${latestVital.temp || '—'} °C`}
                />
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="mb-4 font-bold text-slate-900 dark:text-white">
                Add Vital Signs
              </h4>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Input
                  label="HR"
                  value={String(newVital.hr)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      hr: value,
                    })
                  }
                />

                <Input
                  label="SBP"
                  value={String(newVital.bpSystolic)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      bpSystolic: value,
                    })
                  }
                />

                <Input
                  label="DBP"
                  value={String(newVital.bpDiastolic)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      bpDiastolic: value,
                    })
                  }
                />

                <Input
                  label="RR"
                  value={String(newVital.rr)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      rr: value,
                    })
                  }
                />

                <Input
                  label="SpO₂"
                  value={String(newVital.spo2)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      spo2: value,
                    })
                  }
                />

                <Input
                  label="Temperature"
                  value={String(newVital.temp)}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      temp: value,
                    })
                  }
                />

                <Input
                  label="CVP"
                  value={String(newVital.cvp ?? '')}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      cvp: value,
                    })
                  }
                />

                <Input
                  label="Rhythm"
                  value={newVital.rhythm ?? ''}
                  onChange={value =>
                    setNewVital({
                      ...newVital,
                      rhythm: value,
                    })
                  }
                />
              </div>

              <button
                onClick={addVital}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
              >
                Add Vital Signs
              </button>
            </div>

            <div className="space-y-3">
              {[...(patient.vitals || [])]
                .reverse()
                .map((vital, index) => (
                  <div
                    key={`${vital.timestamp}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {formatDate(vital.timestamp)}
                      </span>

                      <button
                        onClick={() =>
                          removeVital(vital.timestamp)
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      {renderField('HR', vital.hr)}
                      {renderField(
                        'BP',
                        `${vital.bpSystolic}/${vital.bpDiastolic}`
                      )}
                      {renderField('SpO₂', vital.spo2)}
                      {renderField('RR', vital.rr)}
                      {renderField('Temp', vital.temp)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'io':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Fluid Balance"
              subtitle="Input, output and cumulative balance"
            />

            {(patient.ioRecords || []).length === 0 ? (
              <EmptyState text="No fluid balance records yet." />
            ) : (
              <div className="space-y-3">
                {[...(patient.ioRecords || [])]
                  .reverse()
                  .map((entry, index) => {
                    const intake =
                      Number(entry.intakeIV || 0) +
                      Number(entry.intakeEnteral || 0) +
                      Number(entry.intakeOther || 0);

                    const output =
                      Number(entry.outputUrine || 0) +
                      Number(entry.outputDrain || 0) +
                      Number(entry.outputGI || 0);

                    return (
                      <div
                        key={`${entry.timestamp}-${index}`}
                        className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="mb-3 text-xs text-slate-500">
                          {formatDate(entry.timestamp)}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {renderField('Total Intake', `${intake} mL`)}
                          {renderField('Total Output', `${output} mL`)}
                          {renderField(
                            'Balance',
                            `${intake - output} mL`
                          )}
                          {renderField(
                            'Urine',
                            `${entry.outputUrine || 0} mL`
                          )}
                        </div>

                        {entry.notes && (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );

      case 'labs':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Laboratory Results"
              subtitle="Latest and historical laboratory data"
            />

            {latestLab && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {renderField('Hb', latestLab.hb)}
                {renderField('WBC', latestLab.wbc)}
                {renderField('Platelets', latestLab.platelets)}
                {renderField('Na', latestLab.na)}
                {renderField('K', latestLab.k)}
                {renderField('Creatinine', latestLab.creatinine)}
                {renderField('Urea', latestLab.urea)}
                {renderField('Glucose', latestLab.glucose)}
                {renderField('Troponin', latestLab.troponin)}
                {renderField('CK-MB', latestLab.ckmb)}
                {renderField('BNP', latestLab.bnp)}
                {renderField('INR', latestLab.inr)}
                {renderField('aPTT', latestLab.aptt)}
                {renderField('CRP', latestLab.crp)}
                {renderField('PCT', latestLab.pct)}
                {renderField('Lactate', latestLab.lactate)}
              </div>
            )}

            <div className="space-y-3">
              {[...(patient.labs || [])]
                .reverse()
                .map((lab, index) => (
                  <div
                    key={`${lab.timestamp}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {formatDate(lab.timestamp)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {renderField('Hb', lab.hb)}
                      {renderField('WBC', lab.wbc)}
                      {renderField('PLT', lab.platelets)}
                      {renderField('Na', lab.na)}
                      {renderField('K', lab.k)}
                      {renderField('Cr', lab.creatinine)}
                      {renderField('Urea', lab.urea)}
                      {renderField('Troponin', lab.troponin)}
                      {renderField('CRP', lab.crp)}
                      {renderField('Lactate', lab.lactate)}
                    </div>
                  </div>
                ))}
            </div>

            {(patient.labs || []).length === 0 && (
              <EmptyState text="No laboratory results recorded." />
            )}
          </div>
        );

      case 'abg':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Arterial Blood Gas"
              subtitle="ABG history and oxygenation"
            />

            {latestABG && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {renderField('pH', latestABG.ph)}
                {renderField('PaCO₂', latestABG.pco2)}
                {renderField('PaO₂', latestABG.po2)}
                {renderField('HCO₃', latestABG.hco3)}
                {renderField('BE', latestABG.be)}
                {renderField('Lactate', latestABG.lactate)}
                {renderField('FiO₂', latestABG.fio2)}
                {renderField(
                  'P/F Ratio',
                  latestABG.pao2fio2Ratio
                )}
              </div>
            )}

            <div className="space-y-3">
              {[...(patient.abgRecords || [])]
                .reverse()
                .map((abg, index) => (
                  <div
                    key={`${abg.timestamp}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="mb-3 text-xs text-slate-500">
                      {formatDate(abg.timestamp)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {renderField('pH', abg.ph)}
                      {renderField('PaCO₂', abg.pco2)}
                      {renderField('PaO₂', abg.po2)}
                      {renderField('HCO₃', abg.hco3)}
                      {renderField('BE', abg.be)}
                      {renderField('Lactate', abg.lactate)}
                      {renderField('FiO₂', abg.fio2)}
                      {renderField('P/F', abg.pao2fio2Ratio)}
                    </div>

                    {abg.interpretation && (
                      <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                        <strong>Interpretation:</strong>{' '}
                        {abg.interpretation}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {(patient.abgRecords || []).length === 0 && (
              <EmptyState text="No ABG records recorded." />
            )}
          </div>
        );

      case 'cardiology':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Cardiology"
              subtitle="ECG, Echo and Cath / PCI information"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fieldConfig.ecg && (
                <InfoBox
                  title="ECG Summary"
                  value={patient.ccuData?.ecgSummary}
                  icon={<HeartPulse size={18} />}
                />
              )}

              {fieldConfig.ecg &&
                renderField(
                  'ST Elevation Leads',
                  patient.ccuData?.stElevationLeads
                )}

              {fieldConfig.ecg &&
                renderField(
                  'Arrhythmia',
                  patient.ccuData?.arrhythmia
                )}

              {fieldConfig.echo &&
                renderField(
                  'Echo EF',
                  patient.ccuData?.echoEF
                    ? `${patient.ccuData.echoEF}%`
                    : '—'
                )}

              {fieldConfig.echo && (
                <InfoBox
                  title="Echo Findings"
                  value={patient.ccuData?.echoFindings}
                />
              )}

              {fieldConfig.cathStent &&
                renderField(
                  'Cath Date',
                  patient.ccuData?.cathDate
                )}

              {fieldConfig.cathStent && (
                <InfoBox
                  title="Cath Findings"
                  value={patient.ccuData?.cathFindings}
                />
              )}

              {fieldConfig.cathStent &&
                renderField(
                  'Culprit Lesion',
                  patient.ccuData?.culpritLesion
                )}

              {fieldConfig.cathStent &&
                renderField(
                  'Stent Type',
                  patient.ccuData?.stentType
                )}

              {fieldConfig.cathStent && (
                <InfoBox
                  title="Stent Details"
                  value={patient.ccuData?.stentDetails}
                />
              )}

              {renderField(
                'Antiplatelets',
                patient.ccuData?.antiplatelets
              )}

              {renderField(
                'Anticoagulation',
                patient.ccuData?.anticoagulation
              )}

              {renderField(
                'TIMI Flow Post',
                patient.ccuData?.timiFlowPost
              )}
            </div>
          </div>
        );

      case 'icu':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="ICU / Critical Care"
              subtitle="Ventilator settings and critical care scores"
            />

            {fieldConfig.icuVentilator && (
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-4 flex items-center gap-2">
                  <Wind size={19} className="text-blue-600" />
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Ventilator
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {renderField(
                    'Mode',
                    patient.icuVentilator?.mode
                  )}
                  {renderField(
                    'FiO₂',
                    patient.icuVentilator?.fio2
                      ? `${patient.icuVentilator.fio2}%`
                      : '—'
                  )}
                  {renderField(
                    'PEEP',
                    patient.icuVentilator?.peep
                  )}
                  {renderField(
                    'Tidal Volume',
                    patient.icuVentilator?.tv
                  )}
                  {renderField(
                    'Rate',
                    patient.icuVentilator?.rate
                  )}
                  {renderField(
                    'Total Rate',
                    patient.icuVentilator?.totalRate
                  )}
                  {renderField(
                    'Ppeak',
                    patient.icuVentilator?.pPeak
                  )}
                  {renderField(
                    'Pplat',
                    patient.icuVentilator?.pPlat
                  )}
                  {renderField(
                    'ETT Size',
                    patient.icuVentilator?.etTubeSize
                  )}
                  {renderField(
                    'ETT Depth',
                    patient.icuVentilator?.etTubeDepth
                  )}
                </div>
              </div>
            )}

            {fieldConfig.icuScores && (
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="mb-4 font-bold text-slate-900 dark:text-white">
                  ICU Scores
                </h4>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {renderField(
                    'GCS',
                    patient.icuScores?.gcsTotal
                  )}
                  {renderField(
                    'GCS Eye',
                    patient.icuScores?.gcsEye
                  )}
                  {renderField(
                    'GCS Verbal',
                    patient.icuScores?.gcsVerbal
                  )}
                  {renderField(
                    'GCS Motor',
                    patient.icuScores?.gcsMotor
                  )}
                  {renderField(
                    'RASS',
                    patient.icuScores?.rass
                  )}
                  {renderField(
                    'SOFA',
                    patient.icuScores?.sofaScore
                  )}
                  {renderField(
                    'Pupils',
                    patient.icuScores?.pupils
                  )}
                  {renderField(
                    'CAM-ICU',
                    patient.icuScores?.deliriumCamICU
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'medications':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Medications"
              subtitle="Current medication list"
            />

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Medication"
                  value={newMedication.name}
                  onChange={value =>
                    setNewMedication({
                      ...newMedication,
                      name: value,
                    })
                  }
                />

                <Input
                  label="Dose"
                  value={newMedication.dose}
                  onChange={value =>
                    setNewMedication({
                      ...newMedication,
                      dose: value,
                    })
                  }
                />

                <Input
                  label="Route"
                  value={newMedication.route}
                  onChange={value =>
                    setNewMedication({
                      ...newMedication,
                      route: value,
                    })
                  }
                />

                <Input
                  label="Frequency"
                  value={newMedication.frequency}
                  onChange={value =>
                    setNewMedication({
                      ...newMedication,
                      frequency: value,
                    })
                  }
                />
              </div>

              <button
                onClick={addMedication}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
              >
                Add Medication
              </button>
            </div>

            {(patient.medications || []).length === 0 ? (
              <EmptyState text="No medications recorded." />
            ) : (
              <div className="space-y-3">
                {(patient.medications || []).map(medication => (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/40">
                        <Pill size={19} />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {medication.name}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {medication.dose || '—'} ·{' '}
                          {medication.route || '—'} ·{' '}
                          {medication.frequency || '—'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        removeMedication(medication.id)
                      }
                      className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'procedures':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Procedures & Interventions"
              subtitle="Clinical procedures performed during admission"
            />

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Procedure"
                  value={newProcedure.name}
                  onChange={value =>
                    setNewProcedure({
                      ...newProcedure,
                      name: value,
                    })
                  }
                />

                <Input
                  label="Date / Time"
                  type="datetime-local"
                  value={newProcedure.date}
                  onChange={value =>
                    setNewProcedure({
                      ...newProcedure,
                      date: value,
                    })
                  }
                />

                <Input
                  label="Site"
                  value={newProcedure.site}
                  onChange={value =>
                    setNewProcedure({
                      ...newProcedure,
                      site: value,
                    })
                  }
                />

                <Input
                  label="Operator"
                  value={newProcedure.performer}
                  onChange={value =>
                    setNewProcedure({
                      ...newProcedure,
                      performer: value,
                    })
                  }
                />
              </div>

              <TextArea
                label="Notes"
                value={newProcedure.notes}
                onChange={value =>
                  setNewProcedure({
                    ...newProcedure,
                    notes: value,
                  })
                }
              />

              <button
                onClick={addProcedure}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
              >
                Add Procedure
              </button>
            </div>

            {(patient.procedures || []).length === 0 ? (
              <EmptyState text="No procedures recorded." />
            ) : (
              <div className="space-y-3">
                {[...(patient.procedures || [])]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() -
                      new Date(a.date).getTime()
                  )
                  .map(procedure => (
                    <div
                      key={procedure.id}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {procedure.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {formatDate(procedure.date)}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeProcedure(procedure.id)
                          }
                          className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {renderField('Site', procedure.site)}
                        {renderField(
                          'Operator',
                          procedure.performer
                        )}
                      </div>

                      {procedure.notes && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                          {procedure.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Clinical Timeline"
              subtitle="Daily notes, events and clinical decisions"
            />

            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <h4 className="mb-4 font-bold text-slate-900 dark:text-white">
                Add Clinical Note
              </h4>

              <div className="space-y-3">
                <Input
                  label="Title"
                  value={newNote.title}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      title: value,
                    })
                  }
                />

                <Select
                  label="Type"
                  value={newNote.tag || 'Round'}
                  options={[
                    'Round',
                    'Event',
                    'Procedure',
                    'Consult',
                    'Handover',
                  ]}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      tag: value as ProgressNote['tag'],
                    })
                  }
                />

                <TextArea
                  label="Subjective"
                  value={newNote.subjective}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      subjective: value,
                    })
                  }
                />

                <TextArea
                  label="Objective"
                  value={newNote.objective}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      objective: value,
                    })
                  }
                />

                <TextArea
                  label="Assessment"
                  value={newNote.assessment}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      assessment: value,
                    })
                  }
                />

                <TextArea
                  label="Plan"
                  value={newNote.plan}
                  onChange={value =>
                    setNewNote({
                      ...newNote,
                      plan: value,
                    })
                  }
                />

                <button
                  onClick={addProgressNote}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
                >
                  Save Clinical Note
                </button>
              </div>
            </div>

            {(patient.progressNotes || []).length === 0 ? (
              <EmptyState text="No clinical notes yet." />
            ) : (
              <div className="relative space-y-4">
                <div className="absolute bottom-0 left-[14px] top-0 w-px bg-slate-200 dark:bg-slate-700" />

                {[...(patient.progressNotes || [])]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map(note => (
                    <div
                      key={note.id}
                      className="relative pl-9"
                    >
                      <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-blue-600 dark:border-slate-950">
                        <Clock
                          size={12}
                          className="text-white"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              {note.title || 'Clinical Note'}
                            </h4>

                            <div className="mt-1 text-xs text-slate-500">
                              {formatDate(note.timestamp)} ·{' '}
                              {note.author}
                            </div>
                          </div>

                          {note.tag && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                              {note.tag}
                            </span>
                          )}
                        </div>

                        {note.subjective && (
                          <InfoBox
                            title="Subjective"
                            value={note.subjective}
                            className="mt-3"
                          />
                        )}

                        {note.objective && (
                          <InfoBox
                            title="Objective"
                            value={note.objective}
                            className="mt-3"
                          />
                        )}

                        <InfoBox
                          title="Assessment"
                          value={note.assessment}
                          className="mt-3"
                        />

                        <InfoBox
                          title="Plan"
                          value={note.plan}
                          className="mt-3"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-0 md:p-5">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 shadow-2xl dark:bg-slate-950 md:h-[94vh] md:max-w-7xl md:rounded-3xl">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Back"
              >
                <ArrowLeft size={21} />
              </button>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <User size={22} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                    {patient.name}
                  </h2>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(patient.status)}`}
                  >
                    {statusLabel(patient.status)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BedDouble size={13} />
                    Bed {patient.bedNumber}
                  </span>

                  <span>MRN: {patient.mrn || '—'}</span>

                  <span>
                    Admitted: {formatDate(patient.admissionDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onPrintPatient(patient)}
                className="hidden rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:block"
                title="Print patient"
              >
                <Printer size={19} />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Delete patient"
              >
                <Trash2 size={19} />
              </button>

              <button
                onClick={onClose}
                className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X size={21} />
              </button>
            </div>
          </div>

          {/* Mobile section selector */}
          <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 md:hidden">
            <select
              value={activeSection}
              onChange={event =>
                setActiveSection(event.target.value as SectionKey)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {visibleSections.map(section => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:block">
            <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Patient File
            </div>

            <nav className="space-y-1">
              {visibleSections.map(section => (
                <button
                  key={section.key}
                  onClick={() =>
                    setActiveSection(section.key)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    activeSection === section.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              {!patient.isDischarged ? (
                <button
                  onClick={() =>
                    setShowDischargeConfirm(true)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/20 dark:text-orange-300"
                >
                  <Scissors size={16} />
                  Discharge
                </button>
              ) : (
                <button
                  onClick={() => onReadmitPatient(patient)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                >
                  <CheckCircle2 size={16} />
                  Readmit
                </button>
              )}
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
              {renderSection()}
            </div>
          </main>
        </div>

        {/* Mobile bottom actions */}
        <div className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {!patient.isDischarged ? (
            <button
              onClick={() =>
                setShowDischargeConfirm(true)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-sm font-bold text-white"
            >
              <Scissors size={16} />
              Discharge
            </button>
          ) : (
            <button
              onClick={() => onReadmitPatient(patient)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white"
            >
              <CheckCircle2 size={16} />
              Readmit
            </button>
          )}

          <button
            onClick={() => onPrintPatient(patient)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Printer size={18} />
          </button>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <ConfirmDialog
            title="Delete Patient?"
            message="This will permanently remove the patient record from the current app data."
            confirmText="Delete"
            confirmClass="bg-red-600 hover:bg-red-700"
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              setShowDeleteConfirm(false);
              onDeletePatient(patient);
            }}
          />
        )}

        {/* Discharge confirmation */}
        {showDischargeConfirm && (
          <ConfirmDialog
            title="Discharge Patient?"
            message="The patient will be moved to the discharge/archive workflow."
            confirmText="Continue"
            confirmClass="bg-orange-500 hover:bg-orange-600"
            onCancel={() => setShowDischargeConfirm(false)}
            onConfirm={() => {
              setShowDischargeConfirm(false);
              onDischargePatient(patient);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function InfoBox({
  title,
  value,
  icon,
  className = '',
}: {
  title: string;
  value?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </div>

      <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
        {value || 'No information recorded.'}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800">
        <FileText size={22} />
      </div>

      <p className="text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmText,
  confirmClass,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText: string;
  confirmClass: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={23} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
