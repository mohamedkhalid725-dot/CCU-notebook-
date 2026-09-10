import React, { useState } from 'react';
import { PatientRecord } from '../../types';
import {
  FileText,
  AlertTriangle,
  Pill,
  Scissors,
  Activity,
  Users,
  Cigarette,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

interface PatientHistoryProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [historyData, setHistoryData] = useState({
    chiefComplaint: patient.chiefComplaint || '',
    historyOfPresentIllness: patient.historyOfPresentIllness || '',
    pastMedicalHistory: patient.pastMedicalHistory || '',
    pastSurgicalHistory: patient.pastSurgicalHistory || '',
    drugHistory: patient.drugHistory || '',
    allergies: patient.allergies || 'No known drug allergies (NKDA)',
    familyHistory: patient.familyHistory || '',
    socialHistory: patient.socialHistory || '',
  });

  const handleSave = () => {
    const updated: PatientRecord = {
      ...patient,
      chiefComplaint: historyData.chiefComplaint.trim(),
      historyOfPresentIllness: historyData.historyOfPresentIllness.trim(),
      pastMedicalHistory: historyData.pastMedicalHistory.trim(),
      pastSurgicalHistory: historyData.pastSurgicalHistory.trim(),
      drugHistory: historyData.drugHistory.trim(),
      allergies: historyData.allergies.trim(),
      familyHistory: historyData.familyHistory.trim(),
      socialHistory: historyData.socialHistory.trim(),
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setIsEditing(false);
  };

  const handleClearField = (field: keyof typeof historyData) => {
    if (confirm(`Clear this ${String(field)} field?`)) {
      setHistoryData({ ...historyData, [field]: '' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-emerald-500" size={18} />
            <span>Comprehensive Clinical History</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured admission intake, chronological illness record, and background risk factors
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Edit2 size={13} />
              <span>Edit History</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <Save size={13} />
                <span>Save History</span>
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

      {/* Structured Sections */}
      <div className="grid grid-cols-1 gap-4">
        {/* Chief Complaint */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-500" />
              <span>Chief Complaint</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClearField('chiefComplaint')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={historyData.chiefComplaint}
              onChange={(e) => setHistoryData({ ...historyData, chiefComplaint: e.target.value })}
              placeholder="e.g. Crushing retrosternal chest pain radiating to left arm for 2 hours"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
            />
          ) : (
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
              {patient.chiefComplaint || <span className="text-slate-400 italic">No chief complaint recorded</span>}
            </p>
          )}
        </div>

        {/* History of Present Illness (HPI) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText size={14} className="text-teal-500" />
              <span>History of Present Illness (HPI)</span>
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleClearField('historyOfPresentIllness')}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={4}
              value={historyData.historyOfPresentIllness}
              onChange={(e) => setHistoryData({ ...historyData, historyOfPresentIllness: e.target.value })}
              placeholder="Detailed onset, location, duration, character, aggravating/relieving factors, radiation, associated symptoms..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {patient.historyOfPresentIllness || <span className="text-slate-400 italic">No HPI recorded</span>}
            </p>
          )}
        </div>

        {/* 2-Column Grid: Past Medical & Past Surgical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Past Medical History */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity size={14} className="text-blue-500" />
                <span>Past Medical History (PMHx)</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('pastMedicalHistory')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={historyData.pastMedicalHistory}
                onChange={(e) => setHistoryData({ ...historyData, pastMedicalHistory: e.target.value })}
                placeholder="HTN, DM, IHD, CKD, COPD, Stroke, etc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.pastMedicalHistory || <span className="text-slate-400 italic">None recorded</span>}
              </p>
            )}
          </div>

          {/* Past Surgical History */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scissors size={14} className="text-amber-500" />
                <span>Past Surgical History (PSHx)</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('pastSurgicalHistory')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={historyData.pastSurgicalHistory}
                onChange={(e) => setHistoryData({ ...historyData, pastSurgicalHistory: e.target.value })}
                placeholder="Prior CABG, PCI/stents, valve replacements, cholecystectomy, pacemaker, etc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.pastSurgicalHistory || <span className="text-slate-400 italic">None recorded</span>}
              </p>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Drug History & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drug History */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Pill size={14} className="text-purple-500" />
                <span>Pre-Admission Drug History</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('drugHistory')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={historyData.drugHistory}
                onChange={(e) => setHistoryData({ ...historyData, drugHistory: e.target.value })}
                placeholder="Home medications: Aspirin, Clopidogrel, Statins, ACEi, Beta-blockers, Insulin..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.drugHistory || <span className="text-slate-400 italic">None recorded</span>}
              </p>
            )}
          </div>

          {/* Allergies */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 bg-rose-50/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Allergies & Adverse Reactions</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('allergies')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={historyData.allergies}
                onChange={(e) => setHistoryData({ ...historyData, allergies: e.target.value })}
                placeholder="e.g. Penicillin (Anaphylaxis), Contrast media (Bronchospasm), Morphine..."
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 text-xs text-rose-700 dark:text-rose-300 font-semibold"
              />
            ) : (
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold whitespace-pre-wrap leading-relaxed">
                {patient.allergies || 'No known drug allergies (NKDA)'}
              </p>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Family History & Social History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Family History */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-500" />
                <span>Family History</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('familyHistory')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={historyData.familyHistory}
                onChange={(e) => setHistoryData({ ...historyData, familyHistory: e.target.value })}
                placeholder="Premature CAD, sudden cardiac death, cardiomyopathy, familial hypercholesterolemia..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.familyHistory || <span className="text-slate-400 italic">None recorded</span>}
              </p>
            )}
          </div>

          {/* Social History */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cigarette size={14} className="text-amber-600" />
                <span>Social History & Lifestyle</span>
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleClearField('socialHistory')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={historyData.socialHistory}
                onChange={(e) => setHistoryData({ ...historyData, socialHistory: e.target.value })}
                placeholder="Tobacco use (pack-years), alcohol intake, occupation, living support..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {patient.socialHistory || <span className="text-slate-400 italic">None recorded</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
