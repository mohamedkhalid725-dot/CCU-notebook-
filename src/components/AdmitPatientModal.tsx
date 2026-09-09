import React, { useState } from 'react';
import { PatientRecord, BedStatus, SpecialtyMode } from '../types';
import { UserPlus, X, HeartPulse, Activity, Check } from 'lucide-react';

interface AdmitPatientModalProps {
  bedNumber: number;
  specialtyMode: SpecialtyMode;
  onAdmit: (newPatient: PatientRecord) => void;
  onClose: () => void;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({
  bedNumber,
  specialtyMode,
  onAdmit,
  onClose
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [mrn, setMrn] = useState(`MRN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [bedNum, setBedNum] = useState<number>(bedNumber);
  const [status, setStatus] = useState<BedStatus>(specialtyMode === 'ccu' ? 'stable' : 'critical');
  const [codeStatus, setCodeStatus] = useState('Full Code');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Consultant');

  // Quick Diagnosis Suggesters
  const diagnosisSuggestions = specialtyMode === 'ccu'
    ? ['STEMI (Anterior)', 'NSTEMI', 'Unstable Angina', 'Acute Decompensated Heart Failure', 'Complete Heart Block', 'Ventricular Tachycardia']
    : ['Septic Shock', 'Acute Respiratory Distress Syndrome (ARDS)', 'Diabetic Ketoacidosis (DKA)', 'Acute Hypoxic Respiratory Failure', 'Traumatic Brain Injury', 'Status Epilepticus'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryDiagnosis.trim()) return;

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedAdmit = `${now.toISOString().slice(0, 10)} ${timeStr}`;

    const newRecord: PatientRecord = {
      id: `pt-${Date.now()}`,
      bedNumber: bedNum,
      name: name.trim(),
      age,
      gender,
      mrn,
      admissionDate: formattedAdmit,
      status,
      codeStatus,
      primaryDiagnosis: primaryDiagnosis.trim(),
      secondaryDiagnoses: [],
      chiefComplaint: chiefComplaint.trim() || 'Acute admission to intensive care',
      historyOfPresentIllness: '',
      pastMedicalHistory: '',
      examinationSummary: 'Conscious, airway patent, bilateral breath sounds vesicular, hemodynamically monitored.',
      attendingPhysician,
      vitals: [
        {
          timestamp: `${mm}/${dd} ${timeStr}`,
          hr: 80,
          bpSystolic: 120,
          bpDiastolic: 80,
          map: 93,
          rr: 16,
          spo2: 98,
          temp: 37.0,
          rhythm: 'Sinus'
        }
      ],
      ioRecords: [],
      labs: [],
      abgRecords: [],
      ccuData: {
        ecgSummary: specialtyMode === 'ccu' ? 'Sinus rhythm, monitoring active' : '',
        echoEF: '55%',
        echoFindings: 'Good LV systolic function',
        antiplatelets: specialtyMode === 'ccu' ? 'Aspirin 81mg + Clopidogrel 75mg' : '',
        anticoagulation: 'Enoxaparin 40mg SC daily (prophylaxis)'
      },
      icuVentilator: {
        mode: status === 'critical' ? 'PRVC' : 'Room Air / NC',
        fio2: '40%',
        peep: '5',
        tv: '420',
        rate: '14'
      },
      icuScores: {
        gcsTotal: 15,
        gcsEye: 4,
        gcsVerbal: 5,
        gcsMotor: 6,
        rass: 0,
        sofaScore: status === 'critical' ? 4 : 1
      },
      medications: [],
      infusions: [],
      procedures: [],
      progressNotes: [
        {
          id: `note-${Date.now()}`,
          timestamp: `${mm}/${dd} — ${timeStr}`,
          author: attendingPhysician,
          tag: 'Round',
          subjective: 'Initial admission assessment.',
          objective: 'Vitals stable on arrival to bed. Hemodynamics monitored.',
          assessment: `Admission for ${primaryDiagnosis.trim()}.`,
          plan: '1. Complete bedside monitoring\n2. Routine admission labs\n3. Continue targeted medical management'
        }
      ],
      imagingSummary: '',
      consultations: '',
      dischargeTransferPlan: 'Pending clinical stabilization and observation',
      lastUpdated: `${now.toISOString().slice(0, 10)} ${timeStr}`
    };

    onAdmit(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Admit Patient to Bed {bedNum}
              </h3>
              <p className="text-xs text-slate-400">Initialize a new confidential clinical chart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Patient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed, Mohamed"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Bed Number</label>
              <input
                type="number"
                required
                value={bedNum}
                onChange={e => setBedNum(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BedStatus)}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
              >
                <option value="stable">Stable</option>
                <option value="critical">Critical</option>
                <option value="deteriorating">Deteriorating</option>
                <option value="guarded">Guarded</option>
                <option value="post-op">Post-Op</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-cyan-300 font-bold block mb-1 uppercase tracking-wider text-[11px]">
              Primary Diagnosis *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. STEMI, DKA, Septic Shock"
              value={primaryDiagnosis}
              onChange={e => setPrimaryDiagnosis(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-cyan-800/60 text-white font-bold outline-none focus:border-cyan-500"
            />
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {diagnosisSuggestions.map((diag) => (
                <button
                  key={diag}
                  type="button"
                  onClick={() => setPrimaryDiagnosis(diag)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                >
                  {diag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Chief Complaint / Presentation</label>
            <textarea
              rows={2}
              placeholder="e.g. Severe crushing retrosternal chest pain radiating to left arm..."
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Attending Physician</label>
              <input
                type="text"
                value={attendingPhysician}
                onChange={e => setAttendingPhysician(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Resuscitation (Code Status)</label>
              <select
                value={codeStatus}
                onChange={e => setCodeStatus(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Full Code">Full Code</option>
                <option value="DNR">DNR</option>
                <option value="DNI">DNI</option>
                <option value="Modified">Modified</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Admit to Bed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
