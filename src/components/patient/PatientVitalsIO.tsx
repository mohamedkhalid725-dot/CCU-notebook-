import React, { useState } from 'react';
import { PatientRecord, VitalSignEntry, FluidBalanceRecord } from '../../types';
import {
  HeartPulse,
  Plus,
  Trash2,
  Clock,
  Droplet,
  ArrowDown,
  ArrowUp,
  Activity,
  AlertCircle
} from 'lucide-react';

interface PatientVitalsIOProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientVitalsIO: React.FC<PatientVitalsIOProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const vitals = patient.vitals || [];
  const fluidRecords = patient.fluidBalanceRecords || [];

  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'io'>('vitals');

  // New Vital State
  const [newVital, setNewVital] = useState<VitalSignEntry>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    hr: '',
    bpSystolic: '',
    bpDiastolic: '',
    rr: '',
    spo2: '',
    temp: '',
    painScore: '',
  });

  // New Fluid State
  const [newFluid, setNewFluid] = useState({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    intakeOral: '',
    intakeIV: '',
    intakeBlood: '',
    intakeOther: '',
    outputUrine: '',
    outputDrain: '',
    outputStool: '',
    outputOther: '',
    notes: '',
  });

  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVital.hr && !newVital.bpSystolic && !newVital.spo2) {
      alert('Please enter at least Heart Rate, Blood Pressure, or SpO2.');
      return;
    }

    const updated = {
      ...patient,
      vitals: [newVital, ...vitals],
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setNewVital({
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      hr: '',
      bpSystolic: '',
      bpDiastolic: '',
      rr: '',
      spo2: '',
      temp: '',
      painScore: '',
    });
  };

  const handleDeleteVital = (index: number) => {
    if (confirm('Delete this vital sign entry?')) {
      const updated = vitals.filter((_, i) => i !== index);
      onUpdatePatient({
        ...patient,
        vitals: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleAddFluid = (e: React.FormEvent) => {
    e.preventDefault();
    const oral = parseFloat(newFluid.intakeOral) || 0;
    const iv = parseFloat(newFluid.intakeIV) || 0;
    const blood = parseFloat(newFluid.intakeBlood) || 0;
    const inOther = parseFloat(newFluid.intakeOther) || 0;
    const urine = parseFloat(newFluid.outputUrine) || 0;
    const drain = parseFloat(newFluid.outputDrain) || 0;
    const stool = parseFloat(newFluid.outputStool) || 0;
    const outOther = parseFloat(newFluid.outputOther) || 0;

    const totalIn = oral + iv + blood + inOther;
    const totalOut = urine + drain + stool + outOther;
    const net = totalIn - totalOut;

    const record: FluidBalanceRecord = {
      id: `fluid-${Date.now()}`,
      timestamp: newFluid.timestamp,
      intakeOral: oral,
      intakeIV: iv,
      intakeBlood: blood,
      intakeOther: inOther,
      totalIntake: totalIn,
      outputUrine: urine,
      outputDrain: drain,
      outputStool: stool,
      outputOther: outOther,
      totalOutput: totalOut,
      netBalance: net,
      notes: newFluid.notes,
    };

    onUpdatePatient({
      ...patient,
      fluidBalanceRecords: [record, ...fluidRecords],
      lastUpdated: new Date().toISOString(),
    });

    setNewFluid({
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      intakeOral: '',
      intakeIV: '',
      intakeBlood: '',
      intakeOther: '',
      outputUrine: '',
      outputDrain: '',
      outputStool: '',
      outputOther: '',
      notes: '',
    });
  };

  const handleDeleteFluid = (id: string) => {
    if (confirm('Delete this fluid balance entry?')) {
      const updated = fluidRecords.filter((r) => r.id !== id);
      onUpdatePatient({
        ...patient,
        fluidBalanceRecords: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit">
        <button
          onClick={() => setActiveSubTab('vitals')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'vitals'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HeartPulse size={14} className="text-emerald-500" />
          <span>Vital Signs Flowsheet ({vitals.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('io')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'io'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplet size={14} className="text-blue-500" />
          <span>Fluid Balance / I&O ({fluidRecords.length})</span>
        </button>
      </div>

      {activeSubTab === 'vitals' ? (
        <div className="space-y-4">
          {/* Add Vital Form */}
          <form
            onSubmit={handleAddVital}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-500" />
                <span>Log New Set of Vital Signs</span>
              </span>
              <input
                type="text"
                value={newVital.timestamp}
                onChange={(e) => setNewVital({ ...newVital, timestamp: e.target.value })}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">HR (bpm)</label>
                <input
                  type="text"
                  value={newVital.hr}
                  onChange={(e) => setNewVital({ ...newVital, hr: e.target.value })}
                  placeholder="e.g. 78"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">BP Sys (mmHg)</label>
                <input
                  type="text"
                  value={newVital.bpSystolic}
                  onChange={(e) => setNewVital({ ...newVital, bpSystolic: e.target.value })}
                  placeholder="120"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">BP Dia (mmHg)</label>
                <input
                  type="text"
                  value={newVital.bpDiastolic}
                  onChange={(e) => setNewVital({ ...newVital, bpDiastolic: e.target.value })}
                  placeholder="80"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  value={newVital.spo2}
                  onChange={(e) => setNewVital({ ...newVital, spo2: e.target.value })}
                  placeholder="98"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">RR (/min)</label>
                <input
                  type="text"
                  value={newVital.rr}
                  onChange={(e) => setNewVital({ ...newVital, rr: e.target.value })}
                  placeholder="16"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">Temp (°C)</label>
                <input
                  type="text"
                  value={newVital.temp}
                  onChange={(e) => setNewVital({ ...newVital, temp: e.target.value })}
                  placeholder="37.0"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Add Vital Set
              </button>
            </div>
          </form>

          {/* Vitals Table */}
          {vitals.length > 0 ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2.5 font-medium">Time</th>
                    <th className="pb-2.5 font-medium">Heart Rate</th>
                    <th className="pb-2.5 font-medium">Blood Pressure</th>
                    <th className="pb-2.5 font-medium">MAP</th>
                    <th className="pb-2.5 font-medium">SpO2</th>
                    <th className="pb-2.5 font-medium">Resp Rate</th>
                    <th className="pb-2.5 font-medium">Temp</th>
                    <th className="pb-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {vitals.map((v, idx) => {
                    const sys = parseFloat(String(v.bpSystolic));
                    const dia = parseFloat(String(v.bpDiastolic));
                    const map = !isNaN(sys) && !isNaN(dia) ? Math.round(dia + (sys - dia) / 3) : null;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                          {v.timestamp}
                        </td>
                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {v.hr ? `${v.hr} bpm` : '—'}
                        </td>
                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {v.bpSystolic ? `${v.bpSystolic}/${v.bpDiastolic ?? '—'} mmHg` : '—'}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-600 dark:text-slate-400">
                          {map ? (
                            <span className={map < 65 ? 'text-rose-600 font-extrabold' : ''}>
                              {map} mmHg
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {v.spo2 ? `${v.spo2}%` : '—'}
                        </td>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">
                          {v.rr ? `${v.rr} /min` : '—'}
                        </td>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">
                          {v.temp ? `${v.temp} °C` : '—'}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteVital(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No vital signs recorded yet. Use the form above to log patient vitals.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add I&O Form */}
          <form
            onSubmit={handleAddFluid}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Plus size={14} className="text-blue-500" />
                <span>Log Intake & Output (mL)</span>
              </span>
              <input
                type="text"
                value={newFluid.timestamp}
                onChange={(e) => setNewFluid({ ...newFluid, timestamp: e.target.value })}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-2 p-3 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="block font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <ArrowDown size={13} />
                  <span>Intake (mL)</span>
                </span>
                <input
                  type="number"
                  value={newFluid.intakeOral}
                  onChange={(e) => setNewFluid({ ...newFluid, intakeOral: e.target.value })}
                  placeholder="Oral / NG"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  value={newFluid.intakeIV}
                  onChange={(e) => setNewFluid({ ...newFluid, intakeIV: e.target.value })}
                  placeholder="IV Fluids / Infusions"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  value={newFluid.intakeBlood}
                  onChange={(e) => setNewFluid({ ...newFluid, intakeBlood: e.target.value })}
                  placeholder="Blood Products"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <span className="block font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <ArrowUp size={13} />
                  <span>Output (mL)</span>
                </span>
                <input
                  type="number"
                  value={newFluid.outputUrine}
                  onChange={(e) => setNewFluid({ ...newFluid, outputUrine: e.target.value })}
                  placeholder="Urine Output"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
                <input
                  type="number"
                  value={newFluid.outputDrain}
                  onChange={(e) => setNewFluid({ ...newFluid, outputDrain: e.target.value })}
                  placeholder="Chest / Surgical Drains"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  value={newFluid.outputOther}
                  onChange={(e) => setNewFluid({ ...newFluid, outputOther: e.target.value })}
                  placeholder="Emesis / NG aspirate"
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-[11px] text-slate-500 font-medium">
                  Clinical Notes / Fluid Titration
                </label>
                <textarea
                  rows={4}
                  value={newFluid.notes}
                  onChange={(e) => setNewFluid({ ...newFluid, notes: e.target.value })}
                  placeholder="Diuretic response, bolus administered, fluid challenge, dialysate net..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Log Fluid Shift
              </button>
            </div>
          </form>

          {/* Fluids Table */}
          {fluidRecords.length > 0 ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2.5 font-medium">Time</th>
                    <th className="pb-2.5 font-medium">Intake (mL)</th>
                    <th className="pb-2.5 font-medium">Output (mL)</th>
                    <th className="pb-2.5 font-medium">Net Shift</th>
                    <th className="pb-2.5 font-medium">Notes</th>
                    <th className="pb-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {fluidRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {r.timestamp}
                      </td>
                      <td className="py-2.5 font-semibold text-blue-600 dark:text-blue-400">
                        +{r.totalIntake} mL
                      </td>
                      <td className="py-2.5 font-semibold text-amber-600 dark:text-amber-400">
                        -{r.totalOutput} mL
                      </td>
                      <td className="py-2.5 font-bold">
                        <span
                          className={
                            r.netBalance > 0
                              ? 'text-blue-600 dark:text-blue-400'
                              : r.netBalance < 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-600'
                          }
                        >
                          {r.netBalance > 0 ? `+${r.netBalance}` : r.netBalance} mL
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {r.notes || '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteFluid(r.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No fluid balance entries recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
