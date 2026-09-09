import React, { useState } from 'react';
import { 
  Calculator, 
  X, 
  Activity, 
  Brain, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Check, 
  Info 
} from 'lucide-react';

interface ClinicalCalculatorsModalProps {
  onClose: () => void;
  onApplyScoreToPatient?: (data: { sofa?: number; gcs?: number; rass?: number }) => void;
}

export const ClinicalCalculatorsModal: React.FC<ClinicalCalculatorsModalProps> = ({
  onClose,
  onApplyScoreToPatient
}) => {
  const [activeTab, setActiveTab] = useState<'sofa' | 'gcs_rass' | 'abg' | 'fluid'>('sofa');

  // SOFA state
  const [pao2fio2, setPao2fio2] = useState<number>(350);
  const [onVentilator, setOnVentilator] = useState<boolean>(false);
  const [platelets, setPlatelets] = useState<number>(220);
  const [bilirubin, setBilirubin] = useState<number>(0.8);
  const [cardioSofa, setCardioSofa] = useState<number>(0); // 0 = MAP>=70, 1 = MAP<70, 2 = Dopa<=5/Dobutamine, 3 = Norepi<=0.1, 4 = Norepi>0.1
  const [gcsValue, setGcsValue] = useState<number>(15);
  const [creatinine, setCreatinine] = useState<number>(1.0);

  // GCS State
  const [gcsEye, setGcsEye] = useState<number>(4);
  const [gcsVerbal, setGcsVerbal] = useState<number>(5);
  const [gcsMotor, setGcsMotor] = useState<number>(6);
  const [rassScore, setRassScore] = useState<number>(0);

  // ABG Interpreter State
  const [abgPh, setAbgPh] = useState<number>(7.40);
  const [abgPco2, setAbgPco2] = useState<number>(40);
  const [abgHco3, setAbgHco3] = useState<number>(24);
  const [abgNa, setAbgNa] = useState<number>(140);
  const [abgCl, setAbgCl] = useState<number>(102);

  // Fluid Calculator State
  const [ivFluids, setIvFluids] = useState<number>(1500);
  const [enteralFeed, setEnteralFeed] = useState<number>(500);
  const [urineOutput, setUrineOutput] = useState<number>(1800);
  const [drainOutput, setDrainOutput] = useState<number>(0);
  const [patientWeight, setPatientWeight] = useState<number>(70);

  // SOFA calculation logic
  const calculateSofa = () => {
    let score = 0;

    // Resp
    if (pao2fio2 < 100 && onVentilator) score += 4;
    else if (pao2fio2 < 200 && onVentilator) score += 3;
    else if (pao2fio2 < 300) score += 2;
    else if (pao2fio2 < 400) score += 1;

    // Coag
    if (platelets < 20) score += 4;
    else if (platelets < 50) score += 3;
    else if (platelets < 100) score += 2;
    else if (platelets < 150) score += 1;

    // Liver (mg/dL)
    if (bilirubin >= 12.0) score += 4;
    else if (bilirubin >= 6.0) score += 3;
    else if (bilirubin >= 2.0) score += 2;
    else if (bilirubin >= 1.2) score += 1;

    // Cardio
    score += cardioSofa;

    // CNS
    if (gcsValue < 6) score += 4;
    else if (gcsValue <= 9) score += 3;
    else if (gcsValue <= 12) score += 2;
    else if (gcsValue <= 14) score += 1;

    // Renal
    if (creatinine >= 5.0) score += 4;
    else if (creatinine >= 3.5) score += 3;
    else if (creatinine >= 2.0) score += 2;
    else if (creatinine >= 1.2) score += 1;

    return score;
  };

  const currentSofa = calculateSofa();
  const getSofaMortality = (score: number) => {
    if (score <= 1) return '< 5%';
    if (score <= 3) return '~ 5 - 10%';
    if (score <= 6) return '~ 15 - 20%';
    if (score <= 9) return '~ 30 - 40%';
    if (score <= 12) return '~ 50%';
    return '> 80%';
  };

  // ABG Interpretation logic
  const interpretAbg = () => {
    const anionGap = abgNa - (abgCl + abgHco3);
    const hasHighAG = anionGap > 12;

    let primary = 'Normal arterial blood gas';
    if (abgPh < 7.35) {
      if (abgHco3 < 22 && abgPco2 <= 42) {
        primary = hasHighAG 
          ? `High Anion Gap Metabolic Acidosis (AG = ${anionGap.toFixed(1)} mmol/L)` 
          : `Normal Anion Gap (Hyperchloremic) Metabolic Acidosis (AG = ${anionGap.toFixed(1)})`;
      } else if (abgPco2 > 45) {
        primary = 'Respiratory Acidosis (CO2 retention / Hypoventilation)';
      } else {
        primary = 'Mixed Acidosis';
      }
    } else if (abgPh > 7.45) {
      if (abgHco3 > 26) {
        primary = 'Metabolic Alkalosis (Excess base / Volume contraction)';
      } else if (abgPco2 < 35) {
        primary = 'Respiratory Alkalosis (Hyperventilation)';
      } else {
        primary = 'Mixed Alkalosis';
      }
    } else {
      if (abgHco3 < 22 || abgPco2 > 45 || hasHighAG) {
        primary = `Compensated Acid-Base Disturbance (AG = ${anionGap.toFixed(1)})`;
      }
    }
    return { primary, anionGap };
  };

  // RASS description
  const getRassDesc = (score: number) => {
    const map: Record<number, string> = {
      4: '+4: Combative (Overly combative, violent, danger to staff)',
      3: '+3: Very Agitated (Pulls tubes/catheters, aggressive)',
      2: '+2: Agitated (Frequent nonpurposeful movement, patient-ventilator dyssynchrony)',
      1: '+1: Restless (Anxious, apprehensive, movements not aggressive)',
      0: '0: Alert and Calm (Normal spontaneous eye contact)',
      '-1': '-1: Drowsy (Sustained awakening > 10s to voice)',
      '-2': '-2: Light Sedation (Brief awakening < 10s to voice with eye contact)',
      '-3': '-3: Moderate Sedation (Movement or eye opening to voice, no eye contact)',
      '-4': '-4: Deep Sedation (No response to voice, movement to physical stimulation)',
      '-5': '-5: Unarousable (No response to voice or physical stimulation)'
    };
    return map[score] || '0: Alert';
  };

  const totalIntake = ivFluids + enteralFeed;
  const totalOutput = urineOutput + drainOutput;
  const netBalance = totalIntake - totalOutput;
  const urinePerKgHr = patientWeight > 0 ? (urineOutput / 24 / patientWeight).toFixed(2) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                ICU & CCU Bedside Calculators
              </h3>
              <p className="text-xs text-slate-400">Validated critical care scoring systems</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('sofa')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'sofa'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            SOFA Score
          </button>
          <button
            onClick={() => setActiveTab('gcs_rass')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'gcs_rass'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            GCS & RASS Sedation
          </button>
          <button
            onClick={() => setActiveTab('abg')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'abg'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ABG & Anion Gap
          </button>
          <button
            onClick={() => setActiveTab('fluid')}
            className={`px-3 py-2 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'fluid'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Fluid Balance (I/O)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: SOFA SCORE */}
          {activeTab === 'sofa' && (
            <div className="space-y-4">
              {/* Score Display Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Sequential Organ Failure Assessment
                  </div>
                  <div className="text-3xl font-black text-cyan-400 mt-0.5 flex items-baseline gap-2">
                    <span>{currentSofa}</span>
                    <span className="text-xs font-normal text-slate-400">/ 24 points</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Estimated ICU Mortality:</div>
                  <div className="text-base font-bold text-amber-400">{getSofaMortality(currentSofa)}</div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Respiratory */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    1. Respiratory (PaO2 / FiO2 Ratio)
                  </label>
                  <input
                    type="number"
                    value={pao2fio2}
                    onChange={e => setPao2fio2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    placeholder="e.g. 350"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ventCheck"
                      checked={onVentilator}
                      onChange={e => setOnVentilator(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <label htmlFor="ventCheck" className="text-slate-400 text-[11px]">
                      Mechanically ventilated
                    </label>
                  </div>
                </div>

                {/* Coagulation */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    2. Coagulation (Platelets x10³/µL)
                  </label>
                  <input
                    type="number"
                    value={platelets}
                    onChange={e => setPlatelets(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Normal: 150 - 450</span>
                </div>

                {/* Liver */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    3. Liver (Total Bilirubin mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bilirubin}
                    onChange={e => setBilirubin(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Normal: &lt; 1.2 mg/dL</span>
                </div>

                {/* Cardiovascular */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    4. Cardiovascular & Vasopressors
                  </label>
                  <select
                    value={cardioSofa}
                    onChange={e => setCardioSofa(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value={0}>MAP &ge; 70 mmHg (0 pts)</option>
                    <option value={1}>MAP &lt; 70 mmHg without pressors (1 pt)</option>
                    <option value={2}>Dopamine &le; 5 or any Dobutamine (2 pts)</option>
                    <option value={3}>Norepinephrine &le; 0.1 or Epi &le; 0.1 mcg/kg/min (3 pts)</option>
                    <option value={4}>Norepinephrine &gt; 0.1 or Epi &gt; 0.1 mcg/kg/min (4 pts)</option>
                  </select>
                </div>

                {/* CNS */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    5. Neurological (Glasgow Coma Scale)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={gcsValue}
                    onChange={e => setGcsValue(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">15 (0 pts), 13-14 (1 pt), 10-12 (2 pts), 6-9 (3 pts), &lt;6 (4 pts)</span>
                </div>

                {/* Renal */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="font-semibold text-slate-200 block mb-1">
                    6. Renal (Creatinine mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={creatinine}
                    onChange={e => setCreatinine(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">&lt;1.2 (0 pts), 1.2-1.9 (1 pt), 2.0-3.4 (2 pts), 3.5-4.9 (3 pts), &ge;5.0 (4 pts)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GCS & RASS */}
          {activeTab === 'gcs_rass' && (
            <div className="space-y-4">
              {/* GCS Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    Glasgow Coma Scale (GCS)
                  </div>
                  <div className="text-xl font-bold text-cyan-400 font-mono">
                    {gcsEye + gcsVerbal + gcsMotor} / 15
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Eye Opening (E)</label>
                    <select
                      value={gcsEye}
                      onChange={e => setGcsEye(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value={4}>4 - Spontaneous</option>
                      <option value={3}>3 - To sound / voice</option>
                      <option value={2}>2 - To pressure / pain</option>
                      <option value={1}>1 - None</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Verbal Response (V)</label>
                    <select
                      value={gcsVerbal}
                      onChange={e => setGcsVerbal(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value={5}>5 - Oriented</option>
                      <option value={4}>4 - Confused</option>
                      <option value={3}>3 - Inappropriate words</option>
                      <option value={2}>2 - Incomprehensible sounds</option>
                      <option value={1}>1 - None / Intubated (1T)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Motor Response (M)</label>
                    <select
                      value={gcsMotor}
                      onChange={e => setGcsMotor(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value={6}>6 - Obeys commands</option>
                      <option value={5}>5 - Localizing pain</option>
                      <option value={4}>4 - Normal flexion (withdrawal)</option>
                      <option value={3}>3 - Abnormal flexion (decorticate)</option>
                      <option value={2}>2 - Extension (decerebrate)</option>
                      <option value={1}>1 - None (flaccid)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RASS Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Richmond Agitation-Sedation Scale (RASS)
                  </div>
                  <div className={`text-xl font-bold font-mono ${rassScore > 0 ? 'text-amber-400' : rassScore < 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {rassScore > 0 ? `+${rassScore}` : rassScore}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                  {getRassDesc(rassScore)}
                </div>

                <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4].map(val => (
                    <button
                      key={val}
                      onClick={() => setRassScore(val)}
                      className={`px-2.5 py-1.5 rounded-lg font-mono font-bold transition text-xs ${
                        rassScore === val
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABG INTERPRETER */}
          {activeTab === 'abg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/50">
                <div className="text-[11px] text-cyan-400 uppercase font-semibold tracking-wider">
                  Automated Interpretation
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {interpretAbg().primary}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Calculated Anion Gap: <strong className="text-cyan-300">{interpretAbg().anionGap.toFixed(1)} mmol/L</strong> (Normal: 8 - 12)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">pH (7.35 - 7.45)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={abgPh}
                    onChange={e => setAbgPh(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">pCO2 mmHg (35 - 45)</label>
                  <input
                    type="number"
                    value={abgPco2}
                    onChange={e => setAbgPco2(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">HCO3 mEq/L (22 - 26)</label>
                  <input
                    type="number"
                    value={abgHco3}
                    onChange={e => setAbgHco3(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">Sodium Na+ (135 - 145)</label>
                  <input
                    type="number"
                    value={abgNa}
                    onChange={e => setAbgNa(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">Chloride Cl- (96 - 106)</label>
                  <input
                    type="number"
                    value={abgCl}
                    onChange={e => setAbgCl(Number(e.target.value))}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLUID BALANCE */}
          {activeTab === 'fluid' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">24h Net Fluid Balance</div>
                  <div className={`text-2xl font-bold font-mono mt-0.5 ${netBalance > 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {netBalance > 0 ? `+${netBalance}` : netBalance} mL
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Urine Output Rate:</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {urinePerKgHr} mL/kg/hr
                  </div>
                  <span className="text-[10px] text-slate-500">Target &gt; 0.5 mL/kg/hr</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-cyan-300">Total Intake (mL)</div>
                  <div>
                    <label className="text-[10px] text-slate-400">IV Infusions & Hydration</label>
                    <input
                      type="number"
                      value={ivFluids}
                      onChange={e => setIvFluids(Number(e.target.value))}
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Enteral / Oral Nutrition</label>
                    <input
                      type="number"
                      value={enteralFeed}
                      onChange={e => setEnteralFeed(Number(e.target.value))}
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-rose-300">Total Output (mL)</div>
                  <div>
                    <label className="text-[10px] text-slate-400">Urine Output</label>
                    <input
                      type="number"
                      value={urineOutput}
                      onChange={e => setUrineOutput(Number(e.target.value))}
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Surgical Drains / NG tube</label>
                    <input
                      type="number"
                      value={drainOutput}
                      onChange={e => setDrainOutput(Number(e.target.value))}
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">Patient Weight (for mL/kg/hr):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={patientWeight}
                    onChange={e => setPatientWeight(Number(e.target.value))}
                    className="w-20 p-1 rounded bg-slate-900 border border-slate-800 text-white text-right"
                  />
                  <span className="text-slate-400">kg</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
