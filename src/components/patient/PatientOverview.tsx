import React, { useState } from 'react';
import { PatientRecord, BedStatus } from '../../types';
import {
  User,
  HeartPulse,
  AlertCircle,
  Calendar,
  Bed,
  Shield,
  Edit2,
  Check,
  X,
  Stethoscope,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface PatientOverviewProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientOverview: React.FC<PatientOverviewProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    mrn: patient.mrn,
    bedNumber: patient.bedNumber,
    admissionDate: patient.admissionDate,
    status: patient.status,
    primaryDiagnosis: patient.primaryDiagnosis,
    secondaryDiagnoses: patient.secondaryDiagnoses?.join(', ') || '',
    attendingPhysician: patient.attendingPhysician || '',
    codeStatus: patient.codeStatus || 'Full Code',
    allergies: patient.allergies || 'No known drug allergies (NKDA)',
  });

  const handleSave = () => {
    const updated: PatientRecord = {
      ...patient,
      name: formData.name.trim(),
      age: formData.age,
      gender: formData.gender as any,
      mrn: formData.mrn.trim(),
      bedNumber: formData.bedNumber,
      admissionDate: formData.admissionDate,
      status: formData.status as BedStatus,
      primaryDiagnosis: formData.primaryDiagnosis.trim(),
      secondaryDiagnoses: formData.secondaryDiagnoses
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      attendingPhysician: formData.attendingPhysician.trim(),
      codeStatus: formData.codeStatus.trim(),
      allergies: formData.allergies.trim(),
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setIsEditing(false);
  };

  const statusColors: Record<BedStatus, { bg: string; text: string; border: string }> = {
    stable: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    critical: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    deteriorating: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    guarded: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    'post-op': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    discharged: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700' },
    empty: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700' },
  };

  const currentStatusStyle = statusColors[patient.status] || statusColors.stable;

  return (
    <div className="space-y-5">
      {/* Top Banner Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 border border-emerald-500/20">
              <User size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                  {patient.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Bed {patient.bedNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>MRN: <strong className="text-slate-700 dark:text-slate-200">{patient.mrn}</strong></span>
                <span>•</span>
                <span>{patient.age} years, {patient.gender}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Admitted: {patient.admissionDate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Edit2 size={13} />
                <span>Edit Info</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Check size={14} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Critical Allergies Banner */}
        <div className="mt-4 p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0" size={16} />
            <span className="font-bold text-rose-800 dark:text-rose-300">Allergies:</span>
            <span className="text-rose-900 dark:text-rose-200 font-medium">
              {patient.allergies || 'No known drug allergies (NKDA)'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200">
            Alert
          </span>
        </div>
      </div>

      {/* Edit Form or Read Mode */}
      {isEditing ? (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Edit Patient Demographics & Admission
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Sex / Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">MRN / Record ID</label>
              <input
                type="text"
                value={formData.mrn}
                onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Assigned Bed</label>
              <input
                type="text"
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Clinical Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BedStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="stable">Stable</option>
                <option value="guarded">Guarded</option>
                <option value="critical">Critical</option>
                <option value="deteriorating">Deteriorating</option>
                <option value="post-op">Post-Op</option>
                <option value="discharged">Discharged</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Attending / Consultant</label>
              <input
                type="text"
                value={formData.attendingPhysician}
                onChange={(e) => setFormData({ ...formData, attendingPhysician: e.target.value })}
                placeholder="e.g. Dr. Tarek CCU"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Code Status</label>
              <select
                value={formData.codeStatus}
                onChange={(e) => setFormData({ ...formData, codeStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Full Code">Full Code</option>
                <option value="DNR (Do Not Resuscitate)">DNR (Do Not Resuscitate)</option>
                <option value="DNI (Do Not Intubate)">DNI (Do Not Intubate)</option>
                <option value="Modified / Guarded">Modified</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Admission Date / Time</label>
              <input
                type="text"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Primary Diagnosis</label>
              <input
                type="text"
                value={formData.primaryDiagnosis}
                onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                Secondary Diagnoses (comma separated)
              </label>
              <input
                type="text"
                value={formData.secondaryDiagnoses}
                onChange={(e) => setFormData({ ...formData, secondaryDiagnoses: e.target.value })}
                placeholder="e.g. HTN, Type 2 DM, CKD Stage 3"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Allergies</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Penicillin (Anaphylaxis), Contrast dye"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-rose-600 dark:text-rose-400 font-medium"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clinical Diagnoses Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Stethoscope size={14} className="text-emerald-500" />
              <span>Diagnoses & Clinical Problem List</span>
            </h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Primary Admission Diagnosis:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {patient.primaryDiagnosis || 'No primary diagnosis entered'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Secondary Diagnoses / Comorbidities:</span>
                {patient.secondaryDiagnoses && patient.secondaryDiagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {patient.secondaryDiagnoses.map((diag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-0.5">None listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Team & Disposition Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Shield size={14} className="text-teal-500" />
              <span>Care Team & Directives</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Attending Physician</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {patient.attendingPhysician || 'Unspecified'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Code Status</span>
                <span className={`font-bold block mt-0.5 ${patient.codeStatus?.includes('DNR') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {patient.codeStatus || 'Full Code'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Active Bed</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Bed {patient.bedNumber}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Last Updated</span>
                <span className="font-medium text-slate-600 dark:text-slate-400 block mt-0.5 text-[10px]">
                  {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleDateString() : 'Initial sync'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
