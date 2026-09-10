import React, { useState } from 'react';
import { PatientRecord, ClinicalEvent } from '../../types';
import {
  History,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertOctagon,
  HeartCrack,
  Activity,
  ArrowRight,
  Filter,
  Check,
  X,
  Layers
} from 'lucide-react';

interface PatientTimelineProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const EVENT_CATEGORIES = [
  'All',
  'Arrest / CPR',
  'Shock / Hemodynamics',
  'Airway / Ventilation',
  'Urgent Procedure',
  'Deterioration',
  'Improvement / Weaning',
  'Admission / Transfer',
] as const;

export const PatientTimeline: React.FC<PatientTimelineProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const events = patient.clinicalEvents || [];

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    timestamp: string;
    title: string;
    description: string;
    category: ClinicalEvent['category'];
    severity?: ClinicalEvent['severity'];
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    title: '',
    description: '',
    category: 'Arrest / CPR',
    severity: 'critical',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      alert('Please enter an event title.');
      return;
    }

    const item: ClinicalEvent = {
      id: editingId || `ev-${Date.now()}`,
      timestamp: formState.timestamp,
      title: formState.title.trim(),
      description: formState.description.trim(),
      category: formState.category,
      severity: formState.severity,
    };

    let updatedList: ClinicalEvent[];
    if (editingId) {
      updatedList = events.map((ev) => (ev.id === editingId ? item : ev));
    } else {
      updatedList = [item, ...events];
    }

    onUpdatePatient({
      ...patient,
      clinicalEvents: updatedList,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this clinical event entry?')) {
      const updated = events.filter((ev) => ev.id !== id);
      onUpdatePatient({
        ...patient,
        clinicalEvents: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (ev: ClinicalEvent) => {
    setEditingId(ev.id);
    setFormState({
      timestamp: ev.timestamp,
      title: ev.title,
      description: ev.description || '',
      category: ev.category || 'Urgent Procedure',
      severity: ev.severity || 'moderate',
    });
    setIsAdding(true);
  };

  const filteredEvents = filterCategory === 'All'
    ? events
    : events.filter((ev) => ev.category === filterCategory);

  const getSeverityBadge = (sev?: ClinicalEvent['severity']) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white animate-pulse">
            Critical Emergency
          </span>
        );
      case 'severe':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
            Severe
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-emerald-500" size={18} />
            <span>Clinical Events & Acute Episodes Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological log of cardiac arrests, shock states, intubations, urgent interventions, and acute crises
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              title: '',
              description: '',
              category: 'Shock / Hemodynamics',
              severity: 'critical',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Clinical Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
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
              <span>{editingId ? 'Edit Event Entry' : 'Log Acute Clinical Event'}</span>
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
            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="e.g. Ventricular Fibrillation arrest - ROSC after 1 shock"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Event Date & Time
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
                Event Category
              </label>
              <select
                value={formState.category}
                onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="Arrest / CPR">Arrest / CPR</option>
                <option value="Shock / Hemodynamics">Shock / Hemodynamics</option>
                <option value="Airway / Ventilation">Airway / Ventilation</option>
                <option value="Urgent Procedure">Urgent Procedure</option>
                <option value="Deterioration">Clinical Deterioration</option>
                <option value="Improvement / Weaning">Improvement / Weaning</option>
                <option value="Admission / Transfer">Admission / Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Clinical Acuity / Severity
              </label>
              <select
                value={formState.severity}
                onChange={(e) => setFormState({ ...formState, severity: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="critical">Critical (Immediate Code / Intervention)</option>
                <option value="severe">Severe (High alert)</option>
                <option value="moderate">Moderate</option>
                <option value="mild">Mild / Informational</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Event Narrative & Action Taken
              </label>
              <textarea
                rows={3}
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Rhythm at onset, defibrillation Joules, adrenaline doses, CPR duration, post-resuscitation care, neurological status..."
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
              {editingId ? 'Update Event' : 'Record Event'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      {filteredEvents.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  ev.severity === 'critical'
                    ? 'bg-rose-600 ring-4 ring-rose-500/20'
                    : ev.severity === 'severe'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ev.title}
                    </h4>
                    {getSeverityBadge(ev.severity)}
                    {ev.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {ev.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {ev.timestamp}
                    </span>
                    <button
                      onClick={() => handleStartEdit(ev)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {ev.description && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {ev.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <History size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Clinical Events Logged
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Log acute episodes such as cardiac arrest, ventricular tachycardia, cardiogenic shock, emergent intubation, or rapid response activations.
          </p>
        </div>
      )}
    </div>
  );
};
