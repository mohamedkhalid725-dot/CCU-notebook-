import React, { useState } from 'react';
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
  FileText, 
  Droplets, 
  Stethoscope, 
  Wind, 
  Pill, 
  AlertCircle,
  Sparkles,
  Edit2,
  LogOut,
  Bed,
  FolderArchive,
  ShieldCheck
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
  const [data, setData] = useState<PatientRecord>({ ...patient });
  const [activeTab, setActiveTab] = useState<
    'overview' | 'vitals_io' | 'labs_abg' | 'ccu' | 'icu' | 'meds' | 'notes' | 'procedures'
  >(specialtyMode === 'ccu' ? 'ccu' : specialtyMode === 'icu' ? 'icu' : 'overview');

  const [saveToast, setSaveToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New item modal triggers
  const [showAddVital, setShowAddVital] = useState(false);
  const [newVital, setNewVital] = useState<Partial<VitalSignEntry>>({
    hr: 75,
    bpSystolic: 120,
    bpDiastolic: 75,
    rr: 16,
    spo2: 98,
    temp: 36.8,
    rhythm: 'Sinus'
  });

  const [showAddLab, setShowAddLab] = useState(false);
  const [newLab, setNewLab] = useState<Partial<LabResults>>({
    hb: '13.5',
    wbc: '8.2',
    platelets: '220',
    na: '139',
    k: '4.1',
    creatinine: '1.0',
    glucose: '120',
    troponin: ''
  });

  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dose: '', route: 'Oral', frequency: 'Daily' });

  const [showAddInfusion, setShowAddInfusion] = useState(false);
  const [newInfusion, setNewInfusion] = useState({ drug: '', doseRate: '', lineLocation: 'Peripheral IV' });

  const handleFieldChange = (field: keyof PatientRecord, val: any) => {
    setData(prev => {
      const next = { ...prev, [field]: val, lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ') };
      onUpdatePatient(next);
      return next;
    });
  };

  const handleCcuChange = (field: keyof PatientRecord['ccuData'], val: any) => {
    setData(prev => {
      const next = {
        ...prev,
        ccuData: { ...prev.ccuData, [field]: val },
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      onUpdatePatient(next);
      return next;
    });
  };

  const handleIcuVentChange = (field: keyof PatientRecord['icuVentilator'], val: any) => {
    setData(prev => {
      const next = {
        ...prev,
        icuVentilator: { ...prev.icuVentilator, [field]: val },
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      onUpdatePatient(next);
      return next;
    });
  };

  const handleIcuScoresChange = (field: keyof PatientRecord['icuScores'], val: any) => {
    setData(prev => {
      const next = {
        ...prev,
        icuScores: { ...prev.icuScores, [field]: val },
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      onUpdatePatient(next);
      return next;
    });
  };

  // Timeline notes handlers
  const handleAddNote = (note: ProgressNote) => {
    const updatedNotes = [...data.progressNotes, note];
    handleFieldChange('progressNotes', updatedNotes);
  };

  const handleUpdateNote = (updatedNote: ProgressNote) => {
    const updatedNotes = data.progressNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
    handleFieldChange('progressNotes', updatedNotes);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = data.progressNotes.filter(n => n.id !== noteId);
    handleFieldChange('progressNotes', updatedNotes);
  };

  // Add vital
  const handleSaveVital = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry: VitalSignEntry = {
      timestamp: `${mm}/${dd} ${timeStr}`,
      hr: newVital.hr || 70,
      bpSystolic: newVital.bpSystolic || 120,
      bpDiastolic: newVital.bpDiastolic || 80,
      map: Math.round(((Number(newVital.bpDiastolic) * 2) + Number(newVital.bpSystolic)) / 3),
      rr: newVital.rr || 16,
      spo2: newVital.spo2 || 98,
      temp: newVital.temp || 37.0,
      rhythm: newVital.rhythm || 'NSR'
    };
    handleFieldChange('vitals', [...data.vitals, entry]);
    setShowAddVital(false);
  };

  // Add lab
  const handleSaveLab = () => {
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const entry: LabResults = {
      timestamp: timeStr,
      ...newLab
    };
    handleFieldChange('labs', [...data.labs, entry]);
    setShowAddLab(false);
  };

  // Add med
  const handleSaveMed = () => {
    if (!newMed.name) return;
    const med: Medication = {
      id: `med-${Date.now()}`,
      ...newMed
    };
    handleFieldChange('medications', [...data.medications, med]);
    setNewMed({ name: '', dose: '', route: 'Oral', frequency: 'Daily' });
    setShowAddMed(false);
  };

  // Add infusion
  const handleSaveInfusion = () => {
    if (!newInfusion.drug) return;
    const inf: Infusion = {
      id: `inf-${Date.now()}`,
      ...newInfusion
    };
    handleFieldChange('infusions', [...data.infusions, inf]);
    setNewInfusion({ drug: '', doseRate: '', lineLocation: 'Peripheral IV' });
    setShowAddInfusion(false);
  };

  const triggerSaveToast = () => {
    onUpdatePatient(data);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[95vh]">
        {/* Sticky Header: Ahmed — Bed 1 or Medical Record Archive */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
              data.isDischarged
                ? 'bg-amber-950/80 border border-amber-800/80 text-amber-300'
                : data.status === 'critical'
                ? 'bg-rose-900/80 border border-rose-700 text-rose-200'
                : 'bg-cyan-950 border border-cyan-800 text-cyan-300'
            }`}>
              {data.isDischarged ? (
                <FolderArchive className="w-5 h-5 text-amber-400" />
              ) : (
                data.bedNumber
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {data.name} — {data.isDischarged ? `Medical Record (Ex-Bed ${data.previousBedNumber || data.bedNumber})` : `Bed ${data.bedNumber}`}
                </h2>
                <select
                  value={data.status}
                  onChange={e => handleFieldChange('status', e.target.value as BedStatus)}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    data.status === 'stable'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : data.status === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : data.status === 'discharged'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  <option value="stable">Stable</option>
                  <option value="critical">Critical</option>
                  <option value="deteriorating">Deteriorating</option>
                  <option value="guarded">Guarded</option>
                  <option value="post-op">Post-Op</option>
                  <option value="discharged">Discharged / Archived</option>
                </select>
                <select
                  value={data.codeStatus}
                  onChange={e => handleFieldChange('codeStatus', e.target.value)}
                  className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300"
                >
                  <option value="Full Code">Full Code</option>
                  <option value="DNR">DNR</option>
                  <option value="DNI">DNI</option>
                  <option value="Modified">Modified</option>
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.primaryDiagnosis} • MRN: {data.mrn} • Age: {data.age}{data.gender === 'Male' ? 'M' : 'F'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {saveToast && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}

            {/* Discharge Button (if currently in bed) */}
            {!data.isDischarged && onDischargePatient && (
              <button
                onClick={() => onDischargePatient(data)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-xs"
                title="Discharge patient to free bed while keeping medical record"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Discharge</span>
              </button>
            )}

            {/* Re-admit Button (if currently in archive) */}
            {data.isDischarged && onReadmitPatient && (
              <button
                onClick={() => onReadmitPatient(data)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-xs"
                title="Re-admit patient to an active bed"
              >
                <Bed className="w-3.5 h-3.5" />
                <span>Re-admit</span>
              </button>
            )}

            <button
              onClick={triggerSaveToast}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              title="Save Patient Record"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={() => onPrintPatient(data)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Print Clinical Summary / PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
              title="Permanently Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Close File"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Discharge Banner (When patient is discharged) */}
        {data.isDischarged && (
          <div className="px-4 sm:px-6 py-2.5 bg-amber-950/40 border-b border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  مريض مخرج من الحجز • السجل الطبي متاح دائماً
                </span>
                <span className="text-slate-300 text-[11px] ml-2">
                  Destination: <strong className="text-white">{data.dischargeDetails?.disposition || 'Discharged'}</strong> • Date: <span className="font-mono text-amber-200">{data.dischargeDetails?.dischargeDate || 'Recorded'}</span> • Condition: {data.dischargeDetails?.conditionAtDischarge || 'Stable'}
                </span>
              </div>
            </div>

            {onReadmitPatient && (
              <button
                onClick={() => onReadmitPatient(data)}
                className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 transition"
              >
                <Bed className="w-3.5 h-3.5" />
                <span>إعادة تسكين بالسرير</span>
              </button>
            )}
          </div>
        )}

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-3 bg-rose-950 border-b border-rose-800 flex items-center justify-between text-xs text-rose-200">
            <span>
              Permanently delete entire medical record for <strong>{data.name}</strong> from database? (To free the bed while keeping the medical file, use Discharge instead).
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDeletePatient(data.id);
                  onClose();
                }}
                className="px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-500"
              >
                Yes, Delete Record
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-2.5 border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📋 Overview & Exam
          </button>
          {fieldConfig.vitals && (
            <button
              onClick={() => setActiveTab('vitals_io')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'vitals_io'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vitals & I/O</span>
            </button>
          )}
          {fieldConfig.labs && (
            <button
              onClick={() => setActiveTab('labs_abg')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'labs_abg'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Labs & ABG</span>
            </button>
          )}
          {(fieldConfig.ccuCardiology || fieldConfig.cathStent || fieldConfig.echo) && (
            <button
              onClick={() => setActiveTab('ccu')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'ccu'
                  ? 'border-rose-400 text-rose-300'
                  : 'border-transparent text-slate-400 hover:text-rose-200'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>🫀 CCU Cardiology</span>
            </button>
          )}
          {(fieldConfig.icuVentilator || fieldConfig.icuScores || fieldConfig.vasopressorsInfusions) && (
            <button
              onClick={() => setActiveTab('icu')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'icu'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-blue-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>🫁 ICU Vent & Scores</span>
            </button>
          )}
          {fieldConfig.medications && (
            <button
              onClick={() => setActiveTab('meds')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'meds'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-purple-400" />
              <span>Meds & Infusions</span>
            </button>
          )}
          {fieldConfig.progressNotesTimeline && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'notes'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>📝 Timeline Notes ({data.progressNotes.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'procedures'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🩺 Procedures & Plan
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* TAB 1: OVERVIEW & EXAMINATION */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Discharge Information Card if patient is discharged */}
              {data.isDischarged && data.dischargeDetails && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-amber-300 text-sm">Discharge & Transfer Summary</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-900/60 text-amber-200 border border-amber-700/60">
                      {data.dischargeDetails.disposition}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Discharge Date & Time:</span>
                      <span className="font-mono text-white font-semibold">{data.dischargeDetails.dischargeDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Condition at Discharge:</span>
                      <span className="text-white font-semibold">{data.dischargeDetails.conditionAtDischarge}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Discharging Doctor:</span>
                      <span className="text-white font-semibold">{data.dischargeDetails.dischargedBy || data.attendingPhysician}</span>
                    </div>
                  </div>

                  {data.dischargeDetails.dischargeSummary && (
                    <div className="pt-2 border-t border-amber-800/30">
                      <span className="text-slate-400 block font-medium mb-1">Clinical Discharge Summary:</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                        {data.dischargeDetails.dischargeSummary}
                      </p>
                    </div>
                  )}

                  {data.dischargeDetails.dischargeMedications && (
                    <div className="pt-1">
                      <span className="text-slate-400 block font-medium mb-1">Floor / Discharge Medications:</span>
                      <p className="font-mono text-[11px] text-cyan-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                        {data.dischargeDetails.dischargeMedications}
                      </p>
                    </div>
                  )}

                  {data.dischargeDetails.followUpInstructions && (
                    <div className="pt-1">
                      <span className="text-slate-400 block font-medium mb-1">Follow-up Instructions:</span>
                      <p className="text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        {data.dischargeDetails.followUpInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Demographics row */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    {data.isDischarged ? 'Previous Bed' : 'Bed Number'}
                  </label>
                  <input
                    type="text"
                    value={data.isDischarged ? `Ex-Bed ${data.previousBedNumber || data.bedNumber}` : data.bedNumber}
                    disabled={data.isDischarged}
                    onChange={e => handleFieldChange('bedNumber', Number(e.target.value))}
                    className={`w-full p-1.5 rounded border text-white font-mono ${
                      data.isDischarged ? 'bg-slate-900/60 border-slate-800 text-amber-300 opacity-80 cursor-not-allowed' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Admission Date & Time</label>
                  <input
                    type="text"
                    value={data.admissionDate}
                    onChange={e => handleFieldChange('admissionDate', e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Attending Physician</label>
                  <input
                    type="text"
                    value={data.attendingPhysician}
                    onChange={e => handleFieldChange('attendingPhysician', e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="text-cyan-300 font-bold block mb-1 uppercase tracking-wider text-[11px]">
                    Primary Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={data.primaryDiagnosis}
                    onChange={e => handleFieldChange('primaryDiagnosis', e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-cyan-800/60 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Secondary Diagnoses / Comorbidities
                  </label>
                  <input
                    type="text"
                    value={data.secondaryDiagnoses.join(', ')}
                    onChange={e => handleFieldChange('secondaryDiagnoses', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g. Hypertension, Type 2 DM, CKD Stage 3"
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              {/* Chief Complaint & HPI */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Chief Complaint</label>
                  <textarea
                    rows={2}
                    value={data.chiefComplaint}
                    onChange={e => handleFieldChange('chiefComplaint', e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">History of Present Illness (HPI)</label>
                  <textarea
                    rows={3}
                    value={data.historyOfPresentIllness}
                    onChange={e => handleFieldChange('historyOfPresentIllness', e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Past Medical & Surgical History</label>
                  <textarea
                    rows={2}
                    value={data.pastMedicalHistory}
                    onChange={e => handleFieldChange('pastMedicalHistory', e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Examination */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-cyan-300 font-bold block uppercase tracking-wider text-[11px]">
                  Physical Examination Summary
                </label>
                <textarea
                  rows={3}
                  value={data.examinationSummary}
                  onChange={e => handleFieldChange('examinationSummary', e.target.value)}
                  placeholder="Neuro: GCS 15. Chest: Bilateral breath sounds equal, no wheezes. CVS: S1+S2 regular, no murmurs. Abdomen: Soft, non-tender. Extremities: Warm, no edema, radial site clean..."
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & I/O */}
          {activeTab === 'vitals_io' && (
            <div className="space-y-6">
              {/* Vitals Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Vital Signs History
                  </span>
                  <button
                    onClick={() => setShowAddVital(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Vitals</span>
                  </button>
                </div>

                {/* Add vital mini form */}
                {showAddVital && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={newVital.hr}
                        onChange={e => setNewVital({ ...newVital, hr: Number(e.target.value) })}
                        className="w-full p-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">BP (Systolic / Diastolic)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="Sys"
                          value={newVital.bpSystolic}
                          onChange={e => setNewVital({ ...newVital, bpSystolic: Number(e.target.value) })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                        <input
                          type="number"
                          placeholder="Dia"
                          value={newVital.bpDiastolic}
                          onChange={e => setNewVital({ ...newVital, bpDiastolic: Number(e.target.value) })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">SpO2 (%) & RR</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="SpO2"
                          value={newVital.spo2}
                          onChange={e => setNewVital({ ...newVital, spo2: Number(e.target.value) })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                        <input
                          type="number"
                          placeholder="RR"
                          value={newVital.rr}
                          onChange={e => setNewVital({ ...newVital, rr: Number(e.target.value) })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <button
                        onClick={handleSaveVital}
                        className="flex-1 py-1 rounded bg-cyan-600 text-white font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowAddVital(false)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Vitals Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2">Time</th>
                        <th>HR</th>
                        <th>BP (MAP)</th>
                        <th>RR</th>
                        <th>SpO2</th>
                        <th>Temp</th>
                        <th>Rhythm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.vitals.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-900/50">
                          <td className="py-2 text-slate-300">{v.timestamp}</td>
                          <td className="font-bold text-rose-300">{v.hr}</td>
                          <td className="text-white font-bold">{v.bpSystolic}/{v.bpDiastolic} ({v.map || Math.round(((Number(v.bpDiastolic)*2)+Number(v.bpSystolic))/3)})</td>
                          <td>{v.rr}</td>
                          <td className="font-bold text-cyan-300">{v.spo2}%</td>
                          <td>{v.temp}°C</td>
                          <td className="text-slate-400">{v.rhythm || 'NSR'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* I/O Fluid Balance Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  Intake / Output (Fluid Balance)
                </span>
                {data.ioRecords.map((io, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-200">{io.timestamp}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{io.notes}</p>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Intake</span>
                        <span className="font-bold text-cyan-400">{io.intakeIV + io.intakeEnteral} mL</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Output</span>
                        <span className="font-bold text-rose-400">{io.outputUrine + io.outputDrain + io.outputGI} mL</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Net Balance</span>
                        <span className="font-bold text-amber-400">
                          {(io.intakeIV + io.intakeEnteral) - (io.outputUrine + io.outputDrain + io.outputGI) > 0 ? '+' : ''}
                          {(io.intakeIV + io.intakeEnteral) - (io.outputUrine + io.outputDrain + io.outputGI)} mL
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LABS & ABG */}
          {activeTab === 'labs_abg' && (
            <div className="space-y-6">
              {/* Labs panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    Laboratory Results Panel
                  </span>
                  <button
                    onClick={() => setShowAddLab(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Labs</span>
                  </button>
                </div>

                {showAddLab && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Hemoglobin (Hb)</label>
                      <input
                        type="text"
                        value={newLab.hb}
                        onChange={e => setNewLab({ ...newLab, hb: e.target.value })}
                        className="w-full p-1 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">WBC & Platelets</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="WBC"
                          value={newLab.wbc}
                          onChange={e => setNewLab({ ...newLab, wbc: e.target.value })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Plt"
                          value={newLab.platelets}
                          onChange={e => setNewLab({ ...newLab, platelets: e.target.value })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Creatinine & Urea</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Cr"
                          value={newLab.creatinine}
                          onChange={e => setNewLab({ ...newLab, creatinine: e.target.value })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Urea"
                          value={newLab.urea}
                          onChange={e => setNewLab({ ...newLab, urea: e.target.value })}
                          className="w-1/2 p-1 rounded bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Troponin (ng/mL)</label>
                      <input
                        type="text"
                        placeholder="e.g. 18.4"
                        value={newLab.troponin}
                        onChange={e => setNewLab({ ...newLab, troponin: e.target.value })}
                        className="w-full p-1 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-4 flex justify-end gap-2 mt-2">
                      <button
                        onClick={handleSaveLab}
                        className="px-3 py-1 rounded bg-cyan-600 text-white font-bold"
                      >
                        Save Lab Entry
                      </button>
                      <button
                        onClick={() => setShowAddLab(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Labs display */}
                <div className="space-y-2">
                  {data.labs.map((lab, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                        <span>Timestamp: {lab.timestamp}</span>
                        {lab.troponin && <span className="text-rose-400 font-bold">Trop: {lab.troponin} ng/mL</span>}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Hb</span><span className="font-bold text-white">{lab.hb || '—'}</span></div>
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">WBC</span><span className="font-bold text-white">{lab.wbc || '—'}</span></div>
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Plt</span><span className="font-bold text-white">{lab.platelets || '—'}</span></div>
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Na / K</span><span className="font-bold text-white">{lab.na || '—'}/{lab.k || '—'}</span></div>
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Creatinine</span><span className="font-bold text-cyan-300">{lab.creatinine || '—'}</span></div>
                        <div className="p-1.5 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Glucose</span><span className="font-bold text-amber-300">{lab.glucose || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ABG Panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-blue-400" />
                  Arterial Blood Gas (ABG) & Lactate
                </span>
                <div className="space-y-2">
                  {data.abgRecords.map((abg, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">{abg.timestamp}</span>
                        <span className="font-semibold text-cyan-300">{abg.interpretation}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">pH</span><span className="font-bold text-white">{abg.ph}</span></div>
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">pCO2</span><span className="font-bold text-white">{abg.pco2}</span></div>
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">pO2</span><span className="font-bold text-white">{abg.po2}</span></div>
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">HCO3</span><span className="font-bold text-white">{abg.hco3}</span></div>
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Base Excess</span><span className="font-bold text-white">{abg.be}</span></div>
                        <div className="p-1 rounded bg-slate-950"><span className="text-[10px] text-slate-500 block">Lactate</span><span className="font-bold text-rose-400">{abg.lactate} mmol/L</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CCU CARDIOLOGY */}
          {activeTab === 'ccu' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-rose-300 text-sm flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" />
                    Coronary Care Unit (CCU) Cardiology Focus
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400">Echo EF%:</label>
                    <input
                      type="text"
                      value={data.ccuData.echoEF}
                      onChange={e => handleCcuChange('echoEF', e.target.value)}
                      className="w-16 p-1 rounded bg-slate-900 border border-rose-700 text-rose-300 font-bold text-center"
                      placeholder="e.g. 45%"
                    />
                  </div>
                </div>

                {/* ECG Findings */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    ECG Findings & ST Elevation Leads
                  </label>
                  <textarea
                    rows={2}
                    value={data.ccuData.ecgSummary}
                    onChange={e => handleCcuChange('ecgSummary', e.target.value)}
                    placeholder="e.g. Anterior STEMI with 3mm ST elevation in V1-V4..."
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                {/* Echo Findings */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Echocardiogram Detailed Report
                  </label>
                  <textarea
                    rows={2}
                    value={data.ccuData.echoFindings}
                    onChange={e => handleCcuChange('echoFindings', e.target.value)}
                    placeholder="Wall motion abnormalities, LV function, RV function, valvular status..."
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                {/* Cath Lab & Stenting */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                  <span className="font-bold text-cyan-300 block text-xs uppercase tracking-wider">
                    Cath Lab & Coronary Intervention
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Culprit Lesion</label>
                      <input
                        type="text"
                        value={data.ccuData.culpritLesion || ''}
                        onChange={e => handleCcuChange('culpritLesion', e.target.value)}
                        placeholder="e.g. Proximal LAD, Mid RCA"
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Stent Type & Size</label>
                      <input
                        type="text"
                        value={data.ccuData.stentType || ''}
                        onChange={e => handleCcuChange('stentType', e.target.value)}
                        placeholder="e.g. DES 3.5 x 24 mm"
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Post-PCI TIMI Flow</label>
                      <input
                        type="text"
                        value={data.ccuData.timiFlowPost || ''}
                        onChange={e => handleCcuChange('timiFlowPost', e.target.value)}
                        placeholder="e.g. TIMI III"
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Cath Summary Findings</label>
                    <textarea
                      rows={2}
                      value={data.ccuData.cathFindings || ''}
                      onChange={e => handleCcuChange('cathFindings', e.target.value)}
                      className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Antiplatelets & Anticoagulation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-amber-300 font-semibold block mb-1">
                      Antiplatelets (DAPT Regimen)
                    </label>
                    <input
                      type="text"
                      value={data.ccuData.antiplatelets}
                      onChange={e => handleCcuChange('antiplatelets', e.target.value)}
                      placeholder="e.g. Aspirin 81mg + Ticagrelor 90mg BID"
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-cyan-300 font-semibold block mb-1">
                      Anticoagulation Regimen
                    </label>
                    <input
                      type="text"
                      value={data.ccuData.anticoagulation}
                      onChange={e => handleCcuChange('anticoagulation', e.target.value)}
                      placeholder="e.g. Enoxaparin 1mg/kg SC BID or Heparin"
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ICU CRITICAL CARE */}
          {activeTab === 'icu' && (
            <div className="space-y-4">
              {/* Ventilator Settings */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/40 space-y-3">
                <span className="font-bold text-blue-300 text-sm flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-400" />
                  Mechanical Ventilation Settings
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Ventilator Mode</label>
                    <input
                      type="text"
                      value={data.icuVentilator.mode}
                      onChange={e => handleIcuVentChange('mode', e.target.value)}
                      placeholder="e.g. PRVC, PCV, PSV, BiPAP"
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">FiO2 (%)</label>
                    <input
                      type="text"
                      value={data.icuVentilator.fio2}
                      onChange={e => handleIcuVentChange('fio2', e.target.value)}
                      placeholder="e.g. 40%"
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">PEEP (cmH2O)</label>
                    <input
                      type="text"
                      value={data.icuVentilator.peep}
                      onChange={e => handleIcuVentChange('peep', e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Tidal Volume (TV mL)</label>
                    <input
                      type="text"
                      value={data.icuVentilator.tv}
                      onChange={e => handleIcuVentChange('tv', e.target.value)}
                      placeholder="e.g. 420"
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ICU Scores: GCS, RASS, SOFA */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  ICU Bedside Scores (GCS, RASS, SOFA)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[11px] block">Glasgow Coma Scale</span>
                    <div className="text-2xl font-black text-cyan-400 font-mono my-1">
                      {data.icuScores.gcsTotal} / 15
                    </div>
                    <div className="flex justify-center gap-1 text-[10px] text-slate-400">
                      <span>E{data.icuScores.gcsEye}</span>
                      <span>V{data.icuScores.gcsVerbal}</span>
                      <span>M{data.icuScores.gcsMotor}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[11px] block">RASS Sedation Score</span>
                    <div className="text-2xl font-black text-purple-400 font-mono my-1">
                      {data.icuScores.rass > 0 ? `+${data.icuScores.rass}` : data.icuScores.rass}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {data.icuScores.rass === 0 ? 'Alert & calm' : data.icuScores.rass < 0 ? 'Sedated' : 'Agitated'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[11px] block">SOFA Score</span>
                    <div className="text-2xl font-black text-amber-400 font-mono my-1">
                      {data.icuScores.sofaScore} / 24
                    </div>
                    <span className="text-[10px] text-slate-400 block">Organ Failure Index</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Pupillary Examination & Reflexes</label>
                  <input
                    type="text"
                    value={data.icuScores.pupils || ''}
                    onChange={e => handleIcuScoresChange('pupils', e.target.value)}
                    placeholder="e.g. 3mm equal, round, briskly reactive bilaterally"
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MEDICATIONS & INFUSIONS */}
          {activeTab === 'meds' && (
            <div className="space-y-6">
              {/* Infusions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-rose-400" />
                    Continuous Infusions (Vasopressors, Sedation, Insulin)
                  </span>
                  <button
                    onClick={() => setShowAddInfusion(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Infusion</span>
                  </button>
                </div>

                {showAddInfusion && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-rose-800/60 flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-[10px] text-slate-400">Drug / Agent</label>
                      <input
                        type="text"
                        placeholder="Norepinephrine, Propofol..."
                        value={newInfusion.drug}
                        onChange={e => setNewInfusion({ ...newInfusion, drug: e.target.value })}
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="w-40">
                      <label className="text-[10px] text-slate-400">Dose / Rate</label>
                      <input
                        type="text"
                        placeholder="0.1 mcg/kg/min"
                        value={newInfusion.doseRate}
                        onChange={e => setNewInfusion({ ...newInfusion, doseRate: e.target.value })}
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveInfusion}
                      className="px-3 py-1.5 rounded bg-rose-600 text-white font-bold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddInfusion(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {data.infusions.map(inf => (
                    <div key={inf.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-white">{inf.drug}</span>
                      <span className="font-mono text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                        {inf.doseRate}
                      </span>
                    </div>
                  ))}
                  {data.infusions.length === 0 && (
                    <p className="text-slate-500 italic text-center py-2">No active continuous infusions</p>
                  )}
                </div>
              </div>

              {/* Regular Medications */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-400" />
                    Scheduled & Regular Medications
                  </span>
                  <button
                    onClick={() => setShowAddMed(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

                {showAddMed && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-purple-800/60 flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-[10px] text-slate-400">Drug Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aspirin, Meropenem"
                        value={newMed.name}
                        onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="w-28">
                      <label className="text-[10px] text-slate-400">Dose</label>
                      <input
                        type="text"
                        placeholder="100 mg"
                        value={newMed.dose}
                        onChange={e => setNewMed({ ...newMed, dose: e.target.value })}
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] text-slate-400">Frequency</label>
                      <input
                        type="text"
                        placeholder="Once daily"
                        value={newMed.frequency}
                        onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveMed}
                      className="px-3 py-1.5 rounded bg-purple-600 text-white font-bold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddMed(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {data.medications.map(med => (
                    <div key={med.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-white">{med.name} <span className="text-slate-400 font-normal">({med.dose})</span></span>
                      <span className="text-slate-400">{med.route} • {med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINE PROGRESS NOTES */}
          {activeTab === 'notes' && (
            <TimelineNotes
              notes={data.progressNotes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              patientName={data.name}
            />
          )}

          {/* TAB 8: PROCEDURES & CONSULTATIONS & PLAN */}
          {activeTab === 'procedures' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-cyan-300 font-bold block uppercase tracking-wider text-[11px]">
                  Procedures & Line Insertions Log
                </label>
                <div className="space-y-1.5">
                  {data.procedures.map(pr => (
                    <div key={pr.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-white">{pr.name} ({pr.site})</span>
                      <span className="text-slate-400 font-mono text-[11px]">{pr.date} • {pr.performer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-slate-300 font-semibold block">Imaging & Diagnostics Summary</label>
                <textarea
                  rows={2}
                  value={data.imagingSummary}
                  onChange={e => handleFieldChange('imagingSummary', e.target.value)}
                  placeholder="CXR, CT Brain/Chest, POCUS ultrasound findings..."
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-slate-300 font-semibold block">Consultations & Multi-Disciplinary Recommendations</label>
                <textarea
                  rows={2}
                  value={data.consultations}
                  onChange={e => handleFieldChange('consultations', e.target.value)}
                  placeholder="Cardiology, Nephrology, ID, Surgery notes..."
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-2">
                <label className="text-amber-300 font-bold block uppercase tracking-wider text-[11px]">
                  Discharge / Step-down Transfer Plan
                </label>
                <textarea
                  rows={2}
                  value={data.dischargeTransferPlan}
                  onChange={e => handleFieldChange('dischargeTransferPlan', e.target.value)}
                  placeholder="e.g. Plan for step-down cardiology ward transfer once off tele / weaned..."
                  className="w-full p-2 rounded bg-slate-900 border border-amber-800/80 text-white font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono">Last modified: {data.lastUpdated}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close Patient File
          </button>
        </div>
      </div>
    </div>
  );
};
