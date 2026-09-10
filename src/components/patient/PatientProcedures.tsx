import React, { useState } from 'react';
import { PatientRecord, ProcedureRecord } from '../../types';
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  Check,
  X
} from 'lucide-react';

interface PatientProceduresProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const COMMON_PROCEDURES = [
  'Coronary Angiography (CAG) / PCI',
  'Central Venous Line (CVC) Insertion',
  'Arterial Line Insertion',
  'Endotracheal Intubation (RSI)',
  'Temporary Pacemaker (TPM) Insertion',
  'Pericardiocentesis',
  'Chest Tube / Pigtail Catheter Insertion',
  'DC Cardioversion / Defibrillation',
  'Dialysis Catheter (Mahurkar/Permacath)',
  'Transesophageal Echocardiography (TEE)',
  'Lumbar Puncture / Paracentesis',
  'Other Invasive Procedure',
];

export const PatientProcedures: React.FC<PatientProceduresProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const procedures = patient.procedures || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    timestamp: string;
    procedureName: string;
    operator: string;
    indication: string;
    site: string;
    details: string;
    complications: string;
    postProcedurePlan: string;
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    procedureName: 'Coronary Angiography (CAG) / PCI',
    operator: '',
    indication: '',
    site: 'Right Radial Artery',
    details: '',
    complications: 'None',
    postProcedurePlan: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.procedureName.trim()) {
      alert('Please enter procedure name.');
      return;
    }

    const item: ProcedureRecord = {
      id: editingId || `proc-${Date.now()}`,
      timestamp: formState.timestamp,
      procedureName: formState.procedureName,
      operator: formState.operator,
      indication: formState.indication,
      site: formState.site,
      details: formState.details,
      complications: formState.complications || 'None',
      postProcedurePlan: formState.postProcedurePlan,
    };

    let updatedList: ProcedureRecord[];
    if (editingId) {
      updatedList = procedures.map((p) => (p.id === editingId ? item : p));
    } else {
      updatedList = [item, ...procedures];
    }

    onUpdatePatient({
      ...patient,
      procedures: updatedList,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this procedure record?')) {
      const updated = procedures.filter((p) => p.id !== id);
      onUpdatePatient({
        ...patient,
        procedures: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (proc: ProcedureRecord) => {
    setEditingId(proc.id);
    setFormState({
      timestamp: proc.timestamp,
      procedureName: proc.procedureName,
      operator: proc.operator || '',
      indication: proc.indication || '',
      site: proc.site || '',
      details: proc.details || '',
      complications: proc.complications || 'None',
      postProcedurePlan: proc.postProcedurePlan || '',
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="text-emerald-500" size={18} />
            <span>Procedures & Critical Interventions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cardiac catheterization, lines, pacemakers, intubation, pericardiocentesis and procedural safety checks
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              procedureName: 'Coronary Angiography (CAG) / PCI',
              operator: '',
              indication: '',
              site: 'Right Radial Artery',
              details: '',
              complications: 'None',
              postProcedurePlan: '',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Procedure</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>{editingId ? 'Edit Procedure Note' : 'Record Invasive Procedure'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Procedure Name *
              </label>
              <select
                value={formState.procedureName}
                onChange={(e) => setFormState({ ...formState, procedureName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                {COMMON_PROCEDURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Date & Time
              </label>
              <input
                type="text"
                value={formState.timestamp}
                onChange={(e) => setFormState({ ...formState, timestamp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Operator / Physician
              </label>
              <input
                type="text"
                value={formState.operator}
                onChange={(e) => setFormState({ ...formState, operator: e.target.value })}
                placeholder="e.g. Dr. Khalid / Resident"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Access Site
              </label>
              <input
                type="text"
                value={formState.site}
                onChange={(e) => setFormState({ ...formState, site: e.target.value })}
                placeholder="e.g. Right radial, Right Internal Jugular"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Clinical Indication
              </label>
              <input
                type="text"
                value={formState.indication}
                onChange={(e) => setFormState({ ...formState, indication: e.target.value })}
                placeholder="e.g. Acute STEMI, Inotropic support requirements, Respiratory failure"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Procedure Details & Findings
              </label>
              <textarea
                rows={3}
                value={formState.details}
                onChange={(e) => setFormState({ ...formState, details: e.target.value })}
                placeholder="Stent dimensions, balloon dilation, vessel TIMI flow, depth of line, ultrasound guidance, etc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Complications
              </label>
              <input
                type="text"
                value={formState.complications}
                onChange={(e) => setFormState({ ...formState, complications: e.target.value })}
                placeholder="None, hematoma, etc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Post-Procedure Care Plan
              </label>
              <input
                type="text"
                value={formState.postProcedurePlan}
                onChange={(e) => setFormState({ ...formState, postProcedurePlan: e.target.value })}
                placeholder="e.g. TR Band deflation protocol, post-CXR for line position confirmation"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              {editingId ? 'Update Procedure' : 'Save Procedure'}
            </button>
          </div>
        </form>
      )}

      {/* Procedures List */}
      {procedures.length > 0 ? (
        <div className="space-y-3">
          {procedures.map((proc) => (
            <div
              key={proc.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {proc.procedureName}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {proc.timestamp} {proc.operator ? `• By: ${proc.operator}` : ''} {proc.site ? `• Site: ${proc.site}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(proc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(proc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {proc.indication && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Indication:</strong> {proc.indication}
                </p>
              )}

              {proc.details && (
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl whitespace-pre-wrap">
                  {proc.details}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Complications:{' '}
                  <strong
                    className={
                      proc.complications && proc.complications.toLowerCase() !== 'none'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {proc.complications || 'None'}
                  </strong>
                </span>

                {proc.postProcedurePlan && (
                  <span className="text-slate-500 dark:text-slate-400">
                    Plan: <strong className="text-slate-700 dark:text-slate-300">{proc.postProcedurePlan}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Wrench size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Procedures Recorded
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Document cardiac catheterization, stent placements, central venous lines, endotracheal intubation, or pacing wires.
          </p>
        </div>
      )}
    </div>
  );
};
