import React from 'react';
import { FieldVisibilityConfig } from '../types';
import { 
  Sliders, 
  X, 
  HeartPulse, 
  Activity, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DEFAULT_FIELD_CONFIG } from '../services/storage';

interface FieldCustomizerModalProps {
  config: FieldVisibilityConfig;
  onSaveConfig: (newConfig: FieldVisibilityConfig) => void;
  onClose: () => void;
}

export const FieldCustomizerModal: React.FC<FieldCustomizerModalProps> = ({
  config,
  onSaveConfig,
  onClose
}) => {
  const [localConfig, setLocalConfig] = React.useState<FieldVisibilityConfig>({ ...config });

  const toggle = (key: keyof FieldVisibilityConfig) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const applyPreset = (preset: 'ccu' | 'icu' | 'all') => {
    if (preset === 'ccu') {
      setLocalConfig({
        ...localConfig,
        ccuCardiology: true,
        ecg: true,
        echo: true,
        cathStent: true,
        vitals: true,
        labs: true,
        medications: true,
        progressNotesTimeline: true,
        icuVentilator: false,
        icuScores: false,
        vasopressorsInfusions: true,
        abg: true,
        ioBalance: true,
      });
    } else if (preset === 'icu') {
      setLocalConfig({
        ...localConfig,
        icuVentilator: true,
        icuScores: true,
        vasopressorsInfusions: true,
        abg: true,
        ioBalance: true,
        vitals: true,
        labs: true,
        medications: true,
        progressNotesTimeline: true,
        ccuCardiology: false,
        cathStent: false,
        echo: true,
        ecg: true,
      });
    } else {
      setLocalConfig({ ...DEFAULT_FIELD_CONFIG });
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Customize Clinical Fields
              </h3>
              <p className="text-xs text-slate-400">
                Tailor visible sections for CCU, ICU, or your personal rounding workflow
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

        {/* Quick Presets */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('ccu')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-200 font-medium flex items-center gap-1 transition"
            >
              <HeartPulse className="w-3 h-3 text-rose-400" />
              CCU Focus
            </button>
            <button
              onClick={() => applyPreset('icu')}
              className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-blue-200 font-medium flex items-center gap-1 transition"
            >
              <Activity className="w-3 h-3 text-blue-400" />
              ICU Focus
            </button>
            <button
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition"
            >
              Show All (Combined)
            </button>
          </div>
        </div>

        {/* Content Checkboxes */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* CCU Specialized */}
          <div className="space-y-2">
            <div className="font-bold text-rose-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <HeartPulse className="w-3.5 h-3.5" />
              Cardiology / CCU Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.ccuCardiology}
                  onChange={() => toggle('ccuCardiology')}
                  className="rounded text-rose-500 bg-slate-900 border-slate-700"
                />
                <span>Cardiology & ECG Findings</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.echo}
                  onChange={() => toggle('echo')}
                  className="rounded text-rose-500 bg-slate-900 border-slate-700"
                />
                <span>Echo & EF% Assessment</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.cathStent}
                  onChange={() => toggle('cathStent')}
                  className="rounded text-rose-500 bg-slate-900 border-slate-700"
                />
                <span>Cath Lab, Culprit & Stent Details</span>
              </label>
            </div>
          </div>

          {/* ICU Specialized */}
          <div className="space-y-2">
            <div className="font-bold text-blue-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              Critical Care / ICU Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.icuVentilator}
                  onChange={() => toggle('icuVentilator')}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>Mechanical Ventilator & Weaning</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.abg}
                  onChange={() => toggle('abg')}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>ABG & Acid-Base Blood Gases</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.vasopressorsInfusions}
                  onChange={() => toggle('vasopressorsInfusions')}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>Vasopressors, Inotropes & Sedation</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.icuScores}
                  onChange={() => toggle('icuScores')}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>ICU Scores (GCS, RASS, SOFA)</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.ioBalance}
                  onChange={() => toggle('ioBalance')}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>Fluid Intake/Output (I/O) Balance</span>
              </label>
            </div>
          </div>

          {/* General Inpatient Modules */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span>General Patient Modules</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.vitals}
                  onChange={() => toggle('vitals')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Vitals & Hemodynamics</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.labs}
                  onChange={() => toggle('labs')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Laboratory Panels (CBC, Chem, Cardiac)</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.medications}
                  onChange={() => toggle('medications')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Active Medications</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.progressNotesTimeline}
                  onChange={() => toggle('progressNotesTimeline')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Timeline Progress Notes</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.procedures}
                  onChange={() => toggle('procedures')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Procedures & Line Insertions</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.imaging}
                  onChange={() => toggle('imaging')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Imaging (CXR, CT, Ultrasound)</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.consultations}
                  onChange={() => toggle('consultations')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Consultations & Multi-specialty</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.dischargePlan}
                  onChange={() => toggle('dischargePlan')}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>Discharge & Step-down Transfer</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => setLocalConfig({ ...DEFAULT_FIELD_CONFIG })}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
