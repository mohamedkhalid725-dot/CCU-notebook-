import React, { useState } from 'react';
import { PatientRecord } from '../../types';
import {
  Stethoscope,
  Heart,
  Wind,
  Shield,
  Brain,
  Compass,
  Edit2,
  Check,
  X,
  Save,
  PlusCircle
} from 'lucide-react';

interface PatientExaminationProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientExamination: React.FC<PatientExaminationProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [examData, setExamData] = useState({
    examinationSummary: patient.examinationSummary || '',
    generalExamination: patient.generalExamination || '',
    cardiovascularExamination: patient.cardiovascularExamination || '',
    respiratoryExamination: patient.respiratoryExamination || '',
    abdominalExamination: patient.abdominalExamination || '',
    cnsExamination: patient.cnsExamination || '',
    peripheralVascularExamination: patient.peripheralVascularExamination || '',
    otherExamination: patient.otherExamination || '',
  });

  const handleSave = () => {
    const updated: PatientRecord = {
      ...patient,
      examinationSummary: examData.examinationSummary.trim(),
      generalExamination: examData.generalExamination.trim(),
      cardiovascularExamination: examData.cardiovascularExamination.trim(),
      respiratoryExamination: examData.respiratoryExamination.trim(),
      abdominalExamination: examData.abdominalExamination.trim(),
      cnsExamination: examData.cnsExamination.trim(),
      peripheralVascularExamination: examData.peripheralVascularExamination.trim(),
      otherExamination: examData.otherExamination.trim(),
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setIsEditing(false);
  };

  const handleClear = (field: keyof typeof examData) => {
    if (confirm(`Clear this examination section?`)) {
      setExamData({ ...examData, [field]: '' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="text-emerald-500" size={18} />
            <span>Systematic Physical Examination</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bedside systems evaluation, cardiovascular signs, chest auscultation, and neurological status
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Edit2 size={13} />
              <span>Edit Examination</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <Save size={13} />
                <span>Save Findings</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Examination Summary / Bedside Glance */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Stethoscope size={14} className="text-emerald-500" />
            <span>Overall Examination Summary / Clinical Impression</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() => handleClear('examinationSummary')}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            rows={3}
            value={examData.examinationSummary}
            onChange={(e) => setExamData({ ...examData, examinationSummary: e.target.value })}
            placeholder="High-level bedside impression, acute stability, distress status..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {patient.examinationSummary || <span className="text-slate-400 italic">No summary entered</span>}
          </p>
        )}
      </div>

      {/* Structured Systems Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Appearance & Vitals */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield size={14} className="text-teal-500" />
              <span>General Examination</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('generalExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.generalExamination}
              onChange={(e) => setExamData({ ...examData, generalExamination: e.target.value })}
              placeholder="Consciousness, distress, pallor, jaundice, cyanosis, peripheral edema (+ to ++++), hydration status..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.generalExamination || (
                <span className="text-slate-400 italic">Alert, no acute respiratory distress, warm extremities</span>
              )}
            </p>
          )}
        </div>

        {/* Cardiovascular Examination (CVS) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" />
              <span>Cardiovascular (CVS)</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('cardiovascularExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.cardiovascularExamination}
              onChange={(e) => setExamData({ ...examData, cardiovascularExamination: e.target.value })}
              placeholder="Heart sounds (S1+S2), murmurs, S3/S4 gallop, pericardial rub, JVP elevation (cm H2O), apex beat location..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.cardiovascularExamination || (
                <span className="text-slate-400 italic">S1, S2 audible, no murmurs, JVP normal</span>
              )}
            </p>
          )}
        </div>

        {/* Respiratory Examination (Chest) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wind size={14} className="text-blue-500" />
              <span>Respiratory / Chest (RS)</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('respiratoryExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.respiratoryExamination}
              onChange={(e) => setExamData({ ...examData, respiratoryExamination: e.target.value })}
              placeholder="Air entry, bilateral vesicular breath sounds, crackles / crepitations (basal vs diffuse), wheezes, rhonchi..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.respiratoryExamination || (
                <span className="text-slate-400 italic">Bilateral equal air entry, clear chest</span>
              )}
            </p>
          )}
        </div>

        {/* Abdominal Examination (GIT) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield size={14} className="text-amber-500" />
              <span>Abdominal / Gastrointestinal</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('abdominalExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.abdominalExamination}
              onChange={(e) => setExamData({ ...examData, abdominalExamination: e.target.value })}
              placeholder="Soft, lax, non-tender, guarding, rigidity, hepatomegaly, splenomegaly, ascites, bowel sounds present..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.abdominalExamination || (
                <span className="text-slate-400 italic">Abdomen soft, lax, non-tender, active bowel sounds</span>
              )}
            </p>
          )}
        </div>

        {/* Central Nervous System (CNS) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Brain size={14} className="text-purple-500" />
              <span>Neurological (CNS & GCS)</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('cnsExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.cnsExamination}
              onChange={(e) => setExamData({ ...examData, cnsExamination: e.target.value })}
              placeholder="GCS score (E_V_M_), orientation, pupils equal & reactive to light (PERRL), motor power 5/5, reflexes, plantars..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.cnsExamination || (
                <span className="text-slate-400 italic">GCS 15/15, oriented, pupils 3mm equal and reactive to light</span>
              )}
            </p>
          )}
        </div>

        {/* Peripheral Vascular Examination (PVS) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass size={14} className="text-emerald-500" />
              <span>Peripheral Vascular (PVS)</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClear('peripheralVascularExamination')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={examData.peripheralVascularExamination}
              onChange={(e) => setExamData({ ...examData, peripheralVascularExamination: e.target.value })}
              placeholder="Radial, femoral, popliteal, posterior tibial, dorsalis pedis pulses; capillary refill time (<2s); femoral/radial sheath site..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {patient.peripheralVascularExamination || (
                <span className="text-slate-400 italic">Peripheral pulses palpable bilaterally, CRT &lt; 2 sec, sheath site soft</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Other Examination Findings (Drains, Wounds, Access Lines) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Shield size={14} className="text-slate-500" />
            <span>Lines, Tubes, Drains & Surgical Sites</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() => handleClear('otherExamination')}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            rows={2}
            value={examData.otherExamination}
            onChange={(e) => setExamData({ ...examData, otherExamination: e.target.value })}
            placeholder="Central venous catheter site, arterial line, Foley catheter, chest tube drainage, wound dressings..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {patient.otherExamination || (
              <span className="text-slate-400 italic">No abnormal drains or invasive site erythema noted</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
