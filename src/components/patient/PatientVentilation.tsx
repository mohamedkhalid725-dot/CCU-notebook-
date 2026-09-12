import React, { useState } from 'react';
import { PatientRecord, VentilatorRecord } from '../../types';
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
  Gauge,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface PatientVentilationProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

const COMMON_MODES = [
  'VCV (Volume Control)',
  'PCV (Pressure Control)',
  'PRVC (Pressure Regulated Volume Control)',
  'SIMV-VC',
  'SIMV-PC',
  'PSV / CPAP',
  'BiPAP / NIV',
  'HFNC (High-Flow Nasal)',
  'T-Piece / Weaning trial',
  'Room Air'
];

export const PatientVentilation: React.FC<PatientVentilationProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const records = patient.ventilationRecords || [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<VentilatorRecord>>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    mode: 'PRVC (Pressure Regulated Volume Control)',
    airwayType: 'ETT',
    etTubeSize: '7.5',
    etTubeDepth: '22',
    fio2: '40',
    peep: '8',
    spo2Target: '92-96%',
    tidalVolume: '450',
    inspiratoryPressure: '',
    pressureSupport: '10',
    peakPressure: '22',
    plateauPressure: '18',
    drivingPressure: '10',
    setRate: '16',
    actualRate: '16',
    ieRatio: '1:2',
    inspiratoryTime: '1.0',
    inspiratoryFlow: '60',
    triggerType: 'Flow',
    sensitivity: '2.0 L/min',
    riseTime: '0.15s',
    minuteVentilation: '7.2',
    exhaledTidalVolume: '445',
    compliance: '45',
    autoPeep: '0',
    notes: ''
  });

  const latestRecord = records.length > 0 ? records[0] : null;

  // Auto calculate driving pressure & compliance if plateau & peep & tv are provided
  const handleCalculateMechanics = (pPlatStr?: number | string, peepStr?: number | string, tvStr?: number | string) => {
    const pPlat = parseFloat(String(pPlatStr));
    const peep = parseFloat(String(peepStr));
    const tv = parseFloat(String(tvStr));

    let driving: number | string = '';
    let comp: number | string = '';

    if (!isNaN(pPlat) && !isNaN(peep)) {
      const diff = Math.round((pPlat - peep) * 10) / 10;
      driving = diff > 0 ? diff : 0;
      if (!isNaN(tv) && diff > 0) {
        comp = Math.round((tv / diff) * 10) / 10;
      }
    }

    return { driving, comp };
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormState({
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mode: latestRecord?.mode || 'PRVC (Pressure Regulated Volume Control)',
      airwayType: latestRecord?.airwayType || 'ETT',
      etTubeSize: latestRecord?.etTubeSize || '7.5',
      etTubeDepth: latestRecord?.etTubeDepth || '22',
      fio2: latestRecord?.fio2 || '40',
      peep: latestRecord?.peep || '8',
      spo2Target: latestRecord?.spo2Target || '92-96%',
      tidalVolume: latestRecord?.tidalVolume || '450',
      inspiratoryPressure: latestRecord?.inspiratoryPressure || '',
      pressureSupport: latestRecord?.pressureSupport || '10',
      peakPressure: latestRecord?.peakPressure || '22',
      plateauPressure: latestRecord?.plateauPressure || '18',
      drivingPressure: latestRecord?.drivingPressure || '10',
      setRate: latestRecord?.setRate || '16',
      actualRate: latestRecord?.actualRate || '16',
      ieRatio: latestRecord?.ieRatio || '1:2',
      inspiratoryTime: latestRecord?.inspiratoryTime || '1.0',
      inspiratoryFlow: latestRecord?.inspiratoryFlow || '60',
      triggerType: latestRecord?.triggerType || 'Flow',
      sensitivity: latestRecord?.sensitivity || '2.0 L/min',
      riseTime: latestRecord?.riseTime || '0.15s',
      minuteVentilation: latestRecord?.minuteVentilation || '7.2',
      exhaledTidalVolume: latestRecord?.exhaledTidalVolume || '445',
      compliance: latestRecord?.compliance || '45',
      autoPeep: latestRecord?.autoPeep || '0',
      notes: ''
    });
    setIsAdding(true);
  };

  const handleStartEdit = (rec: VentilatorRecord) => {
    setEditingId(rec.id);
    setFormState({ ...rec });
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.mode) return;

    const entry: VentilatorRecord = {
      id: editingId || `vent-${Date.now()}`,
      timestamp: formState.timestamp || new Date().toISOString().slice(0, 16).replace('T', ' '),
      recordedBy: formState.recordedBy || 'Clinical Staff',
      mode: formState.mode,
      airwayType: formState.airwayType,
      etTubeSize: formState.etTubeSize,
      etTubeDepth: formState.etTubeDepth,
      fio2: formState.fio2 || '40',
      peep: formState.peep || '5',
      spo2Target: formState.spo2Target,
      tidalVolume: formState.tidalVolume,
      inspiratoryPressure: formState.inspiratoryPressure,
      pressureSupport: formState.pressureSupport,
      peakPressure: formState.peakPressure,
      plateauPressure: formState.plateauPressure,
      drivingPressure: formState.drivingPressure,
      setRate: formState.setRate,
      actualRate: formState.actualRate,
      ieRatio: formState.ieRatio,
      inspiratoryTime: formState.inspiratoryTime,
      inspiratoryFlow: formState.inspiratoryFlow,
      triggerType: formState.triggerType,
      sensitivity: formState.sensitivity,
      riseTime: formState.riseTime,
      minuteVentilation: formState.minuteVentilation,
      exhaledTidalVolume: formState.exhaledTidalVolume,
      compliance: formState.compliance,
      autoPeep: formState.autoPeep,
      notes: formState.notes
    };

    let updatedRecords: VentilatorRecord[];
    if (editingId) {
      updatedRecords = records.map(r => r.id === editingId ? entry : r);
    } else {
      updatedRecords = [entry, ...records];
    }

    // Keep legacy summary synced
    const updatedVentSettings = {
      mode: entry.mode,
      fio2: entry.fio2,
      peep: entry.peep,
      tv: entry.tidalVolume || '',
      rate: entry.setRate || '',
      totalRate: entry.actualRate || '',
      pPeak: entry.peakPressure || '',
      pPlat: entry.plateauPressure || '',
      etTubeSize: entry.etTubeSize || '',
      etTubeDepth: entry.etTubeDepth || ''
    };

    onUpdatePatient({
      ...patient,
      ventilationRecords: updatedRecords,
      icuVentilator: updatedVentSettings,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this mechanical ventilation record?')) return;
    const updatedRecords = records.filter(r => r.id !== id);
    onUpdatePatient({
      ...patient,
      ventilationRecords: updatedRecords,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Current Ventilation Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Mechanical Ventilation
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  latestRecord?.mode && latestRecord.mode !== 'Room Air'
                    ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {latestRecord?.mode || 'No Active Ventilator'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ventilator settings, lung mechanics, and serial titration history
              </p>
            </div>
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Settings</span>
          </button>
        </div>

        {/* Quick Highlights of Current Settings */}
        {latestRecord && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Mode & Airway</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={latestRecord.mode}>
                {latestRecord.mode.split(' ')[0]}
              </p>
              <span className="text-[10px] text-slate-400">
                {latestRecord.airwayType || 'ETT'} {latestRecord.etTubeSize ? `#${latestRecord.etTubeSize}` : ''}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">FiO2 / PEEP</span>
              <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {latestRecord.fio2}% / {latestRecord.peep}
              </p>
              <span className="text-[10px] text-slate-400">cmH2O</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Tidal Volume</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {latestRecord.tidalVolume || '--'} <span className="text-[10px] font-normal text-slate-400">mL</span>
              </p>
              <span className="text-[10px] text-slate-400">Exh: {latestRecord.exhaledTidalVolume || '--'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Rate (Set / Total)</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {latestRecord.setRate || '--'} / {latestRecord.actualRate || latestRecord.setRate || '--'}
              </p>
              <span className="text-[10px] text-slate-400">bpm</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Ppeak / Pplat</span>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {latestRecord.peakPressure || '--'} / {latestRecord.plateauPressure || '--'}
              </p>
              <span className="text-[10px] text-slate-400">cmH2O</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Driving P / Cstat</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {latestRecord.drivingPressure || '--'} / {latestRecord.compliance || '--'}
              </p>
              <span className="text-[10px] text-slate-400">mL/cmH2O</span>
            </div>
          </div>
        )}
      </div>

      {/* Entry Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-cyan-300 dark:border-cyan-800/70 bg-white dark:bg-slate-900 p-5 shadow-lg space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {editingId ? 'Edit Ventilation Record' : 'New Mechanical Ventilation Record'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Mode & Airway */}
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
              1. Ventilator Mode & Airway
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Ventilator Mode *
                </label>
                <select
                  value={formState.mode}
                  onChange={e => setFormState({ ...formState, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  {COMMON_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Airway Interface
                </label>
                <select
                  value={formState.airwayType}
                  onChange={e => setFormState({ ...formState, airwayType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ETT">Endotracheal Tube (ETT)</option>
                  <option value="Tracheostomy">Tracheostomy</option>
                  <option value="NIV Mask">NIV Mask (CPAP/BiPAP)</option>
                  <option value="High-Flow Nasal Cannula (HFNC)">High-Flow Nasal Cannula (HFNC)</option>
                  <option value="T-Piece">T-Piece</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Tube Size (mm ID)
                </label>
                <input
                  type="text"
                  value={formState.etTubeSize || ''}
                  onChange={e => setFormState({ ...formState, etTubeSize: e.target.value })}
                  placeholder="e.g. 7.5, 8.0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Tube Depth (cm at teeth/lip)
                </label>
                <input
                  type="text"
                  value={formState.etTubeDepth || ''}
                  onChange={e => setFormState({ ...formState, etTubeDepth: e.target.value })}
                  placeholder="e.g. 21, 22 cm"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Oxygenation */}
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
              2. Oxygenation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  FiO2 (%) *
                </label>
                <input
                  type="number"
                  min="21"
                  max="100"
                  value={formState.fio2 || ''}
                  onChange={e => setFormState({ ...formState, fio2: e.target.value })}
                  placeholder="21 - 100"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  PEEP (cmH2O) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={formState.peep || ''}
                  onChange={e => {
                    const newPeep = e.target.value;
                    const { driving, comp } = handleCalculateMechanics(formState.plateauPressure, newPeep, formState.tidalVolume);
                    setFormState({
                      ...formState,
                      peep: newPeep,
                      drivingPressure: driving || formState.drivingPressure,
                      compliance: comp || formState.compliance
                    });
                  }}
                  placeholder="e.g. 5, 8, 10"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  SpO2 Target
                </label>
                <input
                  type="text"
                  value={formState.spo2Target || ''}
                  onChange={e => setFormState({ ...formState, spo2Target: e.target.value })}
                  placeholder="e.g. 92-96%, 88-92% (COPD)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Volume & Pressure */}
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
              3. Volume & Pressure
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Tidal Volume (mL)
                </label>
                <input
                  type="number"
                  value={formState.tidalVolume || ''}
                  onChange={e => {
                    const newTv = e.target.value;
                    const { comp } = handleCalculateMechanics(formState.plateauPressure, formState.peep, newTv);
                    setFormState({
                      ...formState,
                      tidalVolume: newTv,
                      compliance: comp || formState.compliance
                    });
                  }}
                  placeholder="e.g. 420"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Pinsp (cmH2O)
                </label>
                <input
                  type="number"
                  value={formState.inspiratoryPressure || ''}
                  onChange={e => setFormState({ ...formState, inspiratoryPressure: e.target.value })}
                  placeholder="e.g. 15"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Pressure Support
                </label>
                <input
                  type="number"
                  value={formState.pressureSupport || ''}
                  onChange={e => setFormState({ ...formState, pressureSupport: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Ppeak (cmH2O)
                </label>
                <input
                  type="number"
                  value={formState.peakPressure || ''}
                  onChange={e => setFormState({ ...formState, peakPressure: e.target.value })}
                  placeholder="e.g. 24"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Pplat (cmH2O)
                </label>
                <input
                  type="number"
                  value={formState.plateauPressure || ''}
                  onChange={e => {
                    const newPplat = e.target.value;
                    const { driving, comp } = handleCalculateMechanics(newPplat, formState.peep, formState.tidalVolume);
                    setFormState({
                      ...formState,
                      plateauPressure: newPplat,
                      drivingPressure: driving || formState.drivingPressure,
                      compliance: comp || formState.compliance
                    });
                  }}
                  placeholder="e.g. 18"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Driving Pressure
                </label>
                <input
                  type="number"
                  value={formState.drivingPressure || ''}
                  onChange={e => setFormState({ ...formState, drivingPressure: e.target.value })}
                  placeholder="Pplat - PEEP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Respiratory Rate & Timing */}
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
              4. Respiratory Rate & Timing
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Set RR (bpm)
                </label>
                <input
                  type="number"
                  value={formState.setRate || ''}
                  onChange={e => setFormState({ ...formState, setRate: e.target.value })}
                  placeholder="e.g. 14"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Actual Total RR (bpm)
                </label>
                <input
                  type="number"
                  value={formState.actualRate || ''}
                  onChange={e => setFormState({ ...formState, actualRate: e.target.value })}
                  placeholder="e.g. 16"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  I:E Ratio
                </label>
                <input
                  type="text"
                  value={formState.ieRatio || ''}
                  onChange={e => setFormState({ ...formState, ieRatio: e.target.value })}
                  placeholder="e.g. 1:2, 1:1.5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Inspiratory Time (s)
                </label>
                <input
                  type="text"
                  value={formState.inspiratoryTime || ''}
                  onChange={e => setFormState({ ...formState, inspiratoryTime: e.target.value })}
                  placeholder="e.g. 1.0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Flow, Trigger & Monitoring */}
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
              5. Flow, Trigger & Monitoring
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Flow (L/min)
                </label>
                <input
                  type="number"
                  value={formState.inspiratoryFlow || ''}
                  onChange={e => setFormState({ ...formState, inspiratoryFlow: e.target.value })}
                  placeholder="e.g. 60"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Trigger
                </label>
                <select
                  value={formState.triggerType || 'Flow'}
                  onChange={e => setFormState({ ...formState, triggerType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Flow">Flow Trigger</option>
                  <option value="Pressure">Pressure Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Sensitivity
                </label>
                <input
                  type="text"
                  value={formState.sensitivity || ''}
                  onChange={e => setFormState({ ...formState, sensitivity: e.target.value })}
                  placeholder="2.0 L/min"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Minute Vent (L/m)
                </label>
                <input
                  type="text"
                  value={formState.minuteVentilation || ''}
                  onChange={e => setFormState({ ...formState, minuteVentilation: e.target.value })}
                  placeholder="e.g. 7.5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Exhaled TV (mL)
                </label>
                <input
                  type="number"
                  value={formState.exhaledTidalVolume || ''}
                  onChange={e => setFormState({ ...formState, exhaledTidalVolume: e.target.value })}
                  placeholder="e.g. 415"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Compliance (Cstat)
                </label>
                <input
                  type="number"
                  value={formState.compliance || ''}
                  onChange={e => setFormState({ ...formState, compliance: e.target.value })}
                  placeholder="mL/cmH2O"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Auto-PEEP
                </label>
                <input
                  type="text"
                  value={formState.autoPeep || ''}
                  onChange={e => setFormState({ ...formState, autoPeep: e.target.value })}
                  placeholder="cmH2O"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Timestamp & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Date & Time *
              </label>
              <input
                type="text"
                value={formState.timestamp || ''}
                onChange={e => setFormState({ ...formState, timestamp: e.target.value })}
                placeholder="YYYY-MM-DD HH:MM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Clinical Observations / Weaning Plan
              </label>
              <input
                type="text"
                value={formState.notes || ''}
                onChange={e => setFormState({ ...formState, notes: e.target.value })}
                placeholder="e.g. Tolerating PSV, spontaneous tidal volumes 450mL, RSBI 42, preparing for SBT."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
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
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      )}

      {/* History of Ventilation Records */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Ventilation History ({records.length})</span>
          </h4>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <Wind className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No mechanical ventilation records logged yet.
            </p>
            <button
              onClick={handleStartAdd}
              className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              + Log Initial Ventilator Parameters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec, idx) => (
              <div
                key={rec.id}
                className={`p-4 rounded-2xl border transition ${
                  idx === 0
                    ? 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/20 dark:bg-cyan-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {rec.mode}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {rec.timestamp}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(rec)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">FiO2 / PEEP</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.fio2}% / {rec.peep} cmH2O
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Tidal Volume</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.tidalVolume ? `${rec.tidalVolume} mL` : '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Rate (Set/Act)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.setRate || '--'} / {rec.actualRate || '--'} bpm
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Ppeak / Pplat</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.peakPressure || '--'} / {rec.plateauPressure || '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Driving P / Cstat</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.drivingPressure || '--'} / {rec.compliance || '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Airway</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rec.airwayType || 'ETT'} {rec.etTubeSize ? `#${rec.etTubeSize}` : ''}
                    </span>
                  </div>
                </div>

                {rec.notes && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{rec.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
