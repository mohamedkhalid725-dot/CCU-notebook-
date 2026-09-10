import React, { useState } from 'react';
import { PatientRecord, DailyRoundNote } from '../../types';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Calendar
} from 'lucide-react';

interface PatientDailyRoundsProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientDailyRounds: React.FC<PatientDailyRoundsProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const dailyNotes = patient.dailyNotes || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    timestamp: string;
    dayOfAdmission: string;
    subjective: string;
    objectiveVitals: string;
    objectiveExam: string;
    objectiveLabs: string;
    assessment: string;
    planGeneral: string;
    planCVS: string;
    planRS: string;
    planCNS: string;
    planRenal: string;
    planGI: string;
    planID: string;
    planHem: string;
    planProphylaxis: string;
    todoList: Array<{ id: string; text: string; done: boolean }>;
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    dayOfAdmission: 'Day 1',
    subjective: 'Patient remained hemodynamically stable overnight. No acute chest pain.',
    objectiveVitals: '',
    objectiveExam: '',
    objectiveLabs: '',
    assessment: patient.diagnosis || '',
    planGeneral: '',
    planCVS: '',
    planRS: '',
    planCNS: '',
    planRenal: '',
    planGI: '',
    planID: '',
    planHem: '',
    planProphylaxis: 'LMWH DVT prophylaxis, PPI',
    todoList: [
      { id: 'todo-1', text: 'Follow up morning cardiac markers (Trop-I)', done: false },
      { id: 'todo-2', text: 'Check serial 12-lead ECG at 12:00', done: false },
      { id: 'todo-3', text: 'Titrate ACE-inhibitor if SBP > 110', done: false },
    ],
  });

  const [newTodoInput, setNewTodoInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const note: DailyRoundNote = {
      id: editingId || `round-${Date.now()}`,
      timestamp: formState.timestamp,
      dayOfAdmission: formState.dayOfAdmission,
      subjective: formState.subjective,
      objectiveVitals: formState.objectiveVitals,
      objectiveExam: formState.objectiveExam,
      objectiveLabs: formState.objectiveLabs,
      assessment: formState.assessment,
      planGeneral: formState.planGeneral,
      planBySystem: {
        cvs: formState.planCVS,
        rs: formState.planRS,
        cns: formState.planCNS,
        renal: formState.planRenal,
        gi: formState.planGI,
        id: formState.planID,
        hematology: formState.planHem,
        prophylaxis: formState.planProphylaxis,
      },
      todoList: formState.todoList,
    };

    let updatedList: DailyRoundNote[];
    if (editingId) {
      updatedList = dailyNotes.map((n) => (n.id === editingId ? note : n));
    } else {
      updatedList = [note, ...dailyNotes];
    }

    onUpdatePatient({
      ...patient,
      dailyNotes: updatedList,
      lastUpdated: new Date().toISOString(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this daily round note?')) {
      const updated = dailyNotes.filter((n) => n.id !== id);
      onUpdatePatient({
        ...patient,
        dailyNotes: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleToggleTodoInRound = (noteId: string, todoId: string) => {
    const updated = dailyNotes.map((note) => {
      if (note.id === noteId && note.todoList) {
        const updatedTodos = note.todoList.map((t) =>
          t.id === todoId ? { ...t, done: !t.done } : t
        );
        return { ...note, todoList: updatedTodos };
      }
      return note;
    });

    onUpdatePatient({
      ...patient,
      dailyNotes: updated,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleStartEdit = (note: DailyRoundNote) => {
    setEditingId(note.id);
    setFormState({
      timestamp: note.timestamp,
      dayOfAdmission: note.dayOfAdmission || 'Day 1',
      subjective: note.subjective || '',
      objectiveVitals: note.objectiveVitals || '',
      objectiveExam: note.objectiveExam || '',
      objectiveLabs: note.objectiveLabs || '',
      assessment: note.assessment || '',
      planGeneral: note.planGeneral || '',
      planCVS: note.planBySystem?.cvs || '',
      planRS: note.planBySystem?.rs || '',
      planCNS: note.planBySystem?.cns || '',
      planRenal: note.planBySystem?.renal || '',
      planGI: note.planBySystem?.gi || '',
      planID: note.planBySystem?.id || '',
      planHem: note.planBySystem?.hematology || '',
      planProphylaxis: note.planBySystem?.prophylaxis || '',
      todoList: note.todoList || [],
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={18} />
            <span>Daily ICU / CCU Rounds & Progress Notes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SOAP documentation, system-based care plans (CVS, RS, Renal, ID), and interactive daily to-do checklists
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              dayOfAdmission: `Day ${dailyNotes.length + 1}`,
              subjective: 'Overnight stable, no telemetry events or chest pain',
              objectiveVitals: '',
              objectiveExam: '',
              objectiveLabs: '',
              assessment: patient.diagnosis || '',
              planGeneral: '',
              planCVS: '',
              planRS: '',
              planCNS: '',
              planRenal: '',
              planGI: '',
              planID: '',
              planHem: '',
              planProphylaxis: 'LMWH DVT prophylaxis, PPI',
              todoList: [],
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>New Daily Note</span>
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
              <span>{editingId ? 'Edit Daily Progress Note' : 'Draft Daily Progress Note (SOAP)'}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Round Date & Time
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
                Day of Admission (e.g. Day 2, Day 5)
              </label>
              <input
                type="text"
                value={formState.dayOfAdmission}
                onChange={(e) => setFormState({ ...formState, dayOfAdmission: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Subjective (S) — Overnight Events & Symptoms
              </label>
              <textarea
                rows={2}
                value={formState.subjective}
                onChange={(e) => setFormState({ ...formState, subjective: e.target.value })}
                placeholder="Overnight rhythm events, chest pain, dyspnea, nausea, nursing notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Objective (O) — Physical Exam & 24h Summary
              </label>
              <textarea
                rows={2}
                value={formState.objectiveExam}
                onChange={(e) => setFormState({ ...formState, objectiveExam: e.target.value })}
                placeholder="Chest auscultation, S3 gallop, peripheral edema, JVP, neuro status, fluid balance..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Assessment (A) — Active Problem List
              </label>
              <textarea
                rows={2}
                value={formState.assessment}
                onChange={(e) => setFormState({ ...formState, assessment: e.target.value })}
                placeholder="1. Acute Anterior STEMI post-PCI, Killip II
2. Acute Decompensated Heart Failure
3. Type 2 Diabetes Mellitus"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* System-by-System Plan */}
            <div className="sm:col-span-2 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Plan by Organ System (P):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    Cardiovascular (CVS / Rhythm / Hemodynamics)
                  </label>
                  <input
                    type="text"
                    value={formState.planCVS}
                    onChange={(e) => setFormState({ ...formState, planCVS: e.target.value })}
                    placeholder="DAPT, Statin, ACEi titration, Telemetry..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    Respiratory (RS / Oxygenation)
                  </label>
                  <input
                    type="text"
                    value={formState.planRS}
                    onChange={(e) => setFormState({ ...formState, planRS: e.target.value })}
                    placeholder="Wean oxygen, chest PT, BiPAP settings..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    Renal / Fluid Balance / Electrolytes
                  </label>
                  <input
                    type="text"
                    value={formState.planRenal}
                    onChange={(e) => setFormState({ ...formState, planRenal: e.target.value })}
                    placeholder="IV Furosemide, target negative balance -500 mL..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    Infectious Diseases / Antibiotics
                  </label>
                  <input
                    type="text"
                    value={formState.planID}
                    onChange={(e) => setFormState({ ...formState, planID: e.target.value })}
                    placeholder="Day 3 Ceftriaxone, check blood cultures..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    GI / Nutrition / Glycemic Control
                  </label>
                  <input
                    type="text"
                    value={formState.planGI}
                    onChange={(e) => setFormState({ ...formState, planGI: e.target.value })}
                    placeholder="Diabetic cardiac diet, sliding scale insulin..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-0.5 font-medium">
                    Prophylaxis (DVT / Stress Ulcer)
                  </label>
                  <input
                    type="text"
                    value={formState.planProphylaxis}
                    onChange={(e) => setFormState({ ...formState, planProphylaxis: e.target.value })}
                    placeholder="Enoxaparin 40mg SC, Omeprazole 40mg IV..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* To-Do Checklist for this round */}
            <div className="sm:col-span-2 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Action Items / To-Do Checklist:
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodoInput}
                  onChange={(e) => setNewTodoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTodoInput.trim()) {
                        setFormState({
                          ...formState,
                          todoList: [
                            ...formState.todoList,
                            { id: `t-${Date.now()}`, text: newTodoInput.trim(), done: false },
                          ],
                        });
                        setNewTodoInput('');
                      }
                    }
                  }}
                  placeholder="Type an action item and press Enter..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTodoInput.trim()) {
                      setFormState({
                        ...formState,
                        todoList: [
                          ...formState.todoList,
                          { id: `t-${Date.now()}`, text: newTodoInput.trim(), done: false },
                        ],
                      });
                      setNewTodoInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {formState.todoList.length > 0 && (
                <div className="space-y-1 pt-1">
                  {formState.todoList.map((t, idx) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className={t.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                        {t.text}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            todoList: formState.todoList.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-500 text-[11px]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {editingId ? 'Update Note' : 'Save Round Note'}
            </button>
          </div>
        </form>
      )}

      {/* Daily Notes List */}
      {dailyNotes.length > 0 ? (
        <div className="space-y-4">
          {dailyNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {note.dayOfAdmission ? `${note.dayOfAdmission} • ` : ''}Progress Note
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {note.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(note)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* SOAP Body */}
              <div className="space-y-2 text-xs">
                {note.subjective && (
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">[S]</span>
                    <span className="text-slate-700 dark:text-slate-300">{note.subjective}</span>
                  </div>
                )}

                {note.objectiveExam && (
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">[O]</span>
                    <span className="text-slate-700 dark:text-slate-300">{note.objectiveExam}</span>
                  </div>
                )}

                {note.assessment && (
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400 mr-1.5">[A]</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold whitespace-pre-wrap">
                      {note.assessment}
                    </span>
                  </div>
                )}

                {/* Plan Systems */}
                {note.planBySystem && Object.values(note.planBySystem).some(Boolean) && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 mt-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                      [P] System Plan:
                    </span>
                    {note.planBySystem.cvs && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>CVS:</strong> {note.planBySystem.cvs}
                      </p>
                    )}
                    {note.planBySystem.rs && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>RS:</strong> {note.planBySystem.rs}
                      </p>
                    )}
                    {note.planBySystem.renal && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Renal/Fluids:</strong> {note.planBySystem.renal}
                      </p>
                    )}
                    {note.planBySystem.id && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>ID:</strong> {note.planBySystem.id}
                      </p>
                    )}
                    {note.planBySystem.gi && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>GI/Metabolic:</strong> {note.planBySystem.gi}
                      </p>
                    )}
                    {note.planBySystem.prophylaxis && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Prophylaxis:</strong> {note.planBySystem.prophylaxis}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive To-Dos */}
              {note.todoList && note.todoList.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Action Checklist:
                  </span>
                  <div className="space-y-1">
                    {note.todoList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleToggleTodoInRound(note.id, t.id)}
                        className="flex items-center gap-2 w-full text-left text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        {t.done ? (
                          <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span
                          className={
                            t.done
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }
                        >
                          {t.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ClipboardList size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Daily Round Notes Recorded
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Record morning ward rounds, system-by-system care plans (CVS, RS, Renal), and daily to-do checklists.
          </p>
        </div>
      )}
    </div>
  );
};
