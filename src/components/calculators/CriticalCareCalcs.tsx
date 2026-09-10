import React, { useState } from 'react';
import { calculateGCS, calculateSOFA, calculateQSOFA, calculateAPACHEII, CalcResult } from '../../utils/calculators';
import { Brain, Flame, Activity, ShieldAlert, RotateCcw, Calculator } from 'lucide-react';

export const CriticalCareCalcs: React.FC<{
  onApplyScore?: (data: { sofa?: number; gcs?: number; rass?: number }) => void;
}> = ({ onApplyScore }) => {
  const [selectedCalc, setSelectedCalc] = useState<'gcs' | 'sofa' | 'qsofa' | 'apache'>('gcs');

  // GCS
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const [gcsResult, setGcsResult] = useState<CalcResult | null>(() => calculateGCS(4, 5, 6));

  // qSOFA
  const [rr22, setRr22] = useState(false);
  const [alteredGcs, setAlteredGcs] = useState(false);
  const [sbp100, setSbp100] = useState(false);
  const [qsofaResult, setQsofaResult] = useState<CalcResult | null>(() => calculateQSOFA(false, false, false));

  // SOFA
  const [pao2fio2, setPao2fio2] = useState(350);
  const [ventilated, setVentilated] = useState(false);
  const [platelets, setPlatelets] = useState(200);
  const [bilirubin, setBilirubin] = useState(0.8);
  const [mapVal, setMapVal] = useState(75);
  const [vasopressor, setVasopressor] = useState(0);
  const [sofaGcs, setSofaGcs] = useState(15);
  const [creatinine, setCreatinine] = useState(1.0);
  const [sofaResult, setSofaResult] = useState<CalcResult | null>(null);

  // APACHE II
  const [apAge, setApAge] = useState(65);
  const [apTemp, setApTemp] = useState(37.0);
  const [apMap, setApMap] = useState(85);
  const [apHr, setApHr] = useState(88);
  const [apRr, setApRr] = useState(18);
  const [apPao2, setApPao2] = useState(80);
  const [apFio2, setApFio2] = useState(0.21);
  const [apPh, setApPh] = useState(7.40);
  const [apNa, setApNa] = useState(140);
  const [apK, setApK] = useState(4.2);
  const [apCr, setApCr] = useState(1.0);
  const [apArf, setApArf] = useState(false);
  const [apHct, setApHct] = useState(40);
  const [apWbc, setApWbc] = useState(8.5);
  const [apGcs, setApGcs] = useState(15);
  const [apChronic, setApChronic] = useState<'none' | 'electivePostOp' | 'emergencyPostOpOrNonOp'>('none');
  const [apacheResult, setApacheResult] = useState<CalcResult | null>(null);

  const runGcs = () => setGcsResult(calculateGCS(eye, verbal, motor));
  const resetGcs = () => {
    setEye(4); setVerbal(5); setMotor(6);
    setGcsResult(calculateGCS(4, 5, 6));
  };

  const runQsofa = () => setQsofaResult(calculateQSOFA(rr22, alteredGcs, sbp100));
  const resetQsofa = () => {
    setRr22(false); setAlteredGcs(false); setSbp100(false);
    setQsofaResult(calculateQSOFA(false, false, false));
  };

  const runSofa = () => {
    setSofaResult(calculateSOFA({
      pao2fio2, ventilated, platelets, bilirubin, map: mapVal, vasopressor, gcs: sofaGcs, creatinine
    }));
  };
  const resetSofa = () => {
    setPao2fio2(350); setVentilated(false); setPlatelets(200); setBilirubin(0.8);
    setMapVal(75); setVasopressor(0); setSofaGcs(15); setCreatinine(1.0);
    setSofaResult(null);
  };

  const runApache = () => {
    setApacheResult(calculateAPACHEII({
      age: apAge, temp: apTemp, map: apMap, hr: apHr, rr: apRr, pao2: apPao2, fio2: apFio2,
      ph: apPh, na: apNa, k: apK, cr: apCr, acuteRenalFailure: apArf, hct: apHct,
      wbc: apWbc, gcs: apGcs, chronicOrganFailure: apChronic
    }));
  };
  const resetApache = () => {
    setApAge(65); setApTemp(37.0); setApMap(85); setApHr(88); setApRr(18); setApPao2(80);
    setApFio2(0.21); setApPh(7.40); setApNa(140); setApK(4.2); setApCr(1.0); setApArf(false);
    setApHct(40); setApWbc(8.5); setApGcs(15); setApChronic('none');
    setApacheResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'gcs', label: 'GCS', icon: Brain },
          { id: 'qsofa', label: 'qSOFA', icon: ShieldAlert },
          { id: 'sofa', label: 'SOFA', icon: Flame },
          { id: 'apache', label: 'APACHE II', icon: Activity },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCalc(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCalc === t.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* GCS */}
      {selectedCalc === 'gcs' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Glasgow Coma Scale (GCS)</h4>
            <div className="flex gap-2">
              <button onClick={resetGcs} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runGcs} className="flex items-center gap-1 text-xs text-emerald-300 font-semibold px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 rounded border border-emerald-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Eye Opening (1-4)</label>
              <select value={eye} onChange={e => setEye(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200">
                <option value={4}>4 - Spontaneous</option>
                <option value={3}>3 - To speech / sound</option>
                <option value={2}>2 - To pressure / pain</option>
                <option value={1}>1 - None</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Verbal Response (1-5)</label>
              <select value={verbal} onChange={e => setVerbal(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200">
                <option value={5}>5 - Oriented</option>
                <option value={4}>4 - Confused</option>
                <option value={3}>3 - Inappropriate words</option>
                <option value={2}>2 - Incomprehensible sounds</option>
                <option value={1}>1 - None (or Intubated)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Motor Response (1-6)</label>
              <select value={motor} onChange={e => setMotor(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200">
                <option value={6}>6 - Obeys commands</option>
                <option value={5}>5 - Localizes to pain</option>
                <option value={4}>4 - Normal flexion (withdrawal)</option>
                <option value={3}>3 - Abnormal flexion (decorticate)</option>
                <option value={2}>2 - Extension (decerebrate)</option>
                <option value={1}>1 - None (flaccid)</option>
              </select>
            </div>
          </div>

          {gcsResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Score:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono ml-2">{gcsResult.score} / 15</span>
                <p className="text-xs text-slate-300 mt-0.5">{gcsResult.interpretation}</p>
              </div>
              {onApplyScore && (
                <button
                  onClick={() => onApplyScore({ gcs: Number(gcsResult.score) })}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  Apply to Patient
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* qSOFA */}
      {selectedCalc === 'qsofa' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Quick SOFA (qSOFA) Score for Sepsis</h4>
            <div className="flex gap-2">
              <button onClick={resetQsofa} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runQsofa} className="flex items-center gap-1 text-xs text-emerald-300 font-semibold px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 rounded border border-emerald-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { checked: rr22, set: setRr22, label: 'Respiratory Rate ≥ 22 breaths/min' },
              { checked: alteredGcs, set: setAlteredGcs, label: 'Altered mentation (GCS < 15)' },
              { checked: sbp100, set: setSbp100, label: 'Systolic Blood Pressure ≤ 100 mmHg' },
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-2.5 p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={e => item.set(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {qsofaResult && (
            <div className={`mt-3 p-3 rounded-lg border ${qsofaResult.category === 'critical' ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
              <div className="text-xs font-semibold">{qsofaResult.interpretation}</div>
            </div>
          )}
        </div>
      )}

      {/* SOFA */}
      {selectedCalc === 'sofa' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Sequential Organ Failure Assessment (SOFA)</h4>
            <div className="flex gap-2">
              <button onClick={resetSofa} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runSofa} className="flex items-center gap-1 text-xs text-emerald-300 font-semibold px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 rounded border border-emerald-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">PaO₂/FiO₂ Ratio</label>
              <input type="number" value={pao2fio2} onChange={e => setPao2fio2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
              <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <input type="checkbox" checked={ventilated} onChange={e => setVentilated(e.target.checked)} />
                Mechanically ventilated
              </label>
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Platelets (×10³/µL)</label>
              <input type="number" value={platelets} onChange={e => setPlatelets(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Bilirubin (mg/dL)</label>
              <input type="number" step="0.1" value={bilirubin} onChange={e => setBilirubin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Creatinine (mg/dL)</label>
              <input type="number" step="0.1" value={creatinine} onChange={e => setCreatinine(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">MAP (mmHg)</label>
              <input type="number" value={mapVal} onChange={e => setMapVal(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Vasopressor Infusion</label>
              <select value={vasopressor} onChange={e => setVasopressor(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs">
                <option value={0}>None (MAP ≥ 70)</option>
                <option value={1}>Dopamine ≤ 5 or Dobutamine</option>
                <option value={2}>Dopamine &gt; 5 or Norepi ≤ 0.1</option>
                <option value={3}>Norepinephrine &gt; 0.1 µg/kg/min</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">GCS Score (3-15)</label>
              <input type="number" min={3} max={15} value={sofaGcs} onChange={e => setSofaGcs(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
          </div>

          {sofaResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">SOFA Points:</span>
                <span className="text-lg font-bold text-amber-400 font-mono ml-2">{sofaResult.score}</span>
                <p className="text-xs text-slate-300 mt-0.5">{sofaResult.interpretation}</p>
              </div>
              {onApplyScore && (
                <button
                  onClick={() => onApplyScore({ sofa: Number(sofaResult.score) })}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  Apply to Patient
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* APACHE II */}
      {selectedCalc === 'apache' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">APACHE II Severity of Disease Score</h4>
            <div className="flex gap-2">
              <button onClick={resetApache} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runApache} className="flex items-center gap-1 text-xs text-emerald-300 font-semibold px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 rounded border border-emerald-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Age</label>
              <input type="number" value={apAge} onChange={e => setApAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Temp (°C)</label>
              <input type="number" step="0.1" value={apTemp} onChange={e => setApTemp(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">MAP (mmHg)</label>
              <input type="number" value={apMap} onChange={e => setApMap(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Heart Rate</label>
              <input type="number" value={apHr} onChange={e => setApHr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Resp Rate</label>
              <input type="number" value={apRr} onChange={e => setApRr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">PaO₂ (mmHg)</label>
              <input type="number" value={apPao2} onChange={e => setApPao2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">FiO₂ (0.21 - 1.0)</label>
              <input type="number" step="0.05" value={apFio2} onChange={e => setApFio2(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Arterial pH</label>
              <input type="number" step="0.01" value={apPh} onChange={e => setApPh(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum Na (mEq/L)</label>
              <input type="number" value={apNa} onChange={e => setApNa(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Serum K (mEq/L)</label>
              <input type="number" step="0.1" value={apK} onChange={e => setApK(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Creatinine (mg/dL)</label>
              <input type="number" step="0.1" value={apCr} onChange={e => setApCr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">GCS Score</label>
              <input type="number" min={3} max={15} value={apGcs} onChange={e => setApGcs(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <label className="flex items-center gap-1.5 text-slate-300">
              <input type="checkbox" checked={apArf} onChange={e => setApArf(e.target.checked)} />
              Acute Renal Failure (Double Cr points)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Chronic Organ Insufficiency:</span>
              <select value={apChronic} onChange={e => setApChronic(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value="none">None (0 pts)</option>
                <option value="electivePostOp">Elective post-op (2 pts)</option>
                <option value="emergencyPostOpOrNonOp">Emergency post-op / non-op (5 pts)</option>
              </select>
            </div>
          </div>

          {apacheResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">APACHE II Score:</span>
              <span className="text-lg font-bold text-amber-400 font-mono ml-2">{apacheResult.score}</span>
              <p className="text-xs text-slate-300 mt-0.5">{apacheResult.interpretation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
