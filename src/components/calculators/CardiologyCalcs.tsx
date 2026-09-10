import React, { useState } from 'react';
import {
  calculateCHA2DS2VASc,
  calculateHASBLED,
  calculateTIMI,
  calculateGRACE,
  calculateHEART,
  CalcResult
} from '../../utils/calculators';
import { Heart, ShieldCheck, Activity, AlertTriangle, RotateCcw, Calculator } from 'lucide-react';

export const CardiologyCalcs: React.FC = () => {
  const [selectedCalc, setSelectedCalc] = useState<'cha2ds2' | 'hasbled' | 'timi' | 'grace' | 'heart'>('cha2ds2');

  // CHA2DS2-VASc
  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(true);
  const [age, setAge] = useState(68);
  const [diabetes, setDiabetes] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [vascular, setVascular] = useState(false);
  const [female, setFemale] = useState(false);
  const [chaResult, setChaResult] = useState<CalcResult | null>(null);

  // HAS-BLED
  const [hbHtn, setHbHtn] = useState(false);
  const [hbRenal, setHbRenal] = useState(false);
  const [hbLiver, setHbLiver] = useState(false);
  const [hbStroke, setHbStroke] = useState(false);
  const [hbPriorBleed, setHbPriorBleed] = useState(false);
  const [hbLabileInr, setHbLabileInr] = useState(false);
  const [hbAge65, setHbAge65] = useState(false);
  const [hbDrugs, setHbDrugs] = useState(false);
  const [hbAlcohol, setHbAlcohol] = useState(false);
  const [hasbledResult, setHasbledResult] = useState<CalcResult | null>(null);

  // TIMI
  const [timiAge65, setTimiAge65] = useState(false);
  const [timiRisk3, setTimiRisk3] = useState(false);
  const [timiCad50, setTimiCad50] = useState(false);
  const [timiAsa, setTimiAsa] = useState(false);
  const [timiAngina24, setTimiAngina24] = useState(false);
  const [timiMarkers, setTimiMarkers] = useState(false);
  const [timiSt, setTimiSt] = useState(false);
  const [timiResult, setTimiResult] = useState<CalcResult | null>(null);

  // GRACE
  const [grAge, setGrAge] = useState(62);
  const [grHr, setGrHr] = useState(84);
  const [grSbp, setGrSbp] = useState(130);
  const [grCr, setGrCr] = useState(1.1);
  const [grKillip, setGrKillip] = useState<1 | 2 | 3 | 4>(1);
  const [grCardiacArrest, setGrCardiacArrest] = useState(false);
  const [grSt, setGrSt] = useState(false);
  const [grMarkers, setGrMarkers] = useState(true);
  const [graceResult, setGraceResult] = useState<CalcResult | null>(null);

  // HEART
  const [heartHistory, setHeartHistory] = useState(1);
  const [heartEcg, setHeartEcg] = useState(1);
  const [heartAge, setHeartAge] = useState(1);
  const [heartRisk, setHeartRisk] = useState(1);
  const [heartTrop, setHeartTrop] = useState(0);
  const [heartResult, setHeartResult] = useState<CalcResult | null>(null);

  const runCha = () => setChaResult(calculateCHA2DS2VASc({ chf, htn, age, diabetes, stroke, vascular, female }));
  const resetCha = () => {
    setChf(false); setHtn(false); setAge(65); setDiabetes(false); setStroke(false); setVascular(false); setFemale(false);
    setChaResult(null);
  };

  const runHasbled = () => setHasbledResult(calculateHASBLED({
    htn: hbHtn, renal: hbRenal, liver: hbLiver, stroke: hbStroke,
    priorBleed: hbPriorBleed, labileInr: hbLabileInr, age65: hbAge65, drugs: hbDrugs, alcohol: hbAlcohol
  }));
  const resetHasbled = () => {
    setHbHtn(false); setHbRenal(false); setHbLiver(false); setHbStroke(false);
    setHbPriorBleed(false); setHbLabileInr(false); setHbAge65(false); setHbDrugs(false); setHbAlcohol(false);
    setHasbledResult(null);
  };

  const runTimi = () => setTimiResult(calculateTIMI({
    age65: timiAge65, riskFactors3: timiRisk3, knownCad50: timiCad50, aspirinPast7d: timiAsa,
    severeAngina24h: timiAngina24, elevatedMarkers: timiMarkers, stDeviation: timiSt
  }));
  const resetTimi = () => {
    setTimiAge65(false); setTimiRisk3(false); setTimiCad50(false); setTimiAsa(false);
    setTimiAngina24(false); setTimiMarkers(false); setTimiSt(false);
    setTimiResult(null);
  };

  const runGrace = () => setGraceResult(calculateGRACE({
    age: grAge, hr: grHr, sbp: grSbp, creatinine: grCr, killip: grKillip,
    cardiacArrest: grCardiacArrest, stDeviation: grSt, elevatedMarkers: grMarkers
  }));
  const resetGrace = () => {
    setGrAge(60); setGrHr(80); setGrSbp(120); setGrCr(1.0); setGrKillip(1);
    setGrCardiacArrest(false); setGrSt(false); setGrMarkers(false);
    setGraceResult(null);
  };

  const runHeart = () => setHeartResult(calculateHEART(heartHistory, heartEcg, heartAge, heartRisk, heartTrop));
  const resetHeart = () => {
    setHeartHistory(1); setHeartEcg(1); setHeartAge(1); setHeartRisk(1); setHeartTrop(0);
    setHeartResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'cha2ds2', label: 'CHA₂DS₂-VASc', icon: Heart },
          { id: 'hasbled', label: 'HAS-BLED', icon: ShieldCheck },
          { id: 'timi', label: 'TIMI (NSTEMI)', icon: Activity },
          { id: 'grace', label: 'GRACE Score', icon: AlertTriangle },
          { id: 'heart', label: 'HEART Score', icon: Heart },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCalc(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCalc === t.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CHA2DS2-VASc */}
      {selectedCalc === 'cha2ds2' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">CHA₂DS₂-VASc Stroke Risk in Atrial Fibrillation</h4>
            <div className="flex gap-2">
              <button onClick={resetCha} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runCha} className="flex items-center gap-1 text-xs text-rose-300 font-semibold px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900/80 rounded border border-rose-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={chf} onChange={e => setChf(e.target.checked)} />
              <span>Congestive Heart Failure / LVEF ≤ 40% (+1)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={htn} onChange={e => setHtn(e.target.checked)} />
              <span>Hypertension (+1)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={diabetes} onChange={e => setDiabetes(e.target.checked)} />
              <span>Diabetes Mellitus (+1)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={stroke} onChange={e => setStroke(e.target.checked)} />
              <span>Prior Stroke / TIA / Thromboembolism (+2)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={vascular} onChange={e => setVascular(e.target.checked)} />
              <span>Vascular Disease (Prior MI, PAD, aortic plaque) (+1)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <input type="checkbox" checked={female} onChange={e => setFemale(e.target.checked)} />
              <span>Female Sex (+1)</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Patient Age:</span>
            <input
              type="number"
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              className="w-20 bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-center"
            />
            <span className="text-[11px] text-slate-500">(Age ≥ 75: +2 pts | Age 65-74: +1 pt)</span>
          </div>

          {chaResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Score:</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{chaResult.score} points</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">{chaResult.interpretation}</p>
              {chaResult.details && <p className="text-xs text-slate-400 mt-0.5">{chaResult.details}</p>}
            </div>
          )}
        </div>
      )}

      {/* HAS-BLED */}
      {selectedCalc === 'hasbled' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">HAS-BLED Major Bleeding Risk</h4>
            <div className="flex gap-2">
              <button onClick={resetHasbled} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runHasbled} className="flex items-center gap-1 text-xs text-rose-300 font-semibold px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900/80 rounded border border-rose-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { checked: hbHtn, set: setHbHtn, label: 'Hypertension (SBP > 160 mmHg) (+1)' },
              { checked: hbRenal, set: setHbRenal, label: 'Abnormal Renal function (Dialysis, Cr > 2.26 mg/dL) (+1)' },
              { checked: hbLiver, set: setHbLiver, label: 'Abnormal Liver function (Cirrhosis, Bilirubin > 2x, AST/ALT > 3x) (+1)' },
              { checked: hbStroke, set: setHbStroke, label: 'Prior Stroke history (+1)' },
              { checked: hbPriorBleed, set: setHbPriorBleed, label: 'Prior Major Bleeding or Predisposition (+1)' },
              { checked: hbLabileInr, set: setHbLabileInr, label: 'Labile INR (TTR < 60% on Warfarin) (+1)' },
              { checked: hbAge65, set: setHbAge65, label: 'Elderly (Age > 65) (+1)' },
              { checked: hbDrugs, set: setHbDrugs, label: 'Medication predisposing to bleed (Antiplatelet, NSAID) (+1)' },
              { checked: hbAlcohol, set: setHbAlcohol, label: 'Alcohol excess (≥ 8 drinks/week) (+1)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {hasbledResult && (
            <div className={`mt-3 p-3 rounded-lg border ${hasbledResult.category === 'high' ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
              <div className="text-xs font-semibold">{hasbledResult.interpretation}</div>
            </div>
          )}
        </div>
      )}

      {/* TIMI */}
      {selectedCalc === 'timi' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">TIMI Risk Score for UA / NSTEMI</h4>
            <div className="flex gap-2">
              <button onClick={resetTimi} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runTimi} className="flex items-center gap-1 text-xs text-rose-300 font-semibold px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900/80 rounded border border-rose-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { checked: timiAge65, set: setTimiAge65, label: 'Age ≥ 65 years (+1)' },
              { checked: timiRisk3, set: setTimiRisk3, label: '≥ 3 CAD Risk Factors (HTN, DM, Dyslipidemia, Smoker, Family Hx) (+1)' },
              { checked: timiCad50, set: setTimiCad50, label: 'Known CAD (Coronary stenosis ≥ 50%) (+1)' },
              { checked: timiAsa, set: setTimiAsa, label: 'Aspirin use in past 7 days (+1)' },
              { checked: timiAngina24, set: setTimiAngina24, label: 'Severe angina (≥ 2 episodes in past 24h) (+1)' },
              { checked: timiMarkers, set: setTimiMarkers, label: 'Elevated cardiac serum markers (Troponin/CK-MB) (+1)' },
              { checked: timiSt, set: setTimiSt, label: 'ST-segment deviation ≥ 0.5 mm on ECG (+1)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {timiResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-rose-400">{timiResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* GRACE */}
      {selectedCalc === 'grace' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">GRACE ACS Risk Score</h4>
            <div className="flex gap-2">
              <button onClick={resetGrace} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runGrace} className="flex items-center gap-1 text-xs text-rose-300 font-semibold px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900/80 rounded border border-rose-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">Age</label>
              <input type="number" value={grAge} onChange={e => setGrAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Heart Rate</label>
              <input type="number" value={grHr} onChange={e => setGrHr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Systolic BP</label>
              <input type="number" value={grSbp} onChange={e => setGrSbp(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Creatinine (mg/dL)</label>
              <input type="number" step="0.1" value={grCr} onChange={e => setGrCr(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <label className="text-slate-400 block mb-0.5">Killip Class</label>
              <select value={grKillip} onChange={e => setGrKillip(Number(e.target.value) as any)} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200">
                <option value={1}>Class I - No signs of HF</option>
                <option value={2}>Class II - Rales, S3 gallop, elevated JVP</option>
                <option value={3}>Class III - Frank pulmonary edema</option>
                <option value={4}>Class IV - Cardiogenic shock</option>
              </select>
            </div>
            <div className="space-y-1 pt-3">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={grCardiacArrest} onChange={e => setGrCardiacArrest(e.target.checked)} />
                Cardiac arrest at presentation
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={grSt} onChange={e => setGrSt(e.target.checked)} />
                ST-segment deviation
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={grMarkers} onChange={e => setGrMarkers(e.target.checked)} />
                Elevated cardiac biomarkers
              </label>
            </div>
          </div>

          {graceResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-rose-400">{graceResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* HEART */}
      {selectedCalc === 'heart' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">HEART Score for Chest Pain</h4>
            <div className="flex gap-2">
              <button onClick={resetHeart} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runHeart} className="flex items-center gap-1 text-xs text-rose-300 font-semibold px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900/80 rounded border border-rose-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-0.5">History</label>
              <select value={heartHistory} onChange={e => setHeartHistory(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value={0}>0 - Slightly suspicious</option>
                <option value={1}>1 - Moderately suspicious</option>
                <option value={2}>2 - Highly suspicious</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">ECG</label>
              <select value={heartEcg} onChange={e => setHeartEcg(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value={0}>0 - Normal</option>
                <option value={1}>1 - Non-specific repolarization disturbance</option>
                <option value={2}>2 - Significant ST-depression</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Age</label>
              <select value={heartAge} onChange={e => setHeartAge(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value={0}>0 - &lt; 45 years</option>
                <option value={1}>1 - 45 to 64 years</option>
                <option value={2}>2 - ≥ 65 years</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Risk Factors</label>
              <select value={heartRisk} onChange={e => setHeartRisk(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value={0}>0 - No risk factors</option>
                <option value={1}>1 - 1 or 2 risk factors</option>
                <option value={2}>2 - ≥ 3 risk factors or known atherosclerotic disease</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-0.5">Troponin</label>
              <select value={heartTrop} onChange={e => setHeartTrop(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200">
                <option value={0}>0 - Normal limit</option>
                <option value={1}>1 - 1 to 3 times normal limit</option>
                <option value={2}>2 - &gt; 3 times normal limit</option>
              </select>
            </div>
          </div>

          {heartResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-rose-400">{heartResult.interpretation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
