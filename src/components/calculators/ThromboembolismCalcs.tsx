import React, { useState } from 'react';
import {
  calculateWellsPE,
  calculateWellsDVT,
  calculatePERC,
  calculatePESI,
  CalcResult
} from '../../utils/calculators';
import { ShieldAlert, Activity, CheckCircle, RotateCcw, Calculator } from 'lucide-react';

export const ThromboembolismCalcs: React.FC = () => {
  const [selectedCalc, setSelectedCalc] = useState<'wellspe' | 'wellsdvt' | 'perc' | 'pesi'>('wellspe');

  // Wells PE
  const [dvtSigns, setDvtSigns] = useState(false);
  const [peLikely, setPeLikely] = useState(false);
  const [hr100, setHr100] = useState(false);
  const [immobility, setImmobility] = useState(false);
  const [priorDvtPe, setPriorDvtPe] = useState(false);
  const [hemoptysis, setHemoptysis] = useState(false);
  const [malignancy, setMalignancy] = useState(false);
  const [wellsPeResult, setWellsPeResult] = useState<CalcResult | null>(null);

  // Wells DVT
  const [dvtCancer, setDvtCancer] = useState(false);
  const [dvtParalysis, setDvtParalysis] = useState(false);
  const [dvtBedridden, setDvtBedridden] = useState(false);
  const [dvtTenderness, setDvtTenderness] = useState(false);
  const [dvtLegSwollen, setDvtLegSwollen] = useState(false);
  const [dvtCalf3cm, setDvtCalf3cm] = useState(false);
  const [dvtPitting, setDvtPitting] = useState(false);
  const [dvtCollateral, setDvtCollateral] = useState(false);
  const [dvtAltDx, setDvtAltDx] = useState(false);
  const [wellsDvtResult, setWellsDvtResult] = useState<CalcResult | null>(null);

  // PERC
  const [percAge50, setPercAge50] = useState(false);
  const [percHr100, setPercHr100] = useState(false);
  const [percSpo295, setPercSpo295] = useState(false);
  const [percLegSwelling, setPercLegSwelling] = useState(false);
  const [percHemoptysis, setPercHemoptysis] = useState(false);
  const [percSurgery, setPercSurgery] = useState(false);
  const [percPrior, setPercPrior] = useState(false);
  const [percHormone, setPercHormone] = useState(false);
  const [percResult, setPercResult] = useState<CalcResult | null>(null);

  // PESI
  const [pesiAge, setPesiAge] = useState(65);
  const [pesiMale, setPesiMale] = useState(true);
  const [pesiCancer, setPesiCancer] = useState(false);
  const [pesiHf, setPesiHf] = useState(false);
  const [pesiLung, setPesiLung] = useState(false);
  const [pesiHr110, setPesiHr110] = useState(false);
  const [pesiSbp100, setPesiSbp100] = useState(false);
  const [pesiRr30, setPesiRr30] = useState(false);
  const [pesiTemp36, setPesiTemp36] = useState(false);
  const [pesiAltered, setPesiAltered] = useState(false);
  const [pesiSpo290, setPesiSpo290] = useState(false);
  const [pesiResult, setPesiResult] = useState<CalcResult | null>(null);

  const runWellsPe = () => setWellsPeResult(calculateWellsPE({
    dvtSigns, peLikely, hr100, immobilitySurgery: immobility, priorDvtPe, hemoptysis, malignancy
  }));
  const resetWellsPe = () => {
    setDvtSigns(false); setPeLikely(false); setHr100(false); setImmobility(false);
    setPriorDvtPe(false); setHemoptysis(false); setMalignancy(false);
    setWellsPeResult(null);
  };

  const runWellsDvt = () => setWellsDvtResult(calculateWellsDVT({
    activeCancer: dvtCancer, paralysisParesis: dvtParalysis, bedriddenSurgery: dvtBedridden,
    localizedTenderness: dvtTenderness, entireLegSwollen: dvtLegSwollen, calfSwelling3cm: dvtCalf3cm,
    pittingEdema: dvtPitting, collateralVeins: dvtCollateral, altDiagnosisLikely: dvtAltDx
  }));
  const resetWellsDvt = () => {
    setDvtCancer(false); setDvtParalysis(false); setDvtBedridden(false);
    setDvtTenderness(false); setDvtLegSwollen(false); setDvtCalf3cm(false);
    setDvtPitting(false); setDvtCollateral(false); setDvtAltDx(false);
    setWellsDvtResult(null);
  };

  const runPerc = () => setPercResult(calculatePERC({
    age50: percAge50, hr100: percHr100, spo295: percSpo295, legSwelling: percLegSwelling,
    hemoptysis: percHemoptysis, surgeryTrauma: percSurgery, priorPeDvt: percPrior, hormoneUse: percHormone
  }));
  const resetPerc = () => {
    setPercAge50(false); setPercHr100(false); setPercSpo295(false); setPercLegSwelling(false);
    setPercHemoptysis(false); setPercSurgery(false); setPercPrior(false); setPercHormone(false);
    setPercResult(null);
  };

  const runPesi = () => setPesiResult(calculatePESI({
    age: pesiAge, male: pesiMale, cancer: pesiCancer, hf: pesiHf, lungDisease: pesiLung,
    hr110: pesiHr110, sbp100: pesiSbp100, rr30: pesiRr30, temp36: pesiTemp36,
    alteredMental: pesiAltered, spo290: pesiSpo290
  }));
  const resetPesi = () => {
    setPesiAge(65); setPesiMale(true); setPesiCancer(false); setPesiHf(false); setPesiLung(false);
    setPesiHr110(false); setPesiSbp100(false); setPesiRr30(false); setPesiTemp36(false);
    setPesiAltered(false); setPesiSpo290(false);
    setPesiResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'wellspe', label: 'Wells PE', icon: ShieldAlert },
          { id: 'wellsdvt', label: 'Wells DVT', icon: Activity },
          { id: 'perc', label: 'PERC Rule', icon: CheckCircle },
          { id: 'pesi', label: 'PESI Score', icon: ShieldAlert },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedCalc(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCalc === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Wells PE */}
      {selectedCalc === 'wellspe' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Wells Criteria for Pulmonary Embolism (PE)</h4>
            <div className="flex gap-2">
              <button onClick={resetWellsPe} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runWellsPe} className="flex items-center gap-1 text-xs text-blue-300 font-semibold px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 rounded border border-blue-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { checked: dvtSigns, set: setDvtSigns, label: 'Clinical signs and symptoms of DVT (+3.0)' },
              { checked: peLikely, set: setPeLikely, label: 'PE is #1 diagnosis OR equally likely (+3.0)' },
              { checked: hr100, set: setHr100, label: 'Heart rate > 100 bpm (+1.5)' },
              { checked: immobility, set: setImmobility, label: 'Immobilization ≥ 3 consecutive days OR surgery in past 4 weeks (+1.5)' },
              { checked: priorDvtPe, set: setPriorDvtPe, label: 'Previous historically confirmed DVT or PE (+1.5)' },
              { checked: hemoptysis, set: setHemoptysis, label: 'Hemoptysis (+1.0)' },
              { checked: malignancy, set: setMalignancy, label: 'Malignancy with treatment within 6 months or palliative (+1.0)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {wellsPeResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-blue-400">{wellsPeResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* Wells DVT */}
      {selectedCalc === 'wellsdvt' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">Wells Criteria for Deep Vein Thrombosis (DVT)</h4>
            <div className="flex gap-2">
              <button onClick={resetWellsDvt} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runWellsDvt} className="flex items-center gap-1 text-xs text-blue-300 font-semibold px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 rounded border border-blue-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { checked: dvtCancer, set: setDvtCancer, label: 'Active cancer (ongoing, within 6m, or palliative) (+1)' },
              { checked: dvtParalysis, set: setDvtParalysis, label: 'Paralysis, paresis, or recent plaster cast of lower extremity (+1)' },
              { checked: dvtBedridden, set: setDvtBedridden, label: 'Recently bedridden > 3 days or major surgery in past 12 weeks (+1)' },
              { checked: dvtTenderness, set: setDvtTenderness, label: 'Localized tenderness along deep venous system (+1)' },
              { checked: dvtLegSwollen, set: setDvtLegSwollen, label: 'Entire leg swollen (+1)' },
              { checked: dvtCalf3cm, set: setDvtCalf3cm, label: 'Calf swelling > 3 cm compared to asymptomatic leg (+1)' },
              { checked: dvtPitting, set: setDvtPitting, label: 'Pitting edema confined to symptomatic leg (+1)' },
              { checked: dvtCollateral, set: setDvtCollateral, label: 'Collateral superficial non-varicose veins (+1)' },
              { checked: dvtAltDx, set: setDvtAltDx, label: 'Alternative diagnosis at least as likely as DVT (-2)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {wellsDvtResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-blue-400">{wellsDvtResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* PERC */}
      {selectedCalc === 'perc' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">PERC Rule (PE Rule-out Criteria)</h4>
            <div className="flex gap-2">
              <button onClick={resetPerc} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runPerc} className="flex items-center gap-1 text-xs text-blue-300 font-semibold px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 rounded border border-blue-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            For patients with low pretest clinical suspicion of PE. Check all that apply:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { checked: percAge50, set: setPercAge50, label: 'Age ≥ 50 years' },
              { checked: percHr100, set: setPercHr100, label: 'Pulse ≥ 100 bpm' },
              { checked: percSpo295, set: setPercSpo295, label: 'SaO₂ on room air < 95%' },
              { checked: percLegSwelling, set: setPercLegSwelling, label: 'Unilateral leg swelling' },
              { checked: percHemoptysis, set: setPercHemoptysis, label: 'Hemoptysis' },
              { checked: percSurgery, set: setPercSurgery, label: 'Recent surgery or trauma within 4 weeks' },
              { checked: percPrior, set: setPercPrior, label: 'Prior history of PE or DVT' },
              { checked: percHormone, set: setPercHormone, label: 'Exogenous estrogen / hormone use' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {percResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-blue-400">{percResult.interpretation}</span>
            </div>
          )}
        </div>
      )}

      {/* PESI */}
      {selectedCalc === 'pesi' && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200">PESI Score (Pulmonary Embolism Severity Index)</h4>
            <div className="flex gap-2">
              <button onClick={resetPesi} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button onClick={runPesi} className="flex items-center gap-1 text-xs text-blue-300 font-semibold px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 rounded border border-blue-800">
                <Calculator className="w-3 h-3" /> Calculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Patient Age:</span>
              <input
                type="number"
                value={pesiAge}
                onChange={e => setPesiAge(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-center"
              />
            </div>
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={pesiMale} onChange={e => setPesiMale(e.target.checked)} />
              Male (+10 pts)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { checked: pesiCancer, set: setPesiCancer, label: 'History of cancer (+30)' },
              { checked: pesiHf, set: setPesiHf, label: 'Chronic heart failure (+10)' },
              { checked: pesiLung, set: setPesiLung, label: 'Chronic lung disease (+10)' },
              { checked: pesiHr110, set: setPesiHr110, label: 'Pulse ≥ 110 bpm (+20)' },
              { checked: pesiSbp100, set: setPesiSbp100, label: 'Systolic BP < 100 mmHg (+30)' },
              { checked: pesiRr30, set: setPesiRr30, label: 'Respiratory rate ≥ 30 bpm (+20)' },
              { checked: pesiTemp36, set: setPesiTemp36, label: 'Temperature < 36°C (+20)' },
              { checked: pesiAltered, set: setPesiAltered, label: 'Altered mental status (+60)' },
              { checked: pesiSpo290, set: setPesiSpo290, label: 'Arterial SpO₂ < 90% (+20)' },
            ].map((it, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <input type="checkbox" checked={it.checked} onChange={e => it.set(e.target.checked)} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>

          {pesiResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-blue-400">{pesiResult.interpretation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
