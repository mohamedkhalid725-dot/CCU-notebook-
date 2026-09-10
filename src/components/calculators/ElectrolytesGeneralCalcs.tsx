import React, { useState } from 'react';
import {
  calculateAnionGap,
  calculateCorrectedSodium,
  calculateCorrectedCalcium,
  calculateFreeWaterDeficit,
  calculateBMI,
  calculateMAP,
  calculateShockIndex,
  calculateQTc,
  CalcResult
} from '../../utils/calculators';
import { Activity, Droplets, Zap, Scale, Heart, RotateCcw, Calculator } from 'lucide-react';

export const ElectrolytesGeneralCalcs: React.FC = () => {
  const [selectedCalc, setSelectedCalc] = useState<
    'ag' | 'corrna' | 'corrca' | 'fwd' | 'bmi' | 'map' | 'shockindex' | 'qtc'
  >('ag');

  // Anion Gap
  const [agNa, setAgNa] = useState(140);
  const [agCl, setAgCl] = useState(102);
  const [agHco3, setAgHco3] = useState(24);
  const [agResult, setAgResult] = useState<CalcResult | null>(null);

  // Corrected Sodium
  const [naMeasured, setNaMeasured] = useState(128);
  const [glucose, setGlucose] = useState(450);
  const [corrNaResult, setCorrNaResult] = useState<CalcResult | null>(null);

  // Corrected Calcium
  const [caMeasured, setCaMeasured] = useState(7.8);
  const [albumin, setAlbumin] = useState(2.5);
  const [corrCaResult, setCorrCaResult] = useState<CalcResult | null>(null);

  // Free Water Deficit
  const [fwdWeight, setFwdWeight] = useState(70);
  const [fwdNa, setFwdNa] = useState(158);
  const [fwdFemale, setFwdFemale] = useState(false);
  const [fwdElderly, setFwdElderly] = useState(false);
  const [fwdResult, setFwdResult] = useState<CalcResult | null>(null);

  // BMI
  const [bmiWeight, setBmiWeight] = useState(75);
  const [bmiHeight, setBmiHeight] = useState(175);
  const [bmiResult, setBmiResult] = useState<CalcResult | null>(null);

  // MAP
  const [mapSbp, setMapSbp] = useState(120);
  const [mapDbp, setMapDbp] = useState(80);
  const [mapResult, setMapResult] = useState<CalcResult | null>(null);

  // Shock Index
  const [siHr, setSiHr] = useState(105);
  const [siSbp, setSiSbp] = useState(95);
  const [siResult, setSiResult] = useState<CalcResult | null>(null);

  // QTc
  const [qtInterval, setQtInterval] = useState(420);
  const [qtHr, setQtHr] = useState(75);
  const [qtcResult, setQtcResult] = useState<CalcResult | null>(null);

  const runAg = () => setAgResult(calculateAnionGap(agNa, agCl, agHco3));
  const resetAg = () => {
    setAgNa(140); setAgCl(102); setAgHco3(24);
    setAgResult(null);
  };

  const runCorrNa = () => setCorrNaResult(calculateCorrectedSodium(naMeasured, glucose));
  const resetCorrNa = () => {
    setNaMeasured(128); setGlucose(450);
    setCorrNaResult(null);
  };

  const runCorrCa = () => setCorrCaResult(calculateCorrectedCalcium(caMeasured, albumin));
  const resetCorrCa = () => {
    setCaMeasured(7.8); setAlbumin(2.5);
    setCorrCaResult(null);
  };

  const runFwd = () => setFwdResult(calculateFreeWaterDeficit(fwdWeight, fwdNa, fwdFemale, fwdElderly));
  const resetFwd = () => {
    setFwdWeight(70); setFwdNa(158); setFwdFemale(false); setFwdElderly(false);
    setFwdResult(null);
  };

  const runBmi = () => setBmiResult(calculateBMI(bmiWeight, bmiHeight));
  const resetBmi = () => {
    setBmiWeight(75); setBmiHeight(175);
    setBmiResult(null);
  };

  const runMap = () => setMapResult(calculateMAP(mapSbp, mapDbp));
  const resetMap = () => {
    setMapSbp(120); setMapDbp(80);
    setMapResult(null);
  };

  const runSi = () => setSiResult(calculateShockIndex(siHr, siSbp));
  const resetSi = () => {
    setSiHr(105); setSiSbp(95);
    setSiResult(null);
  };

  const runQtc = () => setQtcResult(calculateQTc(qtInterval, qtHr));
  const resetQtc = () => {
    setQtInterval(420); setQtHr(75);
    setQtcResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'ag', label: 'Anion Gap', icon: Zap },
          { id: 'corrna', label: 'Corrected Na⁺', icon: Droplets },
          { id: 'corrca', label: 'Corrected Ca²⁺', icon: Droplets },
          { id: 'fwd', label: 'Free Water Deficit', icon: Droplets },
          { id: 'bmi', label: 'BMI', icon: Scale },
          { id: 'map', label: 'MAP', icon: Heart },
          { id: 'shockindex', label: 'Shock Index', icon: Activity },
          { id: 'qtc', label: 'QTc Interval', icon: Heart },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCalc(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCalc === t.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Anion Gap */}
      {selectedCalc === 'ag' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Serum Anion Gap [Na⁺ - (Cl⁻ + HCO₃⁻)]</h4>
            <div className="flex gap-2">
              <button onClick={resetAg} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runAg} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Sodium Na⁺ (mEq/L)</label>
              <input type="number" value={agNa} onChange={e => setAgNa(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Chloride Cl⁻ (mEq/L)</label>
              <input type="number" value={agCl} onChange={e => setAgCl(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Bicarbonate HCO₃⁻ (mEq/L)</label>
              <input type="number" value={agHco3} onChange={e => setAgHco3(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {agResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Anion Gap:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{agResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{agResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* Corrected Sodium */}
      {selectedCalc === 'corrna' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Corrected Sodium in Hyperglycemia</h4>
            <div className="flex gap-2">
              <button onClick={resetCorrNa} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runCorrNa} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Measured Serum Sodium (mEq/L)</label>
              <input type="number" value={naMeasured} onChange={e => setNaMeasured(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Glucose (mg/dL)</label>
              <input type="number" value={glucose} onChange={e => setGlucose(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {corrNaResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-amber-400">{corrNaResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* Corrected Calcium */}
      {selectedCalc === 'corrca' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Corrected Calcium for Hypoalbuminemia</h4>
            <div className="flex gap-2">
              <button onClick={resetCorrCa} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runCorrCa} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Measured Total Calcium (mg/dL)</label>
              <input type="number" step="0.1" value={caMeasured} onChange={e => setCaMeasured(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Albumin (g/dL)</label>
              <input type="number" step="0.1" value={albumin} onChange={e => setAlbumin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {corrCaResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Corrected Calcium:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{corrCaResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{corrCaResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* Free Water Deficit */}
      {selectedCalc === 'fwd' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Free Water Deficit in Hypernatremia</h4>
            <div className="flex gap-2">
              <button onClick={resetFwd} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runFwd} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Weight (kg)</label>
              <input type="number" value={fwdWeight} onChange={e => setFwdWeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Sodium (mEq/L)</label>
              <input type="number" value={fwdNa} onChange={e => setFwdNa(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          <div className="flex gap-4 text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={fwdFemale} onChange={e => setFwdFemale(e.target.checked)} />
              Female
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={fwdElderly} onChange={e => setFwdElderly(e.target.checked)} />
              Elderly (Reduced total body water fraction)
            </label>
          </div>

          {fwdResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-amber-400">{fwdResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* BMI */}
      {selectedCalc === 'bmi' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Body Mass Index (BMI)</h4>
            <div className="flex gap-2">
              <button onClick={resetBmi} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runBmi} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Weight (kg)</label>
              <input type="number" value={bmiWeight} onChange={e => setBmiWeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Height (cm)</label>
              <input type="number" value={bmiHeight} onChange={e => setBmiHeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
          </div>

          {bmiResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">BMI:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{bmiResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{bmiResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* MAP */}
      {selectedCalc === 'map' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Mean Arterial Pressure (MAP) [(2×DBP + SBP) / 3]</h4>
            <div className="flex gap-2">
              <button onClick={resetMap} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runMap} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Systolic Blood Pressure (mmHg)</label>
              <input type="number" value={mapSbp} onChange={e => setMapSbp(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Diastolic Blood Pressure (mmHg)</label>
              <input type="number" value={mapDbp} onChange={e => setMapDbp(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {mapResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Mean Arterial Pressure:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{mapResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{mapResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* Shock Index */}
      {selectedCalc === 'shockindex' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Shock Index (Heart Rate / Systolic BP)</h4>
            <div className="flex gap-2">
              <button onClick={resetSi} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runSi} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Heart Rate (bpm)</label>
              <input type="number" value={siHr} onChange={e => setSiHr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Systolic Blood Pressure (mmHg)</label>
              <input type="number" value={siSbp} onChange={e => setSiSbp(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {siResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Shock Index:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{siResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{siResult.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* QTc */}
      {selectedCalc === 'qtc' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Corrected QT Interval (QTc - Bazett & Fridericia)</h4>
            <div className="flex gap-2">
              <button onClick={resetQtc} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runQtc} className="flex items-center gap-1 text-xs text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 rounded border border-amber-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Measured QT Interval (ms)</label>
              <input type="number" value={qtInterval} onChange={e => setQtInterval(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Heart Rate (bpm)</label>
              <input type="number" value={qtHr} onChange={e => setQtHr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono" />
            </div>
          </div>

          {qtcResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Bazett QTc:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{qtcResult.score}</span>
              </div>
              <p className="text-slate-300 mt-1">{qtcResult.interpretation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
