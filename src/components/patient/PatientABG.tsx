import React, { useState } from 'react';
import { PatientRecord, ABGEntry } from '../../types';
import {
  Wind,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertTriangle,
  Check,
  X,
  Activity,
  Calculator
} from 'lucide-react';

interface PatientABGProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientABG: React.FC<PatientABGProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const abgRecords = patient.abgRecords || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ph: '7.40',
    pco2: '40',
    po2: '95',
    hco3: '24',
    be: '0',
    lactate: '1.2',
    spo2: '98',
    fio2: '21',
    ventMode: 'Room Air',
  });

  const calculatePF = (po2Str: string | number, fio2Str: string | number) => {
    const p = parseFloat(String(po2Str));
    const f = parseFloat(String(fio2Str));
    if (isNaN(p) || isNaN(f) || f <= 0) return null;
    const fio2Dec = f > 1 ? f / 100 : f;
    return Math.round(p / fio2Dec);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: ABGEntry = {
      timestamp: formState.timestamp,
      ph: formState.ph,
      pco2: formState.pco2,
      po2: formState.po2,
      hco3: formState.hco3,
      be: formState.be,
      lactate: formState.lactate,
      spo2: formState.spo2,
      fio2: formState.fio2,
      ventMode: formState.ventMode,
    };

    let updatedRecords: ABGEntry[];
    if (editingId) {
      updatedRecords = abgRecords.map((r, i) => (i === parseInt(editingId) ? entry : r));
    } else {
      updatedRecords = [entry, ...abgRecords];
    }

    onUpdatePatient({
      ...patient,
      abgRecords: updatedRecords,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (index: number) => {
    if (confirm('Delete this ABG entry?')) {
      const updated = abgRecords.filter((_, i) => i !== index);
      onUpdatePatient({
        ...patient,
        abgRecords: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (entry: ABGEntry, index: number) => {
    setEditingId(index.toString());
    setFormState({
      timestamp: entry.timestamp,
      ph: String(entry.ph),
      pco2: String(entry.pco2),
      po2: String(entry.po2),
      hco3: String(entry.hco3),
      be: String(entry.be || '0'),
      lactate: String(entry.lactate || '1.0'),
      spo2: String(entry.spo2 || '98'),
      fio2: String(entry.fio2 || '21'),
      ventMode: entry.ventMode || 'Room Air',
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wind className="text-emerald-500" size={18} />
            <span>Arterial Blood Gas (ABG) & Oxygenation Trends</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Serial acid-base balance, PaO2/FiO2 ratio calculations, ventilatory exchange & lactate clearance
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              ph: '7.40',
              pco2: '40',
              po2: '90',
              hco3: '24',
              be: '0',
              lactate: '1.2',
              spo2: '98',
              fio2: '21',
              ventMode: 'Room Air',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add ABG Sample</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveEntry}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>{editingId ? 'Edit ABG Record' : 'Record New Arterial Blood Gas (ABG)'}</span>
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

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Sample Date / Time
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
                pH (7.35-7.45)
              </label>
              <input
                type="text"
                value={formState.ph}
                onChange={(e) => setFormState({ ...formState, ph: e.target.value })}
                placeholder="7.40"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                PaCO2 (mmHg)
              </label>
              <input
                type="text"
                value={formState.pco2}
                onChange={(e) => setFormState({ ...formState, pco2: e.target.value })}
                placeholder="35-45"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                PaO2 (mmHg)
              </label>
              <input
                type="text"
                value={formState.po2}
                onChange={(e) => setFormState({ ...formState, po2: e.target.value })}
                placeholder="80-100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                HCO3 (mmol/L)
              </label>
              <input
                type="text"
                value={formState.hco3}
                onChange={(e) => setFormState({ ...formState, hco3: e.target.value })}
                placeholder="22-26"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Base Excess (BE)
              </label>
              <input
                type="text"
                value={formState.be}
                onChange={(e) => setFormState({ ...formState, be: e.target.value })}
                placeholder="-2 to +2"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Lactate (mmol/L)
              </label>
              <input
                type="text"
                value={formState.lactate}
                onChange={(e) => setFormState({ ...formState, lactate: e.target.value })}
                placeholder="< 2.0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-rose-600 dark:text-rose-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                FiO2 (%)
              </label>
              <input
                type="text"
                value={formState.fio2}
                onChange={(e) => setFormState({ ...formState, fio2: e.target.value })}
                placeholder="21 - 100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Vent Support / Mode
              </label>
              <input
                type="text"
                value={formState.ventMode}
                onChange={(e) => setFormState({ ...formState, ventMode: e.target.value })}
                placeholder="e.g. Room Air, Nasal 4L, SIMV"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calculator size={14} className="text-emerald-500" />
              <span>
                Calculated P/F Ratio:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {calculatePF(formState.po2, formState.fio2) ?? '—'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
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
                {editingId ? 'Update ABG' : 'Save ABG'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABG Records Table */}
      {abgRecords.length > 0 ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2.5 font-medium">Time / Support</th>
                <th className="pb-2.5 font-medium">pH</th>
                <th className="pb-2.5 font-medium">PaCO2</th>
                <th className="pb-2.5 font-medium">PaO2</th>
                <th className="pb-2.5 font-medium">HCO3</th>
                <th className="pb-2.5 font-medium">BE</th>
                <th className="pb-2.5 font-medium">Lactate</th>
                <th className="pb-2.5 font-medium">FiO2</th>
                <th className="pb-2.5 font-medium">P/F Ratio</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {abgRecords.map((entry, idx) => {
                const pf = calculatePF(entry.po2, entry.fio2);
                const phNum = parseFloat(String(entry.ph));
                const lacNum = parseFloat(String(entry.lactate));

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-2.5">
                      <p className="font-bold text-slate-900 dark:text-white">{entry.timestamp}</p>
                      <p className="text-[10px] text-slate-400">{entry.ventMode || 'Room Air'}</p>
                    </td>
                    <td className="py-2.5 font-bold">
                      <span
                        className={
                          phNum < 7.35
                            ? 'text-rose-600 dark:text-rose-400'
                            : phNum > 7.45
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {entry.ph}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {entry.pco2}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {entry.po2}
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{entry.hco3}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{entry.be || '0'}</td>
                    <td className="py-2.5 font-bold">
                      <span
                        className={
                          lacNum >= 4.0
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold animate-pulse'
                            : lacNum > 2.0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {entry.lactate}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{entry.fio2}%</td>
                    <td className="py-2.5 font-bold">
                      {pf ? (
                        <span
                          className={
                            pf < 200
                              ? 'text-rose-600 dark:text-rose-400'
                              : pf < 300
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {pf}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(entry, idx)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
            <Wind size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No ABG Entries Recorded
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add serial arterial blood gases to track acid-base disorders, PaO2/FiO2 ratio, and lactate clearance over time.
          </p>
        </div>
      )}
    </div>
  );
};
