import React, { useMemo, useState } from 'react';
import {
  PatientRecord,
  FieldVisibilityConfig,
  SpecialtyMode,
  BedStatus,
  ProgressNote,
  VitalSignEntry,
  IOEntry,
  LabResults,
  ABGEntry,
  Medication,
  Infusion,
  Procedure
} from '../types';

import {
  X,
  HeartPulse,
  Activity,
  Printer,
  Trash2,
  Plus,
  Save,
  Check,
  Clock,
  Droplets,
  Wind,
  Pill,
  LogOut,
  Bed,
  FolderArchive,
  ShieldCheck,
  Stethoscope,
  FileText,
  ChevronRight,
  AlertTriangle,
  UserRound,
  CalendarDays,
  ClipboardList,
  Syringe,
  Gauge,
  ScanLine,
  Brain,
  RefreshCw
} from 'lucide-react';

import { TimelineNotes } from './TimelineNotes';

interface PatientFileModalProps {
  patient: PatientRecord;
  fieldConfig: FieldVisibilityConfig;
  specialtyMode: SpecialtyMode;
  onUpdatePatient: (updated: PatientRecord) => void;
  onDeletePatient: (patientId: string) => void;
  onPrintPatient: (patient: PatientRecord) => void;
  onDischargePatient?: (patient: PatientRecord) => void;
  onReadmitPatient?: (patient: PatientRecord) => void;
  onClose: () => void;
}

type PatientTab =
  | 'overview'
  | 'vitals_io'
  | 'labs_abg'
  | 'ccu'
  | 'icu'
  | 'meds'
  | 'notes'
  | 'procedures';

const inputClass =
  'w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition';

const textareaClass =
  'w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-white outline-none focus:border-cyan-500 transition resize-y';

const cardClass =
  'rounded-xl bg-slate-950 border border-slate-800 p-4';

const smallLabelClass =
  'block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1';

const nowStamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16).replace('T', ' ');
};

const displayTime = () => {
  const now = new Date();
  const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `${date} ${time}`;
};

const numberOr = (value: any, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const calculateMAP = (sys: any, dia: any) => {
  const s = numberOr(sys, 0);
  const d = numberOr(dia, 0);

  if (!s && !d) return '';

  return Math.round((s + 2 * d) / 3);
};

const calculateNetIO = (io: IOEntry) => {
  const intake =
    Number(io.intakeIV || 0) +
    Number(io.intakeEnteral || 0) +
    Number(io.intakeOther || 0);

  const output =
    Number(io.outputUrine || 0) +
    Number(io.outputDrain || 0) +
    Number(io.outputGI || 0);

  return intake - output;
};

const SectionTitle: React.FC<{
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
    <div className="flex items-start gap-2">
      {icon && (
        <div className="mt-0.5 text-cyan-400">
          {icon}
        </div>
      )}

      <div>
        <h3 className="font-bold text-white text-sm">{title}</h3>

        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>

    {action}
  </div>
);

const EmptyState: React.FC<{
  text: string;
  icon?: React.ReactNode;
}> = ({ text, icon }) => (
  <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500">
    {icon || <FileText className="w-7 h-7 mb-2 opacity-50" />}
    <span className="text-xs">{text}</span>
  </div>
);

export const PatientFileModal: React.FC<PatientFileModalProps> = ({
  patient,
  fieldConfig,
  specialtyMode,
  onUpdatePatient,
  onDeletePatient,
  onPrintPatient,
  onDischargePatient,
  onReadmitPatient,
  onClose
}) => {
  const [data, setData] = useState<PatientRecord>({
    ...patient,
    vitals: patient.vitals || [],
    ioRecords: patient.ioRecords || [],
    labs: patient.labs || [],
    abgRecords: patient.abgRecords || [],
    medications: patient.medications || [],
    infusions: patient.infusions || [],
    procedures: patient.procedures || [],
    progressNotes: patient.progressNotes || []
  });

  const [activeTab, setActiveTab] = useState<PatientTab>(
    specialtyMode === 'ccu'
      ? 'ccu'
      : specialtyMode === 'icu'
      ? 'icu'
      : 'overview'
  );

  const [saveToast, setSaveToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showAddVital, setShowAddVital] = useState(false);
  const [showAddIO, setShowAddIO] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [showAddABG, setShowAddABG] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddInfusion, setShowAddInfusion] = useState(false);
  const [showAddProcedure, setShowAddProcedure] = useState(false);

  const [newVital, setNewVital] = useState<Partial<VitalSignEntry>>({
    hr: 75,
    bpSystolic: 120,
    bpDiastolic: 75,
    rr: 16,
    spo2: 98,
    temp: 36.8,
    rhythm: 'Sinus'
  });

  const [newIO, setNewIO] = useState<Partial<IOEntry>>({
    intakeIV: 0,
    intakeEnteral: 0,
    intakeOther: 0,
    outputUrine: 0,
    outputDrain: 0,
    outputGI: 0,
    notes: ''
  });

  const [newLab, setNewLab] = useState<Partial<LabResults>>({
    hb: '',
    wbc: '',
    platelets: '',
    na: '',
    k: '',
    cl: '',
    urea: '',
    creatinine: '',
    glucose: '',
    troponin: '',
    ckmb: '',
    bnp: '',
    pt: '',
    inr: '',
    aptt: '',
    crp: '',
    pct: '',
    lactate: ''
  });

  const [newABG, setNewABG] = useState<Partial<ABGEntry>>({
    ph: '',
    pco2: '',
    po2: '',
    hco3: '',
    be: '',
    lactate: '',
    fio2: '',
    interpretation: ''
  });

  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    route: 'Oral',
    frequency: 'Daily',
    category: 'other' as Medication['category']
  });

  const [newInfusion, setNewInfusion] = useState({
    drug: '',
    doseRate: '',
    concentration: '',
    lineLocation: 'Peripheral IV'
  });

  const [newProcedure, setNewProcedure] = useState({
    name: '',
    date: '',
    site: '',
    performer: '',
    notes: ''
  });

  const lastVital = useMemo(
    () => data.vitals[data.vitals.length - 1],
    [data.vitals]
  );

  const lastLab = useMemo(
    () => data.labs[data.labs.length - 1],
    [data.labs]
  );

  const lastABG = useMemo(
    () => data.abgRecords[data.abgRecords.length - 1],
    [data.abgRecords]
  );

  const totalNetBalance = useMemo(
    () => data.ioRecords.reduce((sum, io) => sum + calculateNetIO(io), 0),
    [data.ioRecords]
  );

  const updatePatient = (next: PatientRecord) => {
    const updated = {
      ...next,
      lastUpdated: nowStamp()
    };

    setData(updated);
    onUpdatePatient(updated);
  };

  const handleFieldChange = (
    field: keyof PatientRecord,
    value: any
  ) => {
    updatePatient({
      ...data,
      [field]: value
    });
  };

  const handleCcuChange = (
    field: keyof PatientRecord['ccuData'],
    value: any
  ) => {
    updatePatient({
      ...data,
      ccuData: {
        ...data.ccuData,
        [field]: value
      }
    });
  };

  const handleVentChange = (
    field: keyof PatientRecord['icuVentilator'],
    value: any
  ) => {
    updatePatient({
      ...data,
      icuVentilator: {
        ...data.icuVentilator,
        [field]: value
      }
    });
  };

  const handleScoreChange = (
    field: keyof PatientRecord['icuScores'],
    value: any
  ) => {
    updatePatient({
      ...data,
      icuScores: {
        ...data.icuScores,
        [field]: value
      }
    });
  };

  const handleAddNote = (note: ProgressNote) => {
    updatePatient({
      ...data,
      progressNotes: [...data.progressNotes, note]
    });
  };

  const handleUpdateNote = (note: ProgressNote) => {
    updatePatient({
      ...data,
      progressNotes: data.progressNotes.map(item =>
        item.id === note.id ? note : item
      )
    });
  };

  const handleDeleteNote = (noteId: string) => {
    updatePatient({
      ...data,
      progressNotes: data.progressNotes.filter(
        note => note.id !== noteId
      )
    });
  };

  const handleSaveVital = () => {
    const sys = numberOr(newVital.bpSystolic, 120);
    const dia = numberOr(newVital.bpDiastolic, 80);

    const entry: VitalSignEntry = {
      timestamp: displayTime(),
      hr: numberOr(newVital.hr, 70),
      bpSystolic: sys,
      bpDiastolic: dia,
      map: calculateMAP(sys, dia),
      rr: numberOr(newVital.rr, 16),
      spo2: numberOr(newVital.spo2, 98),
      temp: numberOr(newVital.temp, 37),
      cvp: newVital.cvp,
      rhythm: newVital.rhythm || 'Sinus'
    };

    updatePatient({
      ...data,
      vitals: [...data.vitals, entry]
    });

    setShowAddVital(false);

    setNewVital({
      hr: 75,
      bpSystolic: 120,
      bpDiastolic: 75,
      rr: 16,
      spo2: 98,
      temp: 36.8,
      rhythm: 'Sinus'
    });
  };

  const handleSaveIO = () => {
    const entry: IOEntry = {
      timestamp: displayTime(),
      intakeIV: numberOr(newIO.intakeIV, 0),
      intakeEnteral: numberOr(newIO.intakeEnteral, 0),
      intakeOther: numberOr(newIO.intakeOther, 0),
      outputUrine: numberOr(newIO.outputUrine, 0),
      outputDrain: numberOr(newIO.outputDrain, 0),
      outputGI: numberOr(newIO.outputGI, 0),
      notes: newIO.notes || ''
    };

    updatePatient({
      ...data,
      ioRecords: [...data.ioRecords, entry]
    });

    setShowAddIO(false);

    setNewIO({
      intakeIV: 0,
      intakeEnteral: 0,
      intakeOther: 0,
      outputUrine: 0,
      outputDrain: 0,
      outputGI: 0,
      notes: ''
    });
  };

  const handleSaveLab = () => {
    const entry: LabResults = {
      timestamp: displayTime(),
      ...newLab
    };

    updatePatient({
      ...data,
      labs: [...data.labs, entry]
    });

    setShowAddLab(false);

    setNewLab({
      hb: '',
      wbc: '',
      platelets: '',
      na: '',
      k: '',
      cl: '',
      urea: '',
      creatinine: '',
      glucose: '',
      troponin: '',
      ckmb: '',
      bnp: '',
      pt: '',
      inr: '',
      aptt: '',
      crp: '',
      pct: '',
      lactate: ''
    });
  };

  const handleSaveABG = () => {
    if (!newABG.ph && !newABG.pco2 && !newABG.po2) return;

    const fio2Number = numberOr(newABG.fio2, 0);
    const po2Number = numberOr(newABG.po2, 0);

    let ratio = '';

    if (fio2Number > 0 && po2Number > 0) {
      const fio2Decimal =
        fio2Number > 1 ? fio2Number / 100 : fio2Number;

      if (fio2Decimal > 0) {
        ratio = String(
          Math.round(po2Number / fio2Decimal)
        );
      }
    }

    const entry: ABGEntry = {
      timestamp: displayTime(),
      ph: newABG.ph || '',
      pco2: newABG.pco2 || '',
      po2: newABG.po2 || '',
      hco3: newABG.hco3 || '',
      be: newABG.be || '',
      lactate: newABG.lactate || '',
      fio2: newABG.fio2 || '',
      pao2fio2Ratio: ratio,
      interpretation: newABG.interpretation || ''
    };

    updatePatient({
      ...data,
      abgRecords: [...data.abgRecords, entry]
    });

    setShowAddABG(false);

    setNewABG({
      ph: '',
      pco2: '',
      po2: '',
      hco3: '',
      be: '',
      lactate: '',
      fio2: '',
      interpretation: ''
    });
  };

  const handleSaveMedication = () => {
    if (!newMed.name.trim()) return;

    const medication: Medication = {
      id: `med-${Date.now()}`,
      name: newMed.name,
      dose: newMed.dose,
      route: newMed.route,
      frequency: newMed.frequency,
      category: newMed.category
    };

    updatePatient({
      ...data,
      medications: [...data.medications, medication]
    });

    setShowAddMed(false);

    setNewMed({
      name: '',
      dose: '',
      route: 'Oral',
      frequency: 'Daily',
      category: 'other'
    });
  };

  const handleSaveInfusion = () => {
    if (!newInfusion.drug.trim()) return;

    const infusion: Infusion = {
      id: `inf-${Date.now()}`,
      drug: newInfusion.drug,
      doseRate: newInfusion.doseRate,
      concentration: newInfusion.concentration,
      lineLocation: newInfusion.lineLocation
    };

    updatePatient({
      ...data,
      infusions: [...data.infusions, infusion]
    });

    setShowAddInfusion(false);

    setNewInfusion({
      drug: '',
      doseRate: '',
      concentration: '',
      lineLocation: 'Peripheral IV'
    });
  };

  const handleSaveProcedure = () => {
    if (!newProcedure.name.trim()) return;

    const procedure: Procedure = {
      id: `procedure-${Date.now()}`,
      name: newProcedure.name,
      date: newProcedure.date || nowStamp(),
      site: newProcedure.site,
      performer: newProcedure.performer,
      notes: newProcedure.notes
    };

    updatePatient({
      ...data,
      procedures: [...data.procedures, procedure]
    });

    setShowAddProcedure(false);

    setNewProcedure({
      name: '',
      date: '',
      site: '',
      performer: '',
      notes: ''
    });
  };

  const triggerSaveToast = () => {
    onUpdatePatient({
      ...data,
      lastUpdated: nowStamp()
    });

    setSaveToast(true);

    window.setTimeout(() => {
      setSaveToast(false);
    }, 1800);
  };

  const removeMedication = (id: string) => {
    updatePatient({
      ...data,
      medications: data.medications.filter(
        medication => medication.id !== id
      )
    });
  };

  const removeInfusion = (id: string) => {
    updatePatient({
      ...data,
      infusions: data.infusions.filter(
        infusion => infusion.id !== id
      )
    });
  };

  const removeProcedure = (id: string) => {
    updatePatient({
      ...data,
      procedures: data.procedures.filter(
        procedure => procedure.id !== id
      )
    });
  };

  const statusClass = () => {
    switch (data.status) {
      case 'stable':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';

      case 'critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';

      case 'deteriorating':
        return 'bg-orange-950 text-orange-300 border-orange-800';

      case 'post-op':
        return 'bg-blue-950 text-blue-300 border-blue-800';

      case 'guarded':
        return 'bg-amber-950 text-amber-300 border-amber-800';

      case 'discharged':
        return 'bg-slate-800 text-slate-300 border-slate-700';

      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const tabs: Array<{
    id: PatientTab;
    label: string;
    icon: React.ReactNode;
    visible?: boolean;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <UserRound className="w-3.5 h-3.5" />
    },
    {
      id: 'vitals_io',
      label: 'Vitals & I/O',
      icon: <Activity className="w-3.5 h-3.5" />,
      visible: fieldConfig.vitals || fieldConfig.ioBalance
    },
    {
      id: 'labs_abg',
      label: 'Labs & ABG',
      icon: <Droplets className="w-3.5 h-3.5" />,
      visible: fieldConfig.labs || fieldConfig.abg
    },
    {
      id: 'ccu',
      label: 'CCU Cardiology',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
      visible:
        fieldConfig.ccuCardiology ||
        fieldConfig.ecg ||
        fieldConfig.echo ||
        fieldConfig.cathStent
    },
    {
      id: 'icu',
      label: 'ICU Critical Care',
      icon: <Wind className="w-3.5 h-3.5" />,
      visible:
        fieldConfig.icuVentilator ||
        fieldConfig.icuScores ||
        fieldConfig.vasopressorsInfusions
    },
    {
      id: 'meds',
      label: 'Medications',
      icon: <Pill className="w-3.5 h-3.5" />,
      visible: fieldConfig.medications || fieldConfig.vasopressorsInfusions
    },
    {
      id: 'notes',
      label: `Timeline (${data.progressNotes.length})`,
      icon: <Clock className="w-3.5 h-3.5" />,
      visible: fieldConfig.progressNotesTimeline
    },
    {
      id: 'procedures',
      label: 'Procedures & Plan',
      icon: <Stethoscope className="w-3.5 h-3.5" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[97vh]">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <div className="px-3 sm:px-5 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

            <div className="flex items-center gap-3 min-w-0">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                  data.isDischarged
                    ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                    : data.status === 'critical'
                    ? 'bg-rose-950 border-rose-800 text-rose-300'
                    : 'bg-cyan-950 border-cyan-800 text-cyan-300'
                }`}
              >
                {data.isDischarged ? (
                  <FolderArchive className="w-5 h-5" />
                ) : (
                  data.bedNumber
                )}
              </div>

              <div className="min-w-0">

                <div className="flex items-center flex-wrap gap-1.5">

                  <h2 className="text-base sm:text-xl font-black text-white truncate max-w-[260px] sm:max-w-none">
                    {data.name}
                  </h2>

                  <span className="text-slate-600">•</span>

                  <span className="text-cyan-300 font-semibold text-xs">
                    {data.isDischarged
                      ? `Ex-Bed ${data.previousBedNumber || data.bedNumber}`
                      : `Bed ${data.bedNumber}`}
                  </span>

                  <select
                    value={data.status}
                    onChange={e =>
                      handleFieldChange(
                        'status',
                        e.target.value as BedStatus
                      )
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass()}`}
                  >
                    <option value="stable">Stable</option>
                    <option value="critical">Critical</option>
                    <option value="deteriorating">
                      Deteriorating
                    </option>
                    <option value="guarded">Guarded</option>
                    <option value="post-op">Post-Op</option>
                    <option value="discharged">
                      Discharged / Archived
                    </option>
                  </select>

                  <select
                    value={data.codeStatus}
                    onChange={e =>
                      handleFieldChange(
                        'codeStatus',
                        e.target.value
                      )
                    }
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    <option value="Full Code">Full Code</option>
                    <option value="DNR">DNR</option>
                    <option value="DNI">DNI</option>
                    <option value="Modified">Modified</option>
                  </select>

                </div>

                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400 mt-1">
                  <span>
                    MRN: <strong className="text-slate-200">{data.mrn}</strong>
                  </span>

                  <span>•</span>

                  <span>
                    Age: <strong className="text-slate-200">{data.age}</strong>
                  </span>

                  <span>•</span>

                  <span>
                    {data.gender}
                  </span>

                  <span>•</span>

                  <span className="truncate max-w-[300px]">
                    {data.primaryDiagnosis || 'No primary diagnosis'}
                  </span>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end lg:self-center">

              {saveToast && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-400 mr-1">
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}

              {!data.isDischarged && onDischargePatient && (
                <button
                  onClick={() => onDischargePatient(data)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    Discharge
                  </span>
                </button>
              )}

              {data.isDischarged && onReadmitPatient && (
                <button
                  onClick={() => onReadmitPatient(data)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                >
                  <Bed className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    Re-admit
                  </span>
                </button>
              )}

              <button
                onClick={triggerSaveToast}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={() => onPrintPatient(data)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
          </div>
        </div>

        {/* =========================================================
            ARCHIVE BANNER
        ========================================================== */}

        {data.isDischarged && (
          <div className="px-3 sm:px-5 py-2.5 bg-amber-950/30 border-b border-amber-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />

                <div>
                  <p className="text-[11px] font-bold text-amber-300">
                    ARCHIVED MEDICAL RECORD
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {data.dischargeDetails?.disposition || 'Discharged'}
                    {' • '}
                    {data.dischargeDetails?.dischargeDate || 'Recorded'}
                    {' • '}
                    Condition:{' '}
                    {data.dischargeDetails?.conditionAtDischarge ||
                      'Not specified'}
                  </p>
                </div>
              </div>

              {onReadmitPatient && (
                <button
                  onClick={() => onReadmitPatient(data)}
                  className="self-start px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-admit
                </button>
              )}

            </div>
          </div>
        )}

        {/* =========================================================
            DELETE CONFIRMATION
        ========================================================== */}

        {showDeleteConfirm && (
          <div className="p-3 bg-rose-950 border-b border-rose-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div className="flex items-start gap-2 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />

                <span>
                  Permanently delete the complete medical record for{' '}
                  <strong>{data.name}</strong>?
                  <br />
                  <span className="text-rose-400">
                    Use Discharge instead if you want to preserve the record.
                  </span>
                </span>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    onDeletePatient(data.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Yes, Delete
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB NAVIGATION
        ========================================================== */}

        <div className="border-b border-slate-800 bg-slate-950/80 shrink-0 overflow-x-auto">
          <div className="flex min-w-max px-2 sm:px-4">

            {tabs
              .filter(tab => tab.visible !== false)
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2.5 border-b-2 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

          </div>
        </div>

        {/* =========================================================
            CONTENT
        ========================================================== */}

        <div className="p-3 sm:p-5 overflow-y-auto space-y-5 text-xs flex-1">

          {/* =======================================================
              OVERVIEW
          ======================================================== */}

          {activeTab === 'overview' && (
            <div className="space-y-5">

              {/* Quick clinical summary */}

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    Bed
                  </span>
                  <span className="text-lg font-black text-cyan-300">
                    {data.bedNumber}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    Status
                  </span>
                  <span className="font-bold text-white">
                    {data.status}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    Latest HR
                  </span>
                  <span className="text-lg font-black text-rose-300">
                    {lastVital?.hr ?? '—'}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    Latest BP
                  </span>
                  <span className="text-lg font-black text-white">
                    {lastVital
                      ? `${lastVital.bpSystolic}/${lastVital.bpDiastolic}`
                      : '—'}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    SpO₂
                  </span>
                  <span className="text-lg font-black text-cyan-300">
                    {lastVital?.spo2
                      ? `${lastVital.spo2}%`
                      : '—'}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-500 block">
                    EF
                  </span>
                  <span className="text-lg font-black text-rose-300">
                    {data.ccuData?.echoEF || '—'}
                  </span>
                </div>

              </div>

              {/* Patient information */}

              {fieldConfig.patientInfo && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<UserRound className="w-4 h-4" />}
                    title="Patient Information"
                    subtitle="Demographics and admission details"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

                    <div>
                      <label className={smallLabelClass}>
                        Patient Name
                      </label>

                      <input
                        value={data.name}
                        onChange={e =>
                          handleFieldChange(
                            'name',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Patient ID / MRN
                      </label>

                      <input
                        value={data.mrn}
                        onChange={e =>
                          handleFieldChange(
                            'mrn',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Age
                      </label>

                      <input
                        value={data.age}
                        onChange={e =>
                          handleFieldChange(
                            'age',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Gender
                      </label>

                      <select
                        value={data.gender}
                        onChange={e =>
                          handleFieldChange(
                            'gender',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Bed Number
                      </label>

                      <input
                        type="number"
                        disabled={data.isDischarged}
                        value={data.bedNumber}
                        onChange={e =>
                          handleFieldChange(
                            'bedNumber',
                            Number(e.target.value)
                          )
                        }
                        className={`${inputClass} ${
                          data.isDischarged
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Admission Date & Time
                      </label>

                      <input
                        value={data.admissionDate}
                        onChange={e =>
                          handleFieldChange(
                            'admissionDate',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Attending Physician
                      </label>

                      <input
                        value={data.attendingPhysician}
                        onChange={e =>
                          handleFieldChange(
                            'attendingPhysician',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Code Status
                      </label>

                      <select
                        value={data.codeStatus}
                        onChange={e =>
                          handleFieldChange(
                            'codeStatus',
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="Full Code">Full Code</option>
                        <option value="DNR">DNR</option>
                        <option value="DNI">DNI</option>
                        <option value="Modified">Modified</option>
                      </select>
                    </div>

                  </div>

                </div>
              )}

              {/* Diagnosis */}

              <div className={cardClass}>

                <SectionTitle
                  icon={<ClipboardList className="w-4 h-4" />}
                  title="Clinical Problem List"
                  subtitle="Primary diagnosis and comorbidities"
                />

                <div className="space-y-3 mt-4">

                  <div>
                    <label className={smallLabelClass}>
                      Primary Diagnosis
                    </label>

                    <input
                      value={data.primaryDiagnosis}
                      onChange={e =>
                        handleFieldChange(
                          'primaryDiagnosis',
                          e.target.value
                        )
                      }
                      className={`${inputClass} font-bold`}
                    />
                  </div>

                  <div>
                    <label className={smallLabelClass}>
                      Secondary Diagnoses / Comorbidities
                    </label>

                    <input
                      value={data.secondaryDiagnoses.join(', ')}
                      onChange={e =>
                        handleFieldChange(
                          'secondaryDiagnoses',
                          e.target.value
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="HTN, DM, CKD, CAD..."
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* History */}

              {fieldConfig.history && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<FileText className="w-4 h-4" />}
                    title="History"
                  />

                  <div className="space-y-3 mt-4">

                    {fieldConfig.chiefComplaint && (
                      <div>
                        <label className={smallLabelClass}>
                          Chief Complaint
                        </label>

                        <textarea
                          rows={2}
                          value={data.chiefComplaint}
                          onChange={e =>
                            handleFieldChange(
                              'chiefComplaint',
                              e.target.value
                            )
                          }
                          className={textareaClass}
                        />
                      </div>
                    )}

                    <div>
                      <label className={smallLabelClass}>
                        History of Present Illness
                      </label>

                      <textarea
                        rows={4}
                        value={data.historyOfPresentIllness}
                        onChange={e =>
                          handleFieldChange(
                            'historyOfPresentIllness',
                            e.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Past Medical / Surgical History
                      </label>

                      <textarea
                        rows={3}
                        value={data.pastMedicalHistory}
                        onChange={e =>
                          handleFieldChange(
                            'pastMedicalHistory',
                            e.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Allergies
                      </label>

                      <input
                        value={
                          data.customFields?.allergies || ''
                        }
                        onChange={e =>
                          handleFieldChange(
                            'customFields',
                            {
                              ...(data.customFields || {}),
                              allergies: e.target.value
                            }
                          )
                        }
                        placeholder="Drug / food allergies"
                        className={inputClass}
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* Examination */}

              {fieldConfig.examination && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Stethoscope className="w-4 h-4" />}
                    title="Physical Examination"
                  />

                  <textarea
                    rows={6}
                    value={data.examinationSummary}
                    onChange={e =>
                      handleFieldChange(
                        'examinationSummary',
                        e.target.value
                      )
                    }
                    placeholder="General appearance..."
                    className={`${textareaClass} mt-4`}
                  />

                </div>
              )}

              {/* Discharge summary */}

              {data.isDischarged && data.dischargeDetails && (
                <div className="rounded-xl bg-amber-950/30 border border-amber-800/60 p-4">

                  <SectionTitle
                    icon={<FolderArchive className="w-4 h-4 text-amber-400" />}
                    title="Discharge / Transfer Summary"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

                    <div>
                      <label className={smallLabelClass}>
                        Disposition
                      </label>

                      <div className="text-white font-semibold">
                        {data.dischargeDetails.disposition}
                      </div>
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Date & Time
                      </label>

                      <div className="font-mono text-amber-300">
                        {data.dischargeDetails.dischargeDate}
                      </div>
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        Condition
                      </label>

                      <div className="text-white font-semibold">
                        {data.dischargeDetails.conditionAtDischarge}
                      </div>
                    </div>

                  </div>

                  <div className="mt-3">
                    <label className={smallLabelClass}>
                      Summary
                    </label>

                    <p className="text-slate-300 whitespace-pre-wrap bg-slate-950/60 rounded-lg p-3 border border-slate-800">
                      {data.dischargeDetails.dischargeSummary ||
                        'No discharge summary recorded.'}
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              VITALS / I&O
          ======================================================== */}

          {activeTab === 'vitals_io' && (
            <div className="space-y-5">

              {fieldConfig.vitals && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Activity className="w-4 h-4" />}
                    title="Vital Signs"
                    subtitle="Serial bedside observations"
                    action={
                      <button
                        onClick={() => setShowAddVital(v => !v)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Log Vitals
                      </button>
                    }
                  />

                  {showAddVital && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-900/60">

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">

                        <div>
                          <label className={smallLabelClass}>HR</label>
                          <input
                            type="number"
                            value={newVital.hr}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                hr: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>SBP</label>
                          <input
                            type="number"
                            value={newVital.bpSystolic}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                bpSystolic: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>DBP</label>
                          <input
                            type="number"
                            value={newVital.bpDiastolic}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                bpDiastolic: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>RR</label>
                          <input
                            type="number"
                            value={newVital.rr}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                rr: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>SpO₂</label>
                          <input
                            type="number"
                            value={newVital.spo2}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                spo2: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Temp</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newVital.temp}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                temp: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Rhythm</label>
                          <input
                            value={newVital.rhythm || ''}
                            onChange={e =>
                              setNewVital({
                                ...newVital,
                                rhythm: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveVital}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setShowAddVital(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.vitals.length === 0 ? (
                    <EmptyState
                      text="No vital signs recorded yet."
                      icon={<Activity className="w-7 h-7 mb-2" />}
                    />
                  ) : (
                    <div className="overflow-x-auto mt-4">

                      <table className="w-full text-left text-[11px]">

                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2">Time</th>
                            <th>HR</th>
                            <th>BP</th>
                            <th>MAP</th>
                            <th>RR</th>
                            <th>SpO₂</th>
                            <th>Temp</th>
                            <th>Rhythm</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/60">

                          {[...data.vitals]
                            .reverse()
                            .map((v, index) => (
                              <tr
                                key={`${v.timestamp}-${index}`}
                                className="hover:bg-slate-900/60"
                              >
                                <td className="py-2 font-mono text-slate-400">
                                  {v.timestamp}
                                </td>

                                <td className="font-bold text-rose-300">
                                  {v.hr}
                                </td>

                                <td className="font-bold text-white">
                                  {v.bpSystolic}/{v.bpDiastolic}
                                </td>

                                <td className="text-cyan-300 font-bold">
                                  {v.map ||
                                    calculateMAP(
                                      v.bpSystolic,
                                      v.bpDiastolic
                                    )}
                                </td>

                                <td>{v.rr}</td>

                                <td className="font-bold text-cyan-300">
                                  {v.spo2}%
                                </td>

                                <td>{v.temp}°C</td>

                                <td className="text-slate-400">
                                  {v.rhythm || '—'}
                                </td>
                              </tr>
                            ))}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              )}

              {fieldConfig.ioBalance && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Droplets className="w-4 h-4" />}
                    title="Fluid Balance"
                    subtitle={`Cumulative recorded balance: ${totalNetBalance > 0 ? '+' : ''}${totalNetBalance} mL`}
                    action={
                      <button
                        onClick={() => setShowAddIO(v => !v)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add I/O
                      </button>
                    }
                  />

                  {showAddIO && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-blue-900/60">

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">

                        <div>
                          <label className={smallLabelClass}>IV Intake</label>
                          <input
                            type="number"
                            value={newIO.intakeIV}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                intakeIV: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Enteral</label>
                          <input
                            type="number"
                            value={newIO.intakeEnteral}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                intakeEnteral: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Other Intake</label>
                          <input
                            type="number"
                            value={newIO.intakeOther}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                intakeOther: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Urine</label>
                          <input
                            type="number"
                            value={newIO.outputUrine}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                outputUrine: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>Drain</label>
                          <input
                            type="number"
                            value={newIO.outputDrain}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                outputDrain: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>GI Output</label>
                          <input
                            type="number"
                            value={newIO.outputGI}
                            onChange={e =>
                              setNewIO({
                                ...newIO,
                                outputGI: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                      </div>

                      <div className="mt-2">
                        <label className={smallLabelClass}>
                          Notes
                        </label>

                        <input
                          value={newIO.notes || ''}
                          onChange={e =>
                            setNewIO({
                              ...newIO,
                              notes: e.target.value
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveIO}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                        >
                          Save I/O
                        </button>

                        <button
                          onClick={() => setShowAddIO(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.ioRecords.length === 0 ? (
                    <EmptyState text="No fluid balance entries recorded." />
                  ) : (
                    <div className="space-y-2 mt-4">

                      {[...data.ioRecords]
                        .reverse()
                        .map((io, index) => {

                          const intake =
                            Number(io.intakeIV || 0) +
                            Number(io.intakeEnteral || 0) +
                            Number(io.intakeOther || 0);

                          const output =
                            Number(io.outputUrine || 0) +
                            Number(io.outputDrain || 0) +
                            Number(io.outputGI || 0);

                          const net = intake - output;

                          return (
                            <div
                              key={`${io.timestamp}-${index}`}
                              className="p-3 rounded-lg bg-slate-900 border border-slate-800"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">

                                <div>
                                  <span className="font-mono text-slate-300">
                                    {io.timestamp}
                                  </span>

                                  {io.notes && (
                                    <p className="text-slate-500 mt-1">
                                      {io.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 font-mono">

                                  <span className="text-cyan-300">
                                    IN {intake} mL
                                  </span>

                                  <span className="text-rose-300">
                                    OUT {output} mL
                                  </span>

                                  <span
                                    className={`font-bold ${
                                      net >= 0
                                        ? 'text-amber-300'
                                        : 'text-emerald-300'
                                    }`}
                                  >
                                    NET {net > 0 ? '+' : ''}
                                    {net} mL
                                  </span>

                                </div>

                              </div>
                            </div>
                          );
                        })}

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              LABS / ABG
          ======================================================== */}

          {activeTab === 'labs_abg' && (
            <div className="space-y-5">

              {fieldConfig.labs && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Droplets className="w-4 h-4" />}
                    title="Laboratory Results"
                    subtitle={
                      lastLab
                        ? `Latest: ${lastLab.timestamp}`
                        : 'No laboratory data'
                    }
                    action={
                      <button
                        onClick={() => setShowAddLab(v => !v)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Labs
                      </button>
                    }
                  />

                  {showAddLab && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-900/60">

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">

                        {[
                          ['hb', 'Hb'],
                          ['wbc', 'WBC'],
                          ['platelets', 'Platelets'],
                          ['na', 'Na'],
                          ['k', 'K'],
                          ['cl', 'Cl'],
                          ['urea', 'Urea'],
                          ['creatinine', 'Creatinine'],
                          ['glucose', 'Glucose'],
                          ['troponin', 'Troponin'],
                          ['ckmb', 'CK-MB'],
                          ['bnp', 'BNP'],
                          ['pt', 'PT'],
                          ['inr', 'INR'],
                          ['aptt', 'aPTT'],
                          ['crp', 'CRP'],
                          ['pct', 'PCT'],
                          ['lactate', 'Lactate']
                        ].map(([key, label]) => (
                          <div key={key}>
                            <label className={smallLabelClass}>
                              {label}
                            </label>

                            <input
                              value={
                                (newLab as any)[key] || ''
                              }
                              onChange={e =>
                                setNewLab({
                                  ...newLab,
                                  [key]: e.target.value
                                })
                              }
                              className={inputClass}
                            />
                          </div>
                        ))}

                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveLab}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold"
                        >
                          Save Labs
                        </button>

                        <button
                          onClick={() => setShowAddLab(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.labs.length === 0 ? (
                    <EmptyState text="No laboratory results recorded." />
                  ) : (
                    <div className="space-y-3 mt-4">

                      {[...data.labs]
                        .reverse()
                        .map((lab, index) => (
                          <div
                            key={`${lab.timestamp}-${index}`}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800"
                          >

                            <div className="flex items-center justify-between mb-3">

                              <span className="font-mono text-[10px] text-slate-500">
                                {lab.timestamp}
                              </span>

                              {lab.troponin && (
                                <span className="font-bold text-rose-300">
                                  Troponin: {lab.troponin}
                                </span>
                              )}

                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">

                              {[
                                ['Hb', lab.hb],
                                ['WBC', lab.wbc],
                                ['Plt', lab.platelets],
                                ['Na', lab.na],
                                ['K', lab.k],
                                ['Cl', lab.cl],
                                ['Urea', lab.urea],
                                ['Cr', lab.creatinine],
                                ['Glucose', lab.glucose],
                                ['CK-MB', lab.ckmb],
                                ['BNP', lab.bnp],
                                ['INR', lab.inr],
                                ['aPTT', lab.aptt],
                                ['CRP', lab.crp],
                                ['PCT', lab.pct],
                                ['Lactate', lab.lactate]
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-lg bg-slate-950 border border-slate-800 p-2"
                                >
                                  <span className="text-[9px] text-slate-500 block">
                                    {label}
                                  </span>

                                  <span className="font-bold text-white">
                                    {value || '—'}
                                  </span>
                                </div>
                              ))}

                            </div>

                          </div>
                        ))}

                    </div>
                  )}

                </div>
              )}

              {fieldConfig.abg && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Wind className="w-4 h-4" />}
                    title="ABG & Lactate"
                    subtitle={
                      lastABG
                        ? `Latest: ${lastABG.timestamp}`
                        : 'Arterial blood gas records'
                    }
                    action={
                      <button
                        onClick={() => setShowAddABG(v => !v)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add ABG
                      </button>
                    }
                  />

                  {showAddABG && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-blue-900/60">

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">

                        {[
                          ['ph', 'pH'],
                          ['pco2', 'pCO₂'],
                          ['po2', 'pO₂'],
                          ['hco3', 'HCO₃'],
                          ['be', 'BE'],
                          ['lactate', 'Lactate'],
                          ['fio2', 'FiO₂ %']
                        ].map(([key, label]) => (
                          <div key={key}>
                            <label className={smallLabelClass}>
                              {label}
                            </label>

                            <input
                              value={
                                (newABG as any)[key] || ''
                              }
                              onChange={e =>
                                setNewABG({
                                  ...newABG,
                                  [key]: e.target.value
                                })
                              }
                              className={inputClass}
                            />
                          </div>
                        ))}

                      </div>

                      <div className="mt-2">

                        <label className={smallLabelClass}>
                          Interpretation
                        </label>

                        <textarea
                          rows={2}
                          value={newABG.interpretation || ''}
                          onChange={e =>
                            setNewABG({
                              ...newABG,
                              interpretation: e.target.value
                            })
                          }
                          placeholder="e.g. Primary respiratory alkalosis with metabolic acidosis..."
                          className={textareaClass}
                        />

                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveABG}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                        >
                          Save ABG
                        </button>

                        <button
                          onClick={() => setShowAddABG(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.abgRecords.length === 0 ? (
                    <EmptyState text="No ABG records recorded." />
                  ) : (
                    <div className="space-y-3 mt-4">

                      {[...data.abgRecords]
                        .reverse()
                        .map((abg, index) => (
                          <div
                            key={`${abg.timestamp}-${index}`}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800"
                          >

                            <div className="flex items-center justify-between gap-2 mb-3">

                              <span className="font-mono text-[10px] text-slate-500">
                                {abg.timestamp}
                              </span>

                              {abg.pao2fio2Ratio && (
                                <span className="font-bold text-cyan-300">
                                  P/F {abg.pao2fio2Ratio}
                                </span>
                              )}

                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2">

                              {[
                                ['pH', abg.ph],
                                ['pCO₂', abg.pco2],
                                ['pO₂', abg.po2],
                                ['HCO₃', abg.hco3],
                                ['BE', abg.be],
                                ['Lactate', abg.lactate],
                                ['FiO₂', abg.fio2],
                                ['P/F', abg.pao2fio2Ratio]
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-center"
                                >
                                  <span className="text-[9px] text-slate-500 block">
                                    {label}
                                  </span>

                                  <span className="font-bold text-white">
                                    {value || '—'}
                                  </span>
                                </div>
                              ))}

                            </div>

                            {abg.interpretation && (
                              <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                <span className="text-[10px] text-slate-500 block mb-1">
                                  Interpretation
                                </span>

                                {abg.interpretation}
                              </div>
                            )}

                          </div>
                        ))}

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              CCU
          ======================================================== */}

          {activeTab === 'ccu' && (
            <div className="space-y-5">

              <div className="rounded-xl bg-slate-950 border border-rose-900/50 p-4">

                <SectionTitle
                  icon={<HeartPulse className="w-5 h-5 text-rose-400" />}
                  title="CCU / Cardiology"
                  subtitle="ECG • Echo • Coronary angiography • PCI"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">

                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                    <span className="text-[10px] text-slate-500 block">
                      Echo EF
                    </span>

                    <input
                      value={data.ccuData.echoEF}
                      onChange={e =>
                        handleCcuChange(
                          'echoEF',
                          e.target.value
                        )
                      }
                      placeholder="45%"
                      className={`${inputClass} mt-1 text-rose-300 font-black`}
                    />
                  </div>

                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                    <span className="text-[10px] text-slate-500 block">
                      Arrhythmia
                    </span>

                    <input
                      value={data.ccuData.arrhythmia || ''}
                      onChange={e =>
                        handleCcuChange(
                          'arrhythmia',
                          e.target.value
                        )
                      }
                      placeholder="AF / VT / NSR"
                      className={`${inputClass} mt-1`}
                    />
                  </div>

                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                    <span className="text-[10px] text-slate-500 block">
                      ST Elevation
                    </span>

                    <input
                      value={
                        data.ccuData.stElevationLeads || ''
                      }
                      onChange={e =>
                        handleCcuChange(
                          'stElevationLeads',
                          e.target.value
                        )
                      }
                      placeholder="V1-V4"
                      className={`${inputClass} mt-1`}
                    />
                  </div>

                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                    <span className="text-[10px] text-slate-500 block">
                      TIMI Flow
                    </span>

                    <input
                      value={
                        data.ccuData.timiFlowPost || ''
                      }
                      onChange={e =>
                        handleCcuChange(
                          'timiFlowPost',
                          e.target.value
                        )
                      }
                      placeholder="TIMI III"
                      className={`${inputClass} mt-1`}
                    />
                  </div>

                </div>

                {fieldConfig.ecg && (
                  <div className="mt-4">

                    <label className={smallLabelClass}>
                      ECG Findings
                    </label>

                    <textarea
                      rows={3}
                      value={data.ccuData.ecgSummary}
                      onChange={e =>
                        handleCcuChange(
                          'ecgSummary',
                          e.target.value
                        )
                      }
                      placeholder="Rhythm, rate, axis, ischemic changes, ST/T changes..."
                      className={textareaClass}
                    />

                  </div>
                )}

                {fieldConfig.echo && (
                  <div className="mt-4">

                    <label className={smallLabelClass}>
                      Echocardiography
                    </label>

                    <textarea
                      rows={4}
                      value={data.ccuData.echoFindings}
                      onChange={e =>
                        handleCcuChange(
                          'echoFindings',
                          e.target.value
                        )
                      }
                      placeholder="LV/RV function, regional wall motion, valves, pericardium..."
                      className={textareaClass}
                    />

                  </div>
                )}

                {fieldConfig.cathStent && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800">

                    <div className="flex items-center gap-2 mb-3">
                      <ScanLine className="w-4 h-4 text-cyan-400" />

                      <span className="font-bold text-cyan-300">
                        Cath Lab / PCI
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                      <div>
                        <label className={smallLabelClass}>
                          Cath Date
                        </label>

                        <input
                          value={data.ccuData.cathDate || ''}
                          onChange={e =>
                            handleCcuChange(
                              'cathDate',
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Culprit Lesion
                        </label>

                        <input
                          value={
                            data.ccuData.culpritLesion || ''
                          }
                          onChange={e =>
                            handleCcuChange(
                              'culpritLesion',
                              e.target.value
                            )
                          }
                          placeholder="Proximal LAD"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Stent
                        </label>

                        <input
                          value={data.ccuData.stentType || ''}
                          onChange={e =>
                            handleCcuChange(
                              'stentType',
                              e.target.value
                            )
                          }
                          placeholder="DES 3.5 × 24 mm"
                          className={inputClass}
                        />
                      </div>

                    </div>

                    <div className="mt-3">

                      <label className={smallLabelClass}>
                        Cath Findings
                      </label>

                      <textarea
                        rows={3}
                        value={
                          data.ccuData.cathFindings || ''
                        }
                        onChange={e =>
                          handleCcuChange(
                            'cathFindings',
                            e.target.value
                          )
                        }
                        className={textareaClass}
                      />

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

                      <div>
                        <label className={smallLabelClass}>
                          Antiplatelet Therapy
                        </label>

                        <textarea
                          rows={2}
                          value={data.ccuData.antiplatelets}
                          onChange={e =>
                            handleCcuChange(
                              'antiplatelets',
                              e.target.value
                            )
                          }
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Anticoagulation
                        </label>

                        <textarea
                          rows={2}
                          value={data.ccuData.anticoagulation}
                          onChange={e =>
                            handleCcuChange(
                              'anticoagulation',
                              e.target.value
                            )
                          }
                          className={textareaClass}
                        />
                      </div>

                    </div>

                    <div className="mt-3">

                      <label className={smallLabelClass}>
                        Stent Details
                      </label>

                      <textarea
                        rows={2}
                        value={
                          data.ccuData.stentDetails || ''
                        }
                        onChange={e =>
                          handleCcuChange(
                            'stentDetails',
                            e.target.value
                          )
                        }
                        placeholder="Number, location, diameter, length..."
                        className={textareaClass}
                      />

                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* =======================================================
              ICU
          ======================================================== */}

          {activeTab === 'icu' && (
            <div className="space-y-5">

              {fieldConfig.icuVentilator && (
                <div className="rounded-xl bg-slate-950 border border-blue-900/50 p-4">

                  <SectionTitle
                    icon={<Wind className="w-5 h-5 text-blue-400" />}
                    title="Mechanical Ventilation"
                    subtitle="Current ventilator settings"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">

                    {[
                      ['mode', 'Mode'],
                      ['fio2', 'FiO₂'],
                      ['peep', 'PEEP'],
                      ['tv', 'Tidal Volume'],
                      ['rate', 'Set Rate'],
                      ['totalRate', 'Total Rate'],
                      ['pPeak', 'Ppeak'],
                      ['pPlat', 'Pplat'],
                      ['etTubeSize', 'ETT Size'],
                      ['etTubeDepth', 'ETT Depth']
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className={smallLabelClass}>
                          {label}
                        </label>

                        <input
                          value={
                            (data.icuVentilator as any)[key] ??
                            ''
                          }
                          onChange={e =>
                            handleVentChange(
                              key as keyof PatientRecord['icuVentilator'],
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                    ))}

                  </div>

                </div>
              )}

              {fieldConfig.icuScores && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Brain className="w-5 h-5 text-purple-400" />}
                    title="Neurological / ICU Scores"
                    subtitle="GCS • RASS • SOFA"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">
                          GCS
                        </span>

                        <span className="text-2xl font-black text-cyan-300">
                          {data.icuScores.gcsTotal}/15
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3">

                        {[
                          ['gcsEye', 'E'],
                          ['gcsVerbal', 'V'],
                          ['gcsMotor', 'M']
                        ].map(([key, label]) => (
                          <div key={key}>

                            <label className={smallLabelClass}>
                              {label}
                            </label>

                            <input
                              type="number"
                              value={
                                (data.icuScores as any)[key]
                              }
                              onChange={e =>
                                handleScoreChange(
                                  key as keyof PatientRecord['icuScores'],
                                  Number(e.target.value)
                                )
                              }
                              className={inputClass}
                            />

                          </div>
                        ))}

                      </div>

                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">
                          RASS
                        </span>

                        <span className="text-2xl font-black text-purple-300">
                          {data.icuScores.rass > 0
                            ? `+${data.icuScores.rass}`
                            : data.icuScores.rass}
                        </span>
                      </div>

                      <input
                        type="number"
                        min="-5"
                        max="4"
                        value={data.icuScores.rass}
                        onChange={e =>
                          handleScoreChange(
                            'rass',
                            Number(e.target.value)
                          )
                        }
                        className={`${inputClass} mt-3`}
                      />

                      <p className="text-[10px] text-slate-500 mt-2">
                        -5 unarousable → +4 combative
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">
                          SOFA
                        </span>

                        <span className="text-2xl font-black text-amber-300">
                          {data.icuScores.sofaScore}/24
                        </span>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={data.icuScores.sofaScore}
                        onChange={e =>
                          handleScoreChange(
                            'sofaScore',
                            Number(e.target.value)
                          )
                        }
                        className={`${inputClass} mt-3`}
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

                    <div>
                      <label className={smallLabelClass}>
                        Pupils / Neurological Exam
                      </label>

                      <input
                        value={data.icuScores.pupils || ''}
                        onChange={e =>
                          handleScoreChange(
                            'pupils',
                            e.target.value
                          )
                        }
                        placeholder="3 mm equal and reactive bilaterally"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>
                        CAM-ICU
                      </label>

                      <select
                        value={
                          data.icuScores.deliriumCamICU || ''
                        }
                        onChange={e =>
                          handleScoreChange(
                            'deliriumCamICU',
                            e.target.value || undefined
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Not assessed</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="unassessable">
                          Unassessable
                        </option>
                      </select>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              MEDICATIONS
          ======================================================== */}

          {activeTab === 'meds' && (
            <div className="space-y-5">

              {fieldConfig.vasopressorsInfusions && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Syringe className="w-4 h-4 text-rose-400" />}
                    title="Continuous Infusions"
                    subtitle="Vasopressors • Sedation • Insulin • Other infusions"
                    action={
                      <button
                        onClick={() =>
                          setShowAddInfusion(v => !v)
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    }
                  />

                  {showAddInfusion && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-rose-900/60">

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

                        <div>
                          <label className={smallLabelClass}>
                            Drug
                          </label>

                          <input
                            value={newInfusion.drug}
                            onChange={e =>
                              setNewInfusion({
                                ...newInfusion,
                                drug: e.target.value
                              })
                            }
                            placeholder="Norepinephrine"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Dose / Rate
                          </label>

                          <input
                            value={newInfusion.doseRate}
                            onChange={e =>
                              setNewInfusion({
                                ...newInfusion,
                                doseRate: e.target.value
                              })
                            }
                            placeholder="0.1 mcg/kg/min"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Concentration
                          </label>

                          <input
                            value={newInfusion.concentration}
                            onChange={e =>
                              setNewInfusion({
                                ...newInfusion,
                                concentration: e.target.value
                              })
                            }
                            placeholder="4 mg / 50 mL"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Line
                          </label>

                          <input
                            value={newInfusion.lineLocation}
                            onChange={e =>
                              setNewInfusion({
                                ...newInfusion,
                                lineLocation: e.target.value
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveInfusion}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                        >
                          Add Infusion
                        </button>

                        <button
                          onClick={() => setShowAddInfusion(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.infusions.length === 0 ? (
                    <EmptyState text="No continuous infusions recorded." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">

                      {data.infusions.map(infusion => (
                        <div
                          key={infusion.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800"
                        >

                          <div className="flex items-center justify-between gap-2">

                            <div>
                              <p className="font-bold text-white">
                                {infusion.drug}
                              </p>

                              <p className="text-[10px] text-slate-500 mt-1">
                                {infusion.lineLocation || 'Line not specified'}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                removeInfusion(infusion.id)
                              }
                              className="text-slate-600 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">

                            <span className="px-2 py-1 rounded-lg bg-rose-950 border border-rose-900 text-rose-300 font-mono font-bold">
                              {infusion.doseRate || 'Dose not specified'}
                            </span>

                            {infusion.concentration && (
                              <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                                {infusion.concentration}
                              </span>
                            )}

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              )}

              {fieldConfig.medications && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<Pill className="w-4 h-4 text-purple-400" />}
                    title="Medications"
                    subtitle="Scheduled and regular medications"
                    action={
                      <button
                        onClick={() => setShowAddMed(v => !v)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Medication
                      </button>
                    }
                  />

                  {showAddMed && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-purple-900/60">

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">

                        <div className="lg:col-span-2">
                          <label className={smallLabelClass}>
                            Medication
                          </label>

                          <input
                            value={newMed.name}
                            onChange={e =>
                              setNewMed({
                                ...newMed,
                                name: e.target.value
                              })
                            }
                            placeholder="Aspirin"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Dose
                          </label>

                          <input
                            value={newMed.dose}
                            onChange={e =>
                              setNewMed({
                                ...newMed,
                                dose: e.target.value
                              })
                            }
                            placeholder="100 mg"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Route
                          </label>

                          <select
                            value={newMed.route}
                            onChange={e =>
                              setNewMed({
                                ...newMed,
                                route: e.target.value
                              })
                            }
                            className={inputClass}
                          >
                            <option>Oral</option>
                            <option>IV</option>
                            <option>IM</option>
                            <option>SC</option>
                            <option>SL</option>
                            <option>Inhaled</option>
                            <option>Topical</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Frequency
                          </label>

                          <input
                            value={newMed.frequency}
                            onChange={e =>
                              setNewMed({
                                ...newMed,
                                frequency: e.target.value
                              })
                            }
                            placeholder="BID"
                            className={inputClass}
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 mt-3">

                        <button
                          onClick={handleSaveMedication}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
                        >
                          Add Medication
                        </button>

                        <button
                          onClick={() => setShowAddMed(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                  {data.medications.length === 0 ? (
                    <EmptyState text="No medications recorded." />
                  ) : (
                    <div className="overflow-x-auto mt-4">

                      <table className="w-full text-left">

                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                            <th className="py-2">Medication</th>
                            <th>Dose</th>
                            <th>Route</th>
                            <th>Frequency</th>
                            <th>Category</th>
                            <th />
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/60">

                          {data.medications.map(med => (
                            <tr
                              key={med.id}
                              className="hover:bg-slate-900/60"
                            >

                              <td className="py-2 font-bold text-white">
                                {med.name}
                              </td>

                              <td className="font-mono text-cyan-300">
                                {med.dose || '—'}
                              </td>

                              <td className="text-slate-300">
                                {med.route}
                              </td>

                              <td className="text-slate-300">
                                {med.frequency}
                              </td>

                              <td className="text-slate-500">
                                {med.category || 'other'}
                              </td>

                              <td className="text-right">

                                <button
                                  onClick={() =>
                                    removeMedication(med.id)
                                  }
                                  className="text-slate-600 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                              </td>

                            </tr>
                          ))}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              TIMELINE
          ======================================================== */}

          {activeTab === 'notes' && (
            <div className={cardClass}>

              <SectionTitle
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                title="Clinical Timeline"
                subtitle="Progress notes, events, handovers and consultations"
              />

              <div className="mt-4">

                <TimelineNotes
                  notes={data.progressNotes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  patientName={data.name}
                />

              </div>

            </div>
          )}

          {/* =======================================================
              PROCEDURES / PLAN
          ======================================================== */}

          {activeTab === 'procedures' && (
            <div className="space-y-5">

              <div className={cardClass}>

                <SectionTitle
                  icon={<Stethoscope className="w-4 h-4" />}
                  title="Procedures & Interventions"
                  subtitle="Bedside and invasive procedures"
                  action={
                    <button
                      onClick={() =>
                        setShowAddProcedure(v => !v)
                      }
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Procedure
                    </button>
                  }
                />

                {showAddProcedure && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-900/60">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

                      <div className="lg:col-span-2">
                        <label className={smallLabelClass}>
                          Procedure
                        </label>

                        <input
                          value={newProcedure.name}
                          onChange={e =>
                            setNewProcedure({
                              ...newProcedure,
                              name: e.target.value
                            })
                          }
                          placeholder="Central line / Intubation / PCI..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Date & Time
                        </label>

                        <input
                          value={newProcedure.date}
                          onChange={e =>
                            setNewProcedure({
                              ...newProcedure,
                              date: e.target.value
                            })
                          }
                          placeholder={nowStamp()}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Site
                        </label>

                        <input
                          value={newProcedure.site}
                          onChange={e =>
                            setNewProcedure({
                              ...newProcedure,
                              site: e.target.value
                            })
                          }
                          placeholder="Right IJ"
                          className={inputClass}
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">

                      <div>
                        <label className={smallLabelClass}>
                          Operator
                        </label>

                        <input
                          value={newProcedure.performer}
                          onChange={e =>
                            setNewProcedure({
                              ...newProcedure,
                              performer: e.target.value
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={smallLabelClass}>
                          Notes / Findings / Complications
                        </label>

                        <input
                          value={newProcedure.notes}
                          onChange={e =>
                            setNewProcedure({
                              ...newProcedure,
                              notes: e.target.value
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                    </div>

                    <div className="flex justify-end gap-2 mt-3">

                      <button
                        onClick={handleSaveProcedure}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold"
                      >
                        Save Procedure
                      </button>

                      <button
                        onClick={() =>
                          setShowAddProcedure(false)
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                )}

                {data.procedures.length === 0 ? (
                  <EmptyState text="No procedures recorded." />
                ) : (
                  <div className="space-y-2 mt-4">

                    {[...data.procedures]
                      .reverse()
                      .map(procedure => (
                        <div
                          key={procedure.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-bold text-white">
                                {procedure.name}
                              </p>

                              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-1">

                                {procedure.date && (
                                  <span>
                                    {procedure.date}
                                  </span>
                                )}

                                {procedure.site && (
                                  <span>
                                    • Site: {procedure.site}
                                  </span>
                                )}

                                {procedure.performer && (
                                  <span>
                                    • Operator: {procedure.performer}
                                  </span>
                                )}

                              </div>

                              {procedure.notes && (
                                <p className="text-slate-400 mt-2 whitespace-pre-wrap">
                                  {procedure.notes}
                                </p>
                              )}

                            </div>

                            <button
                              onClick={() =>
                                removeProcedure(procedure.id)
                              }
                              className="text-slate-600 hover:text-rose-400 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>

                        </div>
                      ))}

                  </div>
                )}

              </div>

              {/* Imaging */}

              {fieldConfig.imaging && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<ScanLine className="w-4 h-4" />}
                    title="Imaging & Diagnostics"
                    subtitle="CXR • CT • MRI • Ultrasound • Other diagnostics"
                  />

                  <textarea
                    rows={5}
                    value={data.imagingSummary}
                    onChange={e =>
                      handleFieldChange(
                        'imagingSummary',
                        e.target.value
                      )
                    }
                    placeholder="Record imaging findings, dates, impressions..."
                    className={`${textareaClass} mt-4`}
                  />

                </div>
              )}

              {/* Consultations */}

              {fieldConfig.consultations && (
                <div className={cardClass}>

                  <SectionTitle
                    icon={<UsersIcon />}
                    title="Consultations"
                    subtitle="Specialty and multidisciplinary recommendations"
                  />

                  <textarea
                    rows={5}
                    value={data.consultations}
                    onChange={e =>
                      handleFieldChange(
                        'consultations',
                        e.target.value
                      )
                    }
                    placeholder="Cardiology / Neurology / Nephrology / ID / Surgery..."
                    className={`${textareaClass} mt-4`}
                  />

                </div>
              )}

              {/* Plan */}

              {fieldConfig.dischargePlan && (
                <div className="rounded-xl bg-amber-950/30 border border-amber-900/60 p-4">

                  <SectionTitle
                    icon={<ClipboardList className="w-4 h-4 text-amber-400" />}
                    title="Current Plan / Discharge / Transfer"
                  />

                  <textarea
                    rows={5}
                    value={data.dischargeTransferPlan}
                    onChange={e =>
                      handleFieldChange(
                        'dischargeTransferPlan',
                        e.target.value
                      )
                    }
                    placeholder="Current clinical plan, step-down criteria, discharge planning..."
                    className={`${textareaClass} mt-4`}
                  />

                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================================================
            FOOTER
        ========================================================== */}

        <div className="px-3 sm:px-5 py-2.5 border-t border-slate-800 bg-slate-950 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">

            <Clock className="w-3.5 h-3.5" />

            <span>
              Last modified: {data.lastUpdated}
            </span>

          </div>

          <div className="flex items-center gap-2">

            {saveToast && (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}

            <button
              onClick={triggerSaveToast}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

/* Small local icon component to avoid another dependency. */
const UsersIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
