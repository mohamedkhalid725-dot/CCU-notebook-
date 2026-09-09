import React, { useState } from 'react';
import { PatientRecord, BedStatus } from '../types';
import { Bed, X, Check, ArrowRight } from 'lucide-react';

interface ReadmitPatientModalProps {
  patient: PatientRecord;
  availableBeds: number[];
  onReadmit: (patientId: string, bedNumber: number, status: BedStatus) => void;
  onClose: () => void;
}

export const ReadmitPatientModal: React.FC<ReadmitPatientModalProps> = ({
  patient,
  availableBeds,
  onReadmit,
  onClose
}) => {
  const [selectedBed, setSelectedBed] = useState<number>(availableBeds[0] || 1);
  const [status, setStatus] = useState<BedStatus>('stable');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;
    onReadmit(patient.id, selectedBed, status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Re-admit Patient to Bed
              </h3>
              <p className="text-xs text-slate-400">
                {patient.name} ({patient.mrn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-300 font-medium">Primary Diagnosis:</p>
            <p className="text-cyan-300 font-bold text-sm">{patient.primaryDiagnosis}</p>
            {patient.dischargeDetails && (
              <p className="text-[11px] text-slate-400 mt-1">
                Previously discharged on {patient.dischargeDetails.dischargeDate} ({patient.dischargeDetails.disposition})
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">
              Select Available Bed *
            </label>
            {availableBeds.length === 0 ? (
              <p className="text-rose-400 font-semibold">
                No empty beds available! Please discharge an active patient or increase unit bed capacity first.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableBeds.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBed(b)}
                    className={`py-2 px-3 rounded-xl font-bold text-sm border flex flex-col items-center justify-center gap-1 transition ${
                      selectedBed === b
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-900/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Bed className="w-4 h-4" />
                    <span>Bed {b}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Admission Bed Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as BedStatus)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold focus:border-cyan-500 outline-none"
            >
              <option value="stable">Stable</option>
              <option value="critical">Critical</option>
              <option value="deteriorating">Deteriorating</option>
              <option value="guarded">Guarded</option>
              <option value="post-op">Post-Op</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableBeds.length === 0}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Re-admission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
