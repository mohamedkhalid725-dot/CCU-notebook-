import React, { useState } from 'react';
import { PatientRecord, Medication } from '../../types';
import {
  Pill,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PatientMedicationsProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientMedications: React.FC<PatientMedicationsProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const medications = patient.medications || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    dose: string;
    route: string;
    frequency: string;
    startDate: string;
    stopDate: string;
    status: 'active' | 'held' | 'discontinued';
    category: Medication['category'];
    notes: string;
  }>({
    name: '',
    dose: '',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: new Date().toISOString().slice(0, 10),
    stopDate: '',
    status: 'active',
    category: 'cardiac',
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      alert('Please enter medication name.');
      return;
    }

    const med: Medication = {
      id: editingId || `med-${Date.now()}`,
      name: formState.name.trim(),
      dose: formState.dose.trim(),
      route: formState.route,
      frequency: formState.frequency,
      startDate: formState.startDate,
      stopDate: formState.stopDate,
      status: formState.status,
      category: formState.category,
      notes: formState.notes,
    };

    let updatedList: Medication[];
    if (editingId) {
      updatedList = medications.map((m) => (m.id === editingId ? med : m));
    } else {
      updatedList = [med, ...medications];
    }

    onUpdatePatient({
      ...patient,
      medications: updatedList,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this medication entry?')) {
      const updated = medications.filter((m) => m.id !== id);
      onUpdatePatient({
        ...patient,
        medications: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleToggleStatus = (id: string, newStatus: 'active' | 'held' | 'discontinued') => {
    const updated = medications.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
    onUpdatePatient({
      ...patient,
      medications: updated,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleStartEdit = (med: Medication) => {
    setEditingId(med.id);
    setFormState({
      name: med.name,
      dose: med.dose,
      route: med.route,
      frequency: med.frequency,
      startDate: med.startDate || '',
      stopDate: med.stopDate || '',
      status: med.status || 'active',
      category: med.category || 'cardiac',
      notes: med.notes || '',
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="text-emerald-500" size={18} />
            <span>Medication Orders & Pharmacotherapy</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active scheduled drugs, antiplatelets, anticoagulants, antibiotics, held doses & discontinues
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              name: '',
              dose: '',
              route: 'Oral',
              frequency: 'Once daily',
              startDate: new Date().toISOString().slice(0, 10),
              stopDate: '',
              status: 'active',
              category: 'cardiac',
              notes: '',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Medication</span>
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
              <span>{editingId ? 'Edit Medication Order' : 'Add New Medication'}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Ticagrelor, Enoxaparin, Atorvastatin"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Dose
              </label>
              <input
                type="text"
                value={formState.dose}
                onChange={(e) => setFormState({ ...formState, dose: e.target.value })}
                placeholder="e.g. 90 mg, 1 g"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Route
              </label>
              <select
                value={formState.route}
                onChange={(e) => setFormState({ ...formState, route: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Oral">Oral (PO)</option>
                <option value="IV">Intravenous (IV)</option>
                <option value="SC">Subcutaneous (SC)</option>
                <option value="NG / Enteral">Enteral Tube (NG/OG)</option>
                <option value="Inhaled">Inhaled / Neb</option>
                <option value="Sublingual">Sublingual (SL)</option>
                <option value="Rectal">Rectal (PR)</option>
                <option value="Topical">Topical</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Frequency
              </label>
              <input
                type="text"
                value={formState.frequency}
                onChange={(e) => setFormState({ ...formState, frequency: e.target.value })}
                placeholder="e.g. BID, Once daily, Q8H, PRN"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Category
              </label>
              <select
                value={formState.category}
                onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="cardiac">Cardiac / CCU</option>
                <option value="antibiotic">Antibiotic</option>
                <option value="sedation">Sedation / Analgesia</option>
                <option value="gi">GI / Prophylaxis</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Start Date
              </label>
              <input
                type="text"
                value={formState.startDate}
                onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Status
              </label>
              <select
                value={formState.status}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="active">Active</option>
                <option value="held">Held (Hold)</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Clinical Notes / Indication
              </label>
              <input
                type="text"
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                placeholder="e.g. Post-PCI DAPT for 12 months, renal adjustment, with food..."
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
              {editingId ? 'Update Order' : 'Save Medication'}
            </button>
          </div>
        </form>
      )}

      {/* Medications Table */}
      {medications.length > 0 ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2.5 font-medium">Drug & Dose</th>
                <th className="pb-2.5 font-medium">Route</th>
                <th className="pb-2.5 font-medium">Frequency</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium">Started</th>
                <th className="pb-2.5 font-medium">Notes</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {medications.map((med) => {
                const status = med.status || 'active';
                return (
                  <tr
                    key={med.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition ${
                      status === 'discontinued'
                        ? 'opacity-60 line-through'
                        : status === 'held'
                        ? 'bg-amber-50/30 dark:bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {med.name} <span className="font-semibold text-slate-500 ml-1">{med.dose}</span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{med.route}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{med.frequency}</td>
                    <td className="py-2.5">
                      <select
                        value={status}
                        onChange={(e) => handleToggleStatus(med.id, e.target.value as any)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border cursor-pointer ${
                          status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : status === 'held'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <option value="active" className="dark:bg-slate-900">Active</option>
                        <option value="held" className="dark:bg-slate-900">Held</option>
                        <option value="discontinued" className="dark:bg-slate-900">D/C</option>
                      </select>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{med.startDate || '—'}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                      {med.notes || '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(med)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Pill size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Medications Entered
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track oral, intravenous and subcutaneous medications with dosages, schedules, and active/held status.
          </p>
        </div>
      )}
    </div>
  );
};
