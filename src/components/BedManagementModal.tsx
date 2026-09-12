import React, { useState } from 'react';
import {
  BedDefinition,
  PatientRecord
} from '../types';
import {
  Bed,
  Plus,
  Trash2,
  Edit2,
  ArrowRightLeft,
  UserCheck,
  UserX,
  X,
  Check,
  AlertTriangle,
  Building,
  CheckCircle2,
  Users
} from 'lucide-react';

interface BedManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: BedDefinition[];
  patients: PatientRecord[];
  onSaveBeds: (beds: BedDefinition[]) => void;
  onUpdatePatientBed: (patientId: string, newBedNumber: string | number) => void;
  onSwapPatientBeds?: (patientId1: string, patientId2: string) => void;
  onSelectPatient?: (patient: PatientRecord) => void;
  onAdmitToBed?: (bedNumber: string | number) => void;
}

export const BedManagementModal: React.FC<BedManagementModalProps> = ({
  isOpen,
  onClose,
  beds,
  patients,
  onSaveBeds,
  onUpdatePatientBed,
  onSelectPatient,
  onAdmitToBed
}) => {
  const [editingBedId, setEditingBedId] = useState<string | null>(null);
  const [editingBedName, setEditingBedName] = useState('');
  const [editingDept, setEditingDept] = useState<'CCU' | 'ICU' | 'Step-down' | 'General'>('CCU');

  // Add bed state
  const [isAddingBed, setIsAddingBed] = useState(false);
  const [newBedName, setNewBedName] = useState('');
  const [newBedDept, setNewBedDept] = useState<'CCU' | 'ICU' | 'Step-down' | 'General'>('CCU');

  // Move patient state
  const [movingPatient, setMovingPatient] = useState<PatientRecord | null>(null);
  const [targetBedNumber, setTargetBedNumber] = useState<string>('');

  // In-modal alerts and confirmation (replaces iframe-blocked alert/confirm)
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [bedToRemove, setBedToRemove] = useState<BedDefinition | null>(null);

  if (!isOpen) return null;

  const activePatients = patients.filter((p) => !p.isDischarged);

  // Map each bed to occupant
  const bedsWithOccupants = beds.map((bed) => {
    const occupant = activePatients.find(
      (p) => String(p.bedNumber).trim().toLowerCase() === bed.name.trim().toLowerCase() ||
             String(p.bedNumber).trim().toLowerCase() === bed.id.replace('bed-', '').trim().toLowerCase() ||
             String(p.bedNumber).trim().toLowerCase() === bed.name.replace(/[^0-9]/g, '').trim().toLowerCase()
    );
    return {
      bed,
      occupant: occupant || null,
    };
  });

  const occupiedCount = bedsWithOccupants.filter((b) => b.occupant !== null).length;
  const availableCount = beds.length - occupiedCount;
  const occupancyRate = beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0;

  const handleStartEditBed = (bed: BedDefinition) => {
    setEditingBedId(bed.id);
    setEditingBedName(bed.name);
    setEditingDept(bed.department || 'CCU');
  };

  const handleSaveEditBed = (bedId: string) => {
    if (!editingBedName.trim()) return;
    const oldBed = beds.find((b) => b.id === bedId);
    const updated = beds.map((b) =>
      b.id === bedId ? { ...b, name: editingBedName.trim(), department: editingDept } : b
    );
    onSaveBeds(updated);

    // If an active patient had the old bed name or number, update patient's bedNumber
    if (oldBed) {
      const occupant = activePatients.find(
        (p) => String(p.bedNumber).trim() === oldBed.name.trim() ||
               String(p.bedNumber).trim() === oldBed.id.replace('bed-', '').trim()
      );
      if (occupant) {
        onUpdatePatientBed(occupant.id, editingBedName.trim());
      }
    }

    setEditingBedId(null);
  };

  const handleAddBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedName.trim()) return;
    const newId = `bed-${Date.now()}`;
    const newBed: BedDefinition = {
      id: newId,
      name: newBedName.trim(),
      department: newBedDept,
      status: 'active',
    };
    onSaveBeds([...beds, newBed]);
    setNewBedName('');
    setIsAddingBed(false);
  };

  const handleRemoveBed = (bed: BedDefinition) => {
    setActionNotice(null);
    const occupant = activePatients.find(
      (p) => String(p.bedNumber).trim().toLowerCase() === bed.name.trim().toLowerCase()
    );
    if (occupant) {
      setActionNotice(`Cannot delete ${bed.name}: currently occupied by ${occupant.name}. Please reassign or discharge patient first.`);
      return;
    }
    if (beds.length <= 1) {
      setActionNotice('At least one bed must be maintained.');
      return;
    }
    setBedToRemove(bed);
  };

  const confirmRemoveBed = () => {
    if (!bedToRemove) return;
    onSaveBeds(beds.filter((b) => b.id !== bedToRemove.id));
    setBedToRemove(null);
    setActionNotice(null);
  };

  const handleExecuteMovePatient = () => {
    if (!movingPatient || !targetBedNumber) return;
    onUpdatePatientBed(movingPatient.id, targetBedNumber);
    setMovingPatient(null);
    setTargetBedNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bed size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Bed Management & Capacity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure beds, transfer patients, and monitor census utilization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner if any */}
        {actionNotice && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Remove Confirmation Prompt */}
        {bedToRemove && (
          <div className="px-4 py-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Remove <strong>{bedToRemove.name}</strong> from ICU/CCU bed roster?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBedToRemove(null)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveBed}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Beds</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{beds.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Occupied Beds</span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{occupiedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Available Beds</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{availableCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Occupancy Rate</span>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">{occupancyRate}%</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department Beds:
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              CCU: {beds.filter((b) => b.department === 'CCU').length}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              ICU: {beds.filter((b) => b.department === 'ICU').length}
            </span>
          </div>

          <button
            onClick={() => {
              setIsAddingBed(true);
              setNewBedName(`Bed ${beds.length + 1}`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus size={15} />
            <span>Add New Bed</span>
          </button>
        </div>

        {/* Add Bed Form Drawer */}
        {isAddingBed && (
          <form
            onSubmit={handleAddBed}
            className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-800/40 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bed Label / Name:
              </label>
              <input
                type="text"
                value={newBedName}
                onChange={(e) => setNewBedName(e.target.value)}
                placeholder="e.g. Bed 9, CCU 5, Isolation Bed 1"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div className="w-40">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department:
              </label>
              <select
                value={newBedDept}
                onChange={(e) => setNewBedDept(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CCU">CCU (Coronary)</option>
                <option value="ICU">ICU (Intensive)</option>
                <option value="Step-down">Step-down / HDU</option>
                <option value="General">General Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Save Bed
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBed(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Beds Grid / Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bedsWithOccupants.map(({ bed, occupant }) => (
              <div
                key={bed.id}
                className={`p-4 rounded-xl border transition-all ${
                  occupant
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-300 dark:hover:border-emerald-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        occupant
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      <Bed size={18} />
                    </div>

                    {editingBedId === bed.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingBedName}
                          onChange={(e) => setEditingBedName(e.target.value)}
                          className="px-2 py-1 rounded border border-emerald-500 bg-white dark:bg-slate-800 text-xs font-semibold w-28 text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <select
                          value={editingDept}
                          onChange={(e) => setEditingDept(e.target.value as any)}
                          className="px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                        >
                          <option value="CCU">CCU</option>
                          <option value="ICU">ICU</option>
                          <option value="Step-down">HDU</option>
                          <option value="General">Gen</option>
                        </select>
                        <button
                          onClick={() => handleSaveEditBed(bed.id)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingBedId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {bed.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {bed.department || 'CCU'}
                          </span>
                        </div>
                        <span
                          className={`inline-block text-[11px] font-semibold mt-0.5 ${
                            occupant
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {occupant ? `Occupied` : 'Available'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bed Action Icons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditBed(bed)}
                      title="Rename Bed"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleRemoveBed(bed)}
                      title="Remove Bed"
                      disabled={!!occupant}
                      className={`p-1.5 rounded-lg transition ${
                        occupant
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Occupant Details or Empty Bed State */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {occupant ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {occupant.name}
                          <span className="font-normal text-slate-500 text-[11px] ml-1.5">
                            ({occupant.age}y, {occupant.gender})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {occupant.primaryDiagnosis || 'No diagnosis entered'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onSelectPatient && (
                          <button
                            onClick={() => onSelectPatient(occupant)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                          >
                            Open File
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMovingPatient(occupant);
                            setTargetBedNumber('');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 transition"
                        >
                          <ArrowRightLeft size={12} />
                          <span>Move</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400 italic">No patient assigned</span>
                      {onAdmitToBed && (
                        <button
                          onClick={() => onAdmitToBed(bed.name)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 transition"
                        >
                          <Plus size={12} />
                          <span>Admit Patient</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Move Patient Sub-Modal / Drawer */}
        {movingPatient && (
          <div className="p-4 bg-teal-50 dark:bg-slate-800/90 border-t border-teal-200 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ArrowRightLeft className="text-teal-600 dark:text-teal-400 shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Transfer Patient: <span className="text-teal-700 dark:text-teal-300">{movingPatient.name}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current: Bed {movingPatient.bedNumber} • Select destination bed:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetBedNumber}
                onChange={(e) => setTargetBedNumber(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="">-- Choose Destination Bed --</option>
                {beds
                  .filter((b) => String(b.name).trim() !== String(movingPatient.bedNumber).trim())
                  .map((b) => {
                    const isOcc = activePatients.some(
                      (p) => String(p.bedNumber).trim().toLowerCase() === b.name.trim().toLowerCase()
                    );
                    return (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.department || 'CCU'}) {isOcc ? '— [OCCUPIED - will reassign]' : '— [AVAILABLE]'}
                      </option>
                    );
                  })}
              </select>

              <button
                onClick={handleExecuteMovePatient}
                disabled={!targetBedNumber}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
              >
                Confirm Transfer
              </button>

              <button
                onClick={() => setMovingPatient(null)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            CardioVault Bed Engine • Live dynamic allocation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
