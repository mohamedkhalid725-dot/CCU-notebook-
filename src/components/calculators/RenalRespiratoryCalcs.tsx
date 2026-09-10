import React, { useState } from 'react';
import {
  calculateCrCl,
  calculateEGFR,
  calculateCURB65,
  calculateAaGradient,
  CalcResult
} from '../../utils/calculators';
import { Droplets, Wind, ShieldAlert, RotateCcw, Calculator } from 'lucide-react';

export const RenalRespiratoryCalcs: React.FC = () => {
  const [selectedCalc, setSelectedCalc] = useState<'crcl' | 'egfr' | 'curb65' | 'aagradient'>('crcl');

  // CrCl Cockcroft-Gault
  const [crAge, setCrAge] = useState(65);
  const [crWeight, setCrWeight] = useState(70);
  const [crScr, setCrScr] = useState(1.2);
  const [crFemale, setCrFemale] = useState(false);
  const [crclResult, setCrclResult] = useState<CalcResult | null>(null);

  // eGFR CKD-EPI
  const [egfrAge, setEgfrAge] = useState(65);
  const [egfrScr, setEgfrScr] = useState(1.2);
  const [egfrFemale, setEgfrFemale] = useState(false);
  const [egfrResult, setEgfrResult] = useState<CalcResult | null>(null);

  // CURB-65
  const [curbConfusion, setCurbConfusion] = useState(false);
  const [curbUrea, setCurbUrea] = useState(false);
  const [curbRr, setCurbRr] = useState(false);
  const [curbBp, setCurbBp] = useState(false);
  const [curbAge, setCurbAge] = useState(false);
  const [curbResult, setCurbResult] = useState<CalcResult | null>(null);

  // A-a Gradient
  const [aaPao2, setAaPao2] = useState(85);
  const [aaPaco2, setAaPaco2] = useState(40);
  const [aaFio2, setAaFio2] = useState(21);
  const [aaAge, setAaAge] = useState(60);
  const [aaResult, setAaResult] = useState<CalcResult | null>(null);

  const runCrCl = () => setCrclResult(calculateCrCl(crAge, crWeight, crScr, crFemale));
  const resetCrCl = () => {
    setCrAge(65); setCrWeight(70); setCrScr(1.2); setCrFemale(false);
    setCrclResult(null);
  };

  const runEgfr = () => setEgfrResult(calculateEGFR(egfrAge, egfrScr, egfrFemale));
  const resetEgfr = () => {
    setEgfrAge(65); setEgfrScr(1.2); setEgfrFemale(false);
    setEgfrResult(null);
  };

  const runCurb = () => setCurbResult(calculateCURB65({
    confusion: curbConfusion, ureaHigh: curbUrea, rr30: curbRr, bpLow: curbBp, age65: curbAge
  }));
  const resetCurb = () => {
    setCurbConfusion(false); setCurbUrea(false); setCurbRr(false); setCurbBp(false); setCurbAge(false);
    setCurbResult(null);
  };

  const runAa = () => setAaResult(calculateAaGradient(aaPao2, aaPaco2, aaFio2, aaAge));
  const resetAa = () => {
    setAaPao2(85); setAaPaco2(40); setAaFio2(21); setAaAge(60);
    setAaResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'crcl', label: 'CrCl (Cockcroft-Gault)', icon: Droplets },
          { id: 'egfr', label: 'eGFR (CKD-EPI 2021)', icon: Droplets },
          { id: 'curb65', label: 'CURB-65 Pneumonia', icon: ShieldAlert },
          { id: 'aagradient', label: 'A-a Gradient', icon: Wind },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCalc(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCalc === t.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CrCl */}
      {selectedCalc === 'crcl' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Creatinine Clearance (Cockcroft-Gault)</h4>
            <div className="flex gap-2">
              <button onClick={resetCrCl} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runCrCl} className="flex items-center gap-1 text-xs text-teal-300 font-semibold px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900/80 rounded border border-teal-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Age (years)</label>
              <input type="number" value={crAge} onChange={e => setCrAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Weight (kg)</label>
              <input type="number" value={crWeight} onChange={e => setCrWeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Cr (mg/dL)</label>
              <input type="number" step="0.1" value={crScr} onChange={e => setCrScr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={crFemale} onChange={e => setCrFemale(e.target.checked)} />
                Female (×0.85)
              </label>
            </div>
          </div>

          {crclResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Estimated CrCl:</span>
                <span className="text-lg font-bold text-teal-400 font-mono">{crclResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{crclResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* eGFR */}
      {selectedCalc === 'egfr' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">eGFR (CKD-EPI 2021 Race-Free Equation)</h4>
            <div className="flex gap-2">
              <button onClick={resetEgfr} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runEgfr} className="flex items-center gap-1 text-xs text-teal-300 font-semibold px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900/80 rounded border border-teal-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Age (years)</label>
              <input type="number" value={egfrAge} onChange={e => setEgfrAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Cr (mg/dL)</label>
              <input type="number" step="0.1" value={egfrScr} onChange={e => setEgfrScr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={egfrFemale} onChange={e => setEgfrFemale(e.target.checked)} />
                Female
              </label>
            </div>
          </div>

          {egfrResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">eGFR:</span>
                <span className="text-lg font-bold text-teal-400 font-mono">{egfrResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{egfrResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* CURB-65 */}
      {selectedCalc === 'curb65' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">CURB-65 Pneumonia Severity Score</h4>
            <div className="flex gap-2">
              <button onClick={resetCurb} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runCurb} className="flex items-center gap-1 text-xs text-teal-300 font-semibold px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900/80 rounded border border-teal-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { checked: curbConfusion, set: setCurbConfusion, label: 'Confusion (Abbreviated Mental Test ≤ 8 or new disorientation) (+1)' },
              { checked: curbUrea, set: setCurbUrea, label: 'Urea > 7 mmol/L (BUN > 19 mg/dL) (+1)' },
              { checked: curbRr, set: setCurbRr, label: 'Respiratory rate ≥ 30 breaths/min (+1)' },
              { checked: curbBp, set: setCurbBp, label: 'Blood Pressure low (SBP < 90 mmHg OR DBP ≤ 60 mmHg) (+1)' },
              { checked: curbAge, set: setCurbAge, label: 'Age ≥ 65 years (+1)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {curbResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-teal-400">{curbResult.interpretation}</span>
              {curbResult.details && <p className="text-slate-300 mt-1">{curbResult.details}</p>}
            </div>
          )}
        </div>
      )}

      {/* A-a Gradient */}
      {selectedCalc === 'aagradient' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Alveolar-Arterial (A-a) Oxygen Gradient</h4>
            <div className="flex gap-2">
              <button onClick={resetAa} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runAa} className="flex items-center gap-1 text-xs text-teal-300 font-semibold px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900/80 rounded border border-teal-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">PaO₂ (mmHg)</label>
              <input type="number" value={aaPao2} onChange={e => setAaPao2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">PaCO₂ (mmHg)</label>
              <input type="number" value={aaPaco2} onChange={e => setAaPaco2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">FiO₂ (%)</label>
              <input type="number" value={aaFio2} onChange={e => setAaFio2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Patient Age</label>
              <input type="number" value={aaAge} onChange={e => setAaAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
          </div>

          {aaResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">A-a Gradient:</span>
                <span className="text-lg font-bold text-teal-400 font-mono">{aaResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{aaResult.interpretation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
