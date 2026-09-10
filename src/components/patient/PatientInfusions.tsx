import React, { useState } from 'react';
import { PatientRecord, InfusionDrug } from '../../types';
import {
  Syringe,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Target,
  Check,
  X,
  Zap,
  Activity
} from 'lucide-react';

interface PatientInfusionsProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const COMMON_VASOACTIVE_DRUGS: Array<{
  name: string;
  defaultUnit: string;
  defaultDilution: string;
  defaultTarget: string;
}> = [
  {
    name: 'Norepinephrine (Noradrenaline)',
    defaultUnit: 'mcg/min',
    defaultDilution: '4 mg in 50 mL D5W',
    defaultTarget: 'MAP ≥ 65 mmHg',
  },
  {
    name: 'Epinephrine (Adrenaline)',
    defaultUnit: 'mcg/min',
    defaultDilution: '4 mg in 50 mL D5W',
    defaultTarget: 'MAP ≥ 65 mmHg & inotropy',
  },
  {
    name: 'Dobutamine',
    defaultUnit: 'mcg/kg/min',
    defaultDilution: '250 mg in 50 mL D5W',
    defaultTarget: 'CI > 2.2 L/min/m² or ScvO2 > 70%',
  },
  {
    name: 'Milrinone',
    defaultUnit: 'mcg/kg/min',
    defaultDilution: '10 mg in 50 mL NS',
    defaultTarget: 'Inotropy / RV afterload reduction',
  },
  {
    name: 'Vasopressin',
    defaultUnit: 'units/min',
    defaultDilution: '20 units in 100 mL NS',
    defaultTarget: 'Refractory vasodilatory shock',
  },
  {
    name: 'Nitroglycerin (NTG)',
    defaultUnit: 'mcg/min',
    defaultDilution: '50 mg in 250 mL D5W',
    defaultTarget: 'Relieve chest pain / reduce preload',
  },
  {
    name: 'Sodium Nitroprusside (SNP)',
    defaultUnit: 'mcg/kg/min',
    defaultDilution: '50 mg in 250 mL D5W',
    defaultTarget: 'Hypertensive emergency / afterload',
  },
  {
    name: 'Amiodarone Infusion',
    defaultUnit: 'mg/min',
    defaultDilution: '900 mg in 500 mL D5W',
    defaultTarget: 'Rate/rhythm control (1 mg/min x 6h then 0.5 mg/min)',
  },
  {
    name: 'Heparin Infusion',
    defaultUnit: 'units/hr',
    defaultDilution: '25,000 units in 250 mL D5W (100 u/mL)',
    defaultTarget: 'Target aPTT 60-80s or Anti-Xa 0.3-0.7',
  },
  {
    name: 'Regular Insulin Infusion',
    defaultUnit: 'units/hr',
    defaultDilution: '100 units in 100 mL NS (1 u/mL)',
    defaultTarget: 'Blood glucose 140 - 180 mg/dL',
  },
  {
    name: 'Furosemide Continuous Infusion',
    defaultUnit: 'mg/hr',
    defaultDilution: '250 mg in 50 mL NS',
    defaultTarget: 'Urine output 1-2 mL/kg/hr',
  },
  {
    name: 'Dexmedetomidine (Precedex)',
    defaultUnit: 'mcg/kg/hr',
    defaultDilution: '200 mcg in 50 mL NS',
    defaultTarget: 'RASS -1 to 0 (Cooperative sedation)',
  },
  {
    name: 'Propofol',
    defaultUnit: 'mcg/kg/min',
    defaultDilution: '1000 mg in 100 mL (1%)',
    defaultTarget: 'RASS target sedation',
  },
  {
    name: 'Midazolam',
    defaultUnit: 'mg/hr',
    defaultDilution: '50 mg in 50 mL NS',
    defaultTarget: 'ICU sedation / seizure cessation',
  },
];

export const PatientInfusions: React.FC<PatientInfusionsProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const infusions = patient.infusions || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    rate: string;
    unit: string;
    concentration: string;
    target: string;
    startTime: string;
    notes: string;
    status: 'running' | 'titrating' | 'paused' | 'stopped';
  }>({
    name: 'Norepinephrine (Noradrenaline)',
    rate: '8',
    unit: 'mcg/min',
    concentration: '4 mg / 50 mL D5W',
    target: 'MAP ≥ 65 mmHg',
    startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    notes: '',
    status: 'running',
  });

  const handleSelectPreset = (drugName: string) => {
    const preset = COMMON_VASOACTIVE_DRUGS.find((d) => d.name === drugName);
    if (preset) {
      setFormState((prev) => ({
        ...prev,
        name: preset.name,
        unit: preset.defaultUnit,
        concentration: preset.defaultDilution,
        target: preset.defaultTarget,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        name: drugName,
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.rate.trim()) {
      alert('Please enter infusion drug name and current rate.');
      return;
    }

    const item: InfusionDrug = {
      id: editingId || `inf-${Date.now()}`,
      name: formState.name.trim(),
      rate: formState.rate.trim(),
      unit: formState.unit,
      concentration: formState.concentration,
      target: formState.target,
      startTime: formState.startTime,
      notes: formState.notes,
      status: formState.status,
    };

    let updated: InfusionDrug[];
    if (editingId) {
      updated = infusions.map((i) => (i.id === editingId ? item : i));
    } else {
      updated = [item, ...infusions];
    }

    onUpdatePatient({
      ...patient,
      infusions: updated,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Stop and remove this continuous infusion?')) {
      const updated = infusions.filter((i) => i.id !== id);
      onUpdatePatient({
        ...patient,
        infusions: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleQuickRateChange = (id: string, newRate: string) => {
    const updated = infusions.map((i) => (i.id === id ? { ...i, rate: newRate } : i));
    onUpdatePatient({
      ...patient,
      infusions: updated,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleQuickStatusChange = (id: string, newStatus: InfusionDrug['status']) => {
    const updated = infusions.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
    onUpdatePatient({
      ...patient,
      infusions: updated,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleStartEdit = (inf: InfusionDrug) => {
    setEditingId(inf.id);
    setFormState({
      name: inf.name,
      rate: inf.rate,
      unit: inf.unit,
      concentration: inf.concentration || '',
      target: inf.target || '',
      startTime: inf.startTime || '',
      notes: inf.notes || '',
      status: inf.status || 'running',
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Syringe className="text-emerald-500" size={18} />
            <span>Vasoactive & Critical Care Infusions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time inotropes, vasopressors, antiarrhythmics, heparin titrations and sedation pumps
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              name: 'Norepinephrine (Noradrenaline)',
              rate: '8',
              unit: 'mcg/min',
              concentration: '4 mg / 50 mL D5W',
              target: 'MAP ≥ 65 mmHg',
              startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              notes: '',
              status: 'running',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Infusion</span>
        </button>
      </div>

      {/* Add / Edit Drawer */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>{editingId ? 'Edit Infusion Settings' : 'Start New Continuous Infusion'}</span>
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
                Common Preset / Drug
              </label>
              <select
                value={formState.name}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {COMMON_VASOACTIVE_DRUGS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
                <option value="Custom Infusion">Custom Infusion...</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Current Rate *
              </label>
              <input
                type="text"
                value={formState.rate}
                onChange={(e) => setFormState({ ...formState, rate: e.target.value })}
                placeholder="e.g. 10 or 0.1"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Rate Unit
              </label>
              <input
                type="text"
                value={formState.unit}
                onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
                placeholder="mcg/min, mcg/kg/min, units/hr..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Concentration / Dilution
              </label>
              <input
                type="text"
                value={formState.concentration}
                onChange={(e) => setFormState({ ...formState, concentration: e.target.value })}
                placeholder="e.g. 4 mg in 50 mL D5W"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Titration Target Goal
              </label>
              <input
                type="text"
                value={formState.target}
                onChange={(e) => setFormState({ ...formState, target: e.target.value })}
                placeholder="e.g. MAP ≥ 65 mmHg, HR 60-80"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Pump Status
              </label>
              <select
                value={formState.status}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="running">Running</option>
                <option value="titrating">Titrating</option>
                <option value="paused">Paused / Hold</option>
                <option value="stopped">Stopped / Weaned</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Clinical Notes / Line Access (e.g. Central line port, peripheral)
              </label>
              <input
                type="text"
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                placeholder="e.g. Dedicated CVC medial lumen, wean by 2 mcg every 15 min"
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
              {editingId ? 'Update Pump' : 'Start Infusion'}
            </button>
          </div>
        </form>
      )}

      {/* Infusions Active Grid */}
      {infusions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {infusions.map((inf) => {
            const isStopped = inf.status === 'stopped';
            const isPaused = inf.status === 'paused';

            return (
              <div
                key={inf.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-2.5 ${
                  isStopped
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : isPaused
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-emerald-500/30 dark:border-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {inf.name}
                    </h4>
                    {inf.concentration && (
                      <p className="text-[11px] text-slate-400">{inf.concentration}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(inf)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(inf.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Rate Display & Quick Adjust */}
                <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {inf.rate}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {inf.unit}
                    </span>
                  </div>

                  <select
                    value={inf.status || 'running'}
                    onChange={(e) => handleQuickStatusChange(inf.id, e.target.value as any)}
                    className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border cursor-pointer bg-white dark:bg-slate-900"
                  >
                    <option value="running">Running</option>
                    <option value="titrating">Titrating</option>
                    <option value="paused">Hold</option>
                    <option value="stopped">Weaned</option>
                  </select>
                </div>

                {inf.target && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Target size={12} className="text-rose-500 shrink-0" />
                    <span>
                      Target: <strong>{inf.target}</strong>
                    </span>
                  </div>
                )}

                {inf.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    {inf.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Syringe size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Active Continuous Infusions
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track vasoactive drugs (Norepinephrine, Epinephrine, Dobutamine), heparin, insulin, or sedation titration targets.
          </p>
        </div>
      )}
    </div>
  );
};
