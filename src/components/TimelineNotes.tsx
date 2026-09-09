import React, { useState } from 'react';
import { ProgressNote } from '../types';
import { 
  Clock, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Tag, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface TimelineNotesProps {
  notes: ProgressNote[];
  onAddNote: (note: ProgressNote) => void;
  onUpdateNote: (note: ProgressNote) => void;
  onDeleteNote: (noteId: string) => void;
  patientName: string;
}

export const TimelineNotes: React.FC<TimelineNotesProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  patientName
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [author, setAuthor] = useState('Dr. On Duty');
  const [tag, setTag] = useState<ProgressNote['tag']>('Round');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Quick timestamp formatter matching user example: "09/09 — 08:00 PM"
  const getCurrentTimestamp = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12-hour
    const strHours = String(hours).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} — ${strHours}:${minutes} ${ampm}`;
  };

  const resetForm = () => {
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setTag('Round');
    setIsAdding(false);
    setEditingId(null);
  };

  // Templates
  const applyTemplate = (type: 'round' | 'post-cath' | 'vent' | 'handover' | 'event') => {
    setIsAdding(true);
    switch (type) {
      case 'round':
        setTag('Round');
        setSubjective('Patient conscious, oriented, no acute complaints.');
        setObjective('Vitals stable. Chest clear, abdomen soft, extremities warm. Adequate urine output.');
        setAssessment('Hemodynamically stable on current therapy.');
        setPlan('1. Continue current medical regimen.\n2. Review morning laboratory profile.\n3. Mobilize as tolerated.');
        break;
      case 'post-cath':
        setTag('Procedure');
        setSubjective('Post-coronary angiography/PCI. Denies chest pain or shortness of breath.');
        setObjective('Radial/femoral access site intact, no hematoma or active oozing. Distal pulses palpable.');
        setAssessment('Post-PCI uncomplicated. Good coronary reperfusion achieved.');
        setPlan('1. Strict limb immobilization per protocol.\n2. Ensure DAPT loaded and scheduled.\n3. Serial cardiac enzymes & ECG in 6 hours.');
        break;
      case 'vent':
        setTag('Procedure');
        setSubjective('Intubated and sedated on mechanical ventilation.');
        setObjective('Synchronized on ventilator, no air leak, bilateral breath sounds equal, ABG acceptable.');
        setAssessment('Respiratory failure under mechanical support.');
        setPlan('1. Maintain lung-protective ventilation (TV 6-8 ml/kg PBW).\n2. Target RASS -1 to -2.\n3. Daily spontaneous breathing trial (SBT) readiness check.');
        break;
      case 'handover':
        setTag('Handover');
        setSubjective('Patient conscious, hemodynamically stable throughout the shift.');
        setObjective('Vitals within acceptable targets. Fluid balance controlled.');
        setAssessment('Clinical trajectory stable.');
        setPlan('1. Routine night coverage.\n2. Repeat morning labs at 05:00.\n3. Escalate if MAP < 65 or HR > 110.');
        break;
      case 'event':
        setTag('Event');
        setSubjective('Acute clinical change noted.');
        setObjective('Vital sign instability / change in mental status.');
        setAssessment('Acute deterioration under immediate investigation.');
        setPlan('1. Bedside reassessment performed.\n2. Stat labs, ECG, and portable CXR ordered.\n3. Attending notified.');
        break;
    }
  };

  const handleSave = () => {
    if (!assessment.trim() && !plan.trim() && !subjective.trim()) {
      return;
    }

    if (editingId) {
      const existing = notes.find(n => n.id === editingId);
      if (existing) {
        onUpdateNote({
          ...existing,
          author,
          tag,
          subjective,
          objective,
          assessment,
          plan
        });
      }
    } else {
      const newNote: ProgressNote = {
        id: `note-${Date.now()}`,
        timestamp: getCurrentTimestamp(),
        author: author.trim() || 'Dr. On Duty',
        tag,
        subjective: subjective.trim(),
        objective: objective.trim(),
        assessment: assessment.trim(),
        plan: plan.trim()
      };
      onAddNote(newNote);
    }
    resetForm();
  };

  const handleStartEdit = (note: ProgressNote) => {
    setEditingId(note.id);
    setIsAdding(true);
    setAuthor(note.author);
    setTag(note.tag || 'Round');
    setSubjective(note.subjective || '');
    setObjective(note.objective || '');
    setAssessment(note.assessment || '');
    setPlan(note.plan || '');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Clinical Progress Notes Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological handover & daily round notes for {patientName}
          </p>
        </div>

        {/* 1-Click New Note Button */}
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/40 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Note</span>
          </button>
        )}
      </div>

      {/* Add / Edit Note Card */}
      {isAdding && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {editingId ? 'Edit Progress Note' : 'New Note — ' + getCurrentTimestamp()}
            </span>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Templates Bar */}
          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick SOAP Templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate('round')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
              >
                ☀️ Morning Round
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('post-cath')}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs border border-rose-800/50 transition"
              >
                🫀 Post-PCI / Cath
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('vent')}
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs border border-blue-800/50 transition"
              >
                🫁 Ventilator Change
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('handover')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs border border-emerald-800/50 transition"
              >
                🌙 Evening Handover
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('event')}
                className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs border border-amber-800/50 transition"
              >
                ⚠️ Acute Event
              </button>
            </div>
          </div>

          {/* Author & Tag Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Author / Title</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Dr. CCU Fellow, ICU Attending"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Category Tag</label>
              <select
                value={tag}
                onChange={e => setTag(e.target.value as ProgressNote['tag'])}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Round">Round (Daily / Teaching)</option>
                <option value="Handover">Handover (Shift / Transfer)</option>
                <option value="Event">Event (Acute Change)</option>
                <option value="Procedure">Procedure / Intervention</option>
                <option value="Consult">Consultation Note</option>
              </select>
            </div>
          </div>

          {/* SOAP Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Subjective (Symptoms, patient comfort, complaints)
              </label>
              <textarea
                value={subjective}
                onChange={e => setSubjective(e.target.value)}
                rows={2}
                placeholder="Patient reports pain score 0/10, breathing comfortably, denies palpitations..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Objective (Physical exam, vitals recap, fluid balance)
              </label>
              <textarea
                value={objective}
                onChange={e => setObjective(e.target.value)}
                rows={2}
                placeholder="Vitals: BP 118/74, HR 72 NSR, SpO2 98%. Chest clear. Peripheral pulses +2..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                Assessment * (Clinical synthesis & current state)
              </label>
              <textarea
                value={assessment}
                onChange={e => setAssessment(e.target.value)}
                rows={2}
                placeholder="e.g. Day 1 Post-STEMI PCI LAD. Hemodynamically stable, resolving troponin..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-900/60 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                Plan * (Next actions, medications, investigations, targets)
              </label>
              <textarea
                value={plan}
                onChange={e => setPlan(e.target.value)}
                rows={3}
                placeholder="1. Continue DAPT and high-dose statin\n2. Wean nasal cannula to room air\n3. Repeat morning labs & discharge planning..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-900/60 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/40 transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Post to Timeline'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      {notes.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm">No progress notes logged yet.</p>
          <p className="text-xs text-slate-600 mt-1">Click "Add New Note" above to write the first note.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-slate-700 before:to-slate-800">
          {notes.map((note) => {
            const isRound = note.tag === 'Round';
            const isHandover = note.tag === 'Handover';
            const isEvent = note.tag === 'Event';
            const isProcedure = note.tag === 'Procedure';

            return (
              <div key={note.id} className="relative group">
                {/* Timeline node icon / dot */}
                <div className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  isEvent 
                    ? 'bg-rose-950 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/50' 
                    : isHandover 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                    : isProcedure 
                    ? 'bg-purple-950 border-purple-500 text-purple-400'
                    : 'bg-cyan-950 border-cyan-500 text-cyan-400'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>

                {/* Note Content Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg transition">
                  {/* Note Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {note.timestamp}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-medium text-slate-300">
                        {note.author}
                      </span>
                      {note.tag && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isEvent
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : isHandover
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : isProcedure
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {note.tag}
                        </span>
                      )}
                    </div>

                    {/* Edit / Delete actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this progress note from the timeline?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Subjective, Objective, Assessment, Plan */}
                  <div className="space-y-2 text-xs leading-relaxed">
                    {note.subjective && (
                      <div className="text-slate-300">
                        <strong className="text-slate-400 font-semibold mr-1.5">S:</strong>
                        <span>{note.subjective}</span>
                      </div>
                    )}

                    {note.objective && (
                      <div className="text-slate-300">
                        <strong className="text-slate-400 font-semibold mr-1.5">O:</strong>
                        <span className="font-mono text-slate-300">{note.objective}</span>
                      </div>
                    )}

                    {note.assessment && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="font-semibold text-cyan-300 mb-0.5 text-[11px] uppercase tracking-wider">
                          Assessment
                        </div>
                        <div className="text-slate-200 font-medium">
                          {note.assessment}
                        </div>
                      </div>
                    )}

                    {note.plan && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                        <div className="font-semibold text-emerald-400 mb-0.5 text-[11px] uppercase tracking-wider">
                          Plan
                        </div>
                        <div className="text-emerald-100 whitespace-pre-line font-normal">
                          {note.plan}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
