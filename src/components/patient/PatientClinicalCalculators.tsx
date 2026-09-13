import React, { useMemo, useState } from 'react';
import { Calculator, Clock, History, Save, Trash2 } from 'lucide-react';
import { ClinicalCalculatorRecord, PatientRecord } from '../../types';

interface Props {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

type CalculatorKey =
  | 'grace' | 'timi' | 'chadsvasc' | 'hasbled'
  | 'heart' | 'wellspe' | 'wellsdvt' | 'fourts' | 'qsofa' | 'sofa'
  | 'spesi' | 'shockindex' | 'map' | 'crcl' | 'aniongap' | 'correctedcalcium';

const num = (value: string | number | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const calculatorLabels: Record<CalculatorKey, string> = {
  grace: 'GRACE Score', timi: 'TIMI Risk Score', chadsvasc: 'CHA₂DS₂-VASc', hasbled: 'HAS-BLED',
  heart: 'HEART Score', wellspe: 'Wells PE', wellsdvt: 'Wells DVT', fourts: '4Ts Score',
  qsofa: 'qSOFA', sofa: 'SOFA', spesi: 'sPESI', shockindex: 'Shock Index', map: 'MAP',
  crcl: 'Creatinine Clearance', aniongap: 'Anion Gap', correctedcalcium: 'Corrected Calcium'
};

export const PatientClinicalCalculators: React.FC<Props> = ({ patient, onUpdatePatient }) => {
  const latestVital = patient.vitals?.[patient.vitals.length - 1];
  const latestLab = patient.labs?.[patient.labs.length - 1];
  const [calculator, setCalculator] = useState<CalculatorKey>('grace');
  const [form, setForm] = useState<Record<string, number | string | boolean>>({
    age: num(patient.age), genderFemale: patient.gender === 'Female', heartRate: num(latestVital?.hr), systolicBP: num(latestVital?.bpSystolic), diastolicBP: num(latestVital?.bpDiastolic), creatinine: num(latestLab?.creatinine), killip: 1,
    cardiacArrest: false, stDeviation: false, biomarkers: false,
    timiAge: num(patient.age), timiRiskFactors: 0, timiKnownCAD: false, timiSevereAngina: false, timiAspirin: false, timiSTDeviation: false, timiBiomarkers: false,
    chf: false, hypertension: false, diabetes: false, stroke: false, vascular: false,
    abnormalRenal: false, abnormalLiver: false, bleeding: false, labileINR: false, drugsAlcohol: false,
    heartHistory: 0, heartECG: 0, heartAge: num(patient.age), heartRisk: 0, heartTroponin: 0,
    peDVT: false, peLikely: false, peImmobilization: false, pePreviousVTE: false, peHemoptysis: false, peCancer: false,
    dvtCancer: false, dvtBedridden: false, dvtCalf: false, dvtVeins: false, dvtEntireLeg: false, dvtTenderness: false, dvtEdema: false, dvtParalysis: false, dvtPrevious: false, dvtAlternative: false,
    fourTThrombocytopenia: 0, fourTTiming: 0, fourTThrombosis: 0, fourTOther: 0,
    qsofaRR: num(latestVital?.rr), qsofaSBP: num(latestVital?.bpSystolic), qsofaGCS: 15,
    sofaPao2: 100, sofaFio2: 0.21, sofaPlatelets: 150, sofaBilirubin: 1, sofaMAP: num(latestVital?.map) || 70, sofaGCS: 15, sofaCreatinine: num(latestLab?.creatinine), sofaVasopressor: 0,
    spesiCancer: false, spesiCardiopulmonary: false, spesiSBP: num(latestVital?.bpSystolic), spesiSpo2: num(latestVital?.spo2),
    weight: 70, sodium: 140, chloride: 105, bicarbonate: 24, albumin: 4, totalCalcium: 9,
  });

  const set = (key: string, value: number | string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    let score = 0;
    let interpretation = '';

    if (calculator === 'grace') {
      const age = num(form.age), hr = num(form.heartRate), sbp = num(form.systolicBP), creat = num(form.creatinine);
      score = age < 40 ? 0 : age < 50 ? 18 : age < 60 ? 36 : age < 70 ? 55 : age < 80 ? 73 : age < 90 ? 91 : 100;
      score += hr < 70 ? 0 : hr < 90 ? 3 : hr < 110 ? 9 : hr < 150 ? 24 : 36;
      score += sbp >= 200 ? 0 : sbp >= 160 ? 10 : sbp >= 140 ? 24 : sbp >= 120 ? 34 : sbp >= 100 ? 43 : sbp >= 80 ? 53 : 63;
      score += creat < 1 ? 1 : creat < 1.4 ? 4 : creat < 2 ? 7 : creat < 3 ? 10 : creat < 4 ? 13 : 15;
      score += num(form.killip) * 20 - 20;
      if (form.cardiacArrest) score += 43; if (form.stDeviation) score += 30; if (form.biomarkers) score += 15;
      interpretation = score <= 108 ? 'Low risk' : score <= 140 ? 'Intermediate risk' : 'High risk';
    } else if (calculator === 'timi') {
      if (num(form.timiAge) >= 65) score++; score += Math.min(3, num(form.timiRiskFactors)); if (form.timiKnownCAD) score++; if (form.timiSevereAngina) score++; if (form.timiAspirin) score++; if (form.timiSTDeviation) score++; if (form.timiBiomarkers) score++;
      interpretation = score <= 2 ? 'Low risk' : score <= 4 ? 'Intermediate risk' : 'High risk';
    } else if (calculator === 'chadsvasc') {
      const age = num(form.age); if (form.chf) score++; if (form.hypertension) score++; if (age >= 65 && age <= 74) score++; if (age >= 75) score += 2; if (form.diabetes) score++; if (form.stroke) score += 2; if (form.vascular) score++; if (form.genderFemale) score++;
      interpretation = score === 0 ? 'Low thromboembolic risk' : score === 1 ? 'Low–moderate risk; clinical context required' : 'Elevated thromboembolic risk';
    } else if (calculator === 'hasbled') {
      if (form.abnormalRenal) score++; if (form.abnormalLiver) score++; if (form.stroke) score++; if (form.bleeding) score++; if (form.labileINR) score++; if (num(form.age) > 65) score++; if (form.drugsAlcohol) score++;
      interpretation = score <= 1 ? 'Low bleeding risk' : score === 2 ? 'Moderate bleeding risk' : 'Higher bleeding risk; review modifiable factors';
    } else if (calculator === 'heart') {
      const heartAge = num(form.heartAge);
      const agePoints = heartAge < 45 ? 0 : heartAge < 65 ? 1 : 2;
      score = num(form.heartHistory) + num(form.heartECG) + agePoints + num(form.heartRisk) + num(form.heartTroponin);
      interpretation = score <= 3 ? 'Low risk' : score <= 6 ? 'Moderate risk' : 'High risk';
    } else if (calculator === 'wellspe') {
      score = (form.peDVT ? 3 : 0) + (form.peLikely ? 3 : 0) + (num(form.heartRate) > 100 ? 1.5 : 0) + (form.peImmobilization ? 1.5 : 0) + (form.pePreviousVTE ? 1.5 : 0) + (form.peHemoptysis ? 1 : 0) + (form.peCancer ? 1 : 0);
      interpretation = score <= 4 ? 'PE unlikely' : 'PE likely';
    } else if (calculator === 'wellsdvt') {
      score = (form.dvtCancer ? 1 : 0) + (form.dvtBedridden ? 1 : 0) + (form.dvtCalf ? 1 : 0) + (form.dvtVeins ? 1 : 0) + (form.dvtEntireLeg ? 1 : 0) + (form.dvtTenderness ? 1 : 0) + (form.dvtEdema ? 1 : 0) + (form.dvtParalysis ? 1 : 0) + (form.dvtPrevious ? 1 : 0) - (form.dvtAlternative ? 2 : 0);
      interpretation = score <= 0 ? 'DVT unlikely' : score <= 2 ? 'Intermediate probability' : 'DVT likely';
    } else if (calculator === 'fourts') {
      score = num(form.fourTThrombocytopenia) + num(form.fourTTiming) + num(form.fourTThrombosis) + num(form.fourTOther);
      interpretation = score <= 3 ? 'Low probability' : score <= 5 ? 'Intermediate probability' : 'High probability';
    } else if (calculator === 'qsofa') {
      score = (num(form.qsofaRR) >= 22 ? 1 : 0) + (num(form.qsofaSBP) <= 100 ? 1 : 0) + (num(form.qsofaGCS) < 15 ? 1 : 0);
      interpretation = score >= 2 ? 'High-risk qSOFA (≥2)' : 'qSOFA <2';
    } else if (calculator === 'sofa') {
      const pf = num(form.sofaPao2) / Math.max(0.21, num(form.sofaFio2));
      const resp = pf >= 400 ? 0 : pf >= 300 ? 1 : pf >= 200 ? 2 : pf >= 100 ? 3 : 4;
      const plate = num(form.sofaPlatelets) >= 150 ? 0 : num(form.sofaPlatelets) >= 100 ? 1 : num(form.sofaPlatelets) >= 50 ? 2 : num(form.sofaPlatelets) >= 20 ? 3 : 4;
      const bili = num(form.sofaBilirubin) < 1.2 ? 0 : num(form.sofaBilirubin) < 2 ? 1 : num(form.sofaBilirubin) < 6 ? 2 : num(form.sofaBilirubin) < 12 ? 3 : 4;
      const cardio = num(form.sofaVasopressor) || (num(form.sofaMAP) < 70 ? 1 : 0);
      const neuro = num(form.sofaGCS) >= 15 ? 0 : num(form.sofaGCS) >= 13 ? 1 : num(form.sofaGCS) >= 10 ? 2 : num(form.sofaGCS) >= 6 ? 3 : 4;
      const renal = num(form.sofaCreatinine) < 1.2 ? 0 : num(form.sofaCreatinine) < 2 ? 1 : num(form.sofaCreatinine) < 3.5 ? 2 : num(form.sofaCreatinine) < 5 ? 3 : 4;
      score = resp + plate + bili + Math.min(4, cardio) + neuro + renal;
      interpretation = score <= 6 ? 'Lower organ dysfunction burden' : 'Significant organ dysfunction; trend clinically';
    } else if (calculator === 'spesi') {
      score = num(form.age) > 80 ? 1 : 0; if (form.spesiCancer) score++; if (form.spesiCardiopulmonary) score++; if (num(form.heartRate) >= 110) score++; if (num(form.spesiSBP) < 100) score++; if (num(form.spesiSpo2) < 90) score++;
      interpretation = score === 0 ? 'Low-risk sPESI' : 'Higher-risk sPESI';
    } else if (calculator === 'shockindex') {
      score = num(form.heartRate) / Math.max(1, num(form.systolicBP));
      interpretation = score < 0.7 ? 'Within usual range' : score < 0.9 ? 'Borderline elevation' : 'Elevated; assess for shock/instability';
    } else if (calculator === 'map') {
      score = (num(form.systolicBP) + 2 * num(form.diastolicBP)) / 3;
      interpretation = score < 65 ? 'Low MAP' : score <= 100 ? 'Typical MAP range' : 'Elevated MAP';
    } else if (calculator === 'crcl') {
      const age = num(form.age), weight = num(form.weight), creat = Math.max(0.1, num(form.creatinine));
      score = ((140 - age) * weight) / (72 * creat) * (form.genderFemale ? 0.85 : 1);
      interpretation = score < 30 ? 'Severely reduced renal clearance' : score < 60 ? 'Moderately reduced renal clearance' : 'CrCl ≥60 mL/min';
    } else if (calculator === 'aniongap') {
      score = num(form.sodium) - num(form.chloride) - num(form.bicarbonate);
      interpretation = score > 12 ? 'Elevated anion gap' : 'Not elevated by the classic 12 mEq/L cutoff';
    } else if (calculator === 'correctedcalcium') {
      score = num(form.totalCalcium) + 0.8 * (4 - num(form.albumin));
      interpretation = score < 8.5 ? 'Low corrected calcium' : score > 10.5 ? 'High corrected calcium' : 'Within usual range';
    }
    return { score, interpretation, label: calculatorLabels[calculator] };
  }, [calculator, form]);

  const saveResult = () => {
    const record: ClinicalCalculatorRecord = { id: `calc-${Date.now()}`, calculator: result.label, score: Number(result.score.toFixed(2)), interpretation: result.interpretation, timestamp: new Date().toISOString() };
    onUpdatePatient({ ...patient, clinicalCalculations: [record, ...(patient.clinicalCalculations || [])], lastUpdated: new Date().toISOString() });
  };

  const removeResult = (id: string) => onUpdatePatient({ ...patient, clinicalCalculations: (patient.clinicalCalculations || []).filter(item => item.id !== id), lastUpdated: new Date().toISOString() });

  const Toggle = ({ label, field }: { label: string; field: string }) => <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer touch-manipulation"><input type="checkbox" checked={Boolean(form[field])} onChange={e => set(field, e.target.checked)} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} /><span>{label}</span></label>;
  const Input = ({ field, label, step = '1' }: { field: string; label: string; step?: string }) => {
    const isDecimal = step !== '1';
    return <label className="text-xs block select-text">{label}<input type="text" inputMode={isDecimal ? 'decimal' : 'numeric'} pattern={isDecimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" readOnly={false} disabled={false} value={form[field] === undefined || form[field] === '' ? '' : String(form[field])} onFocus={e => e.currentTarget.select()} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onInput={e => set(field, e.currentTarget.value)} onChange={e => set(field, e.target.value)} className="mt-1 w-full min-h-11 px-2.5 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 touch-manipulation select-text" style={{ WebkitUserSelect: 'text', userSelect: 'text', touchAction: 'manipulation' }} /></label>;
  };
  const SelectScore = ({ field, label, options }: { field: string; label: string; options: string[] }) => <label className="text-xs block">{label}<select value={Number(form[field])} onChange={e => set(field, Number(e.target.value))} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} className="mt-1 w-full min-h-11 px-2.5 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 touch-manipulation">{options.map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>;

  const renderInputs = () => {
    if (calculator === 'grace') return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Input field="age" label="Age" /><Input field="heartRate" label="Heart rate" /><Input field="systolicBP" label="Systolic BP" /><Input field="creatinine" label="Creatinine" step="0.1" /><SelectScore field="killip" label="Killip class" options={['I','II','III','IV']} /><div className="sm:col-span-3 flex flex-wrap gap-4 pt-5"><Toggle label="Cardiac arrest at admission" field="cardiacArrest" /><Toggle label="ST deviation" field="stDeviation" /><Toggle label="Elevated biomarkers" field="biomarkers" /></div></div>;
    if (calculator === 'timi') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input field="timiAge" label="Age" /><Input field="timiRiskFactors" label="Number of CAD risk factors (0–6)" /><Toggle label="Known CAD ≥50% stenosis" field="timiKnownCAD" /><Toggle label="Severe angina ≥2 episodes/24h" field="timiSevereAngina" /><Toggle label="Aspirin use in past 7 days" field="timiAspirin" /><Toggle label="ST deviation ≥0.5 mm" field="timiSTDeviation" /><Toggle label="Elevated cardiac biomarkers" field="timiBiomarkers" /></div>;
    if (calculator === 'chadsvasc') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input field="age" label="Age" /><Toggle label="Female sex" field="genderFemale" /><Toggle label="Congestive heart failure / LV dysfunction" field="chf" /><Toggle label="Hypertension" field="hypertension" /><Toggle label="Diabetes mellitus" field="diabetes" /><Toggle label="Prior stroke / TIA / thromboembolism" field="stroke" /><Toggle label="Vascular disease (MI/PAD/aortic plaque)" field="vascular" /></div>;
    if (calculator === 'hasbled') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input field="age" label="Age" /><Toggle label="Abnormal renal function" field="abnormalRenal" /><Toggle label="Abnormal liver function" field="abnormalLiver" /><Toggle label="Prior stroke" field="stroke" /><Toggle label="Prior major bleeding / predisposition" field="bleeding" /><Toggle label="Labile INR" field="labileINR" /><Toggle label="Drugs / alcohol predisposing to bleeding" field="drugsAlcohol" /></div>;
    if (calculator === 'heart') return <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><SelectScore field="heartHistory" label="History" options={['Slightly suspicious (0)','Moderately suspicious (1)','Highly suspicious (2)']} /><SelectScore field="heartECG" label="ECG" options={['Normal (0)','Nonspecific repolarization (1)','Significant ST depression (2)']} /><Input field="heartAge" label="Age" /><SelectScore field="heartRisk" label="Risk factors" options={['None (0)','1–2 risk factors (1)','≥3 risk factors or known ASCVD (2)']} /><SelectScore field="heartTroponin" label="Troponin" options={['≤normal limit (0)','1–3× normal limit (1)','>3× normal limit (2)']} /></div>;
    if (calculator === 'wellspe') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Toggle label="Clinical signs of DVT (+3)" field="peDVT" /><Toggle label="PE most likely diagnosis (+3)" field="peLikely" /><Input field="heartRate" label="Heart rate" /><Toggle label="Immobilization ≥3 days / surgery within 4 weeks (+1.5)" field="peImmobilization" /><Toggle label="Previous DVT/PE (+1.5)" field="pePreviousVTE" /><Toggle label="Hemoptysis (+1)" field="peHemoptysis" /><Toggle label="Malignancy (+1)" field="peCancer" /></div>;
    if (calculator === 'wellsdvt') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Toggle label="Active cancer (+1)" field="dvtCancer" /><Toggle label="Bedridden >3 days / major surgery (+1)" field="dvtBedridden" /><Toggle label="Calf swelling >3 cm (+1)" field="dvtCalf" /><Toggle label="Collateral superficial veins (+1)" field="dvtVeins" /><Toggle label="Entire leg swollen (+1)" field="dvtEntireLeg" /><Toggle label="Deep venous tenderness (+1)" field="dvtTenderness" /><Toggle label="Pitting edema confined to symptomatic leg (+1)" field="dvtEdema" /><Toggle label="Paralysis/paresis/immobilization (+1)" field="dvtParalysis" /><Toggle label="Previous DVT (+1)" field="dvtPrevious" /><Toggle label="Alternative diagnosis as likely or more likely (−2)" field="dvtAlternative" /></div>;
    if (calculator === 'fourts') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><SelectScore field="fourTThrombocytopenia" label="Thrombocytopenia" options={['<30% fall or nadir <10 (0)','30–50% fall or nadir 10–19 (1)','>50% fall and nadir ≥20 (2)']} /><SelectScore field="fourTTiming" label="Timing" options={['No clear timing (0)','Consistent but not clear (1)','Clear onset day 5–10 / rapid with recent heparin (2)']} /><SelectScore field="fourTThrombosis" label="Thrombosis" options={['None (0)','Suspected/progressive (1)','Confirmed/new thrombosis or skin necrosis (2)']} /><SelectScore field="fourTOther" label="Other causes of thrombocytopenia" options={['Definite other cause (0)','Possible other cause (1)','No apparent other cause (2)']} /></div>;
    if (calculator === 'qsofa') return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Input field="qsofaRR" label="Respiratory rate" /><Input field="qsofaSBP" label="Systolic BP" /><Input field="qsofaGCS" label="GCS" /></div>;
    if (calculator === 'sofa') return <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><Input field="sofaPao2" label="PaO₂ (mmHg)" /><Input field="sofaFio2" label="FiO₂ (0.21–1.0)" step="0.01" /><Input field="sofaPlatelets" label="Platelets ×10³/µL" /><Input field="sofaBilirubin" label="Bilirubin mg/dL" step="0.1" /><Input field="sofaMAP" label="MAP mmHg" /><Input field="sofaGCS" label="GCS" /><Input field="sofaCreatinine" label="Creatinine mg/dL" step="0.1" /><SelectScore field="sofaVasopressor" label="Cardiovascular / vasopressor" options={['No hypotension (0)','MAP <70 (1)','Dopamine ≤5 or dobutamine (2)','Dopamine >5 or epi/norepi ≤0.1 (3)','Higher-dose vasopressor (4)']} /></div>;
    if (calculator === 'spesi') return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input field="age" label="Age" /><Toggle label="History of cancer" field="spesiCancer" /><Toggle label="Chronic cardiopulmonary disease" field="spesiCardiopulmonary" /><Input field="heartRate" label="Heart rate" /><Input field="spesiSBP" label="Systolic BP" /><Input field="spesiSpo2" label="O₂ saturation" /></div>;
    if (calculator === 'shockindex') return <div className="grid grid-cols-2 gap-3"><Input field="heartRate" label="Heart rate" /><Input field="systolicBP" label="Systolic BP" /></div>;
    if (calculator === 'map') return <div className="grid grid-cols-2 gap-3"><Input field="systolicBP" label="Systolic BP" /><Input field="diastolicBP" label="Diastolic BP" /></div>;
    if (calculator === 'crcl') return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Input field="age" label="Age" /><Input field="weight" label="Weight kg" /><Input field="creatinine" label="Serum creatinine mg/dL" step="0.1" /><Toggle label="Female sex (×0.85)" field="genderFemale" /></div>;
    if (calculator === 'aniongap') return <div className="grid grid-cols-3 gap-3"><Input field="sodium" label="Na" /><Input field="chloride" label="Cl" /><Input field="bicarbonate" label="HCO₃" /></div>;
    return <div className="grid grid-cols-2 gap-3"><Input field="totalCalcium" label="Total calcium mg/dL" step="0.1" /><Input field="albumin" label="Albumin g/dL" step="0.1" /></div>;
  };

  return <div className="space-y-4">
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3 mb-4"><div><h3 className="text-base font-bold flex items-center gap-2"><Calculator size={18} className="text-emerald-500" /> Clinical Calculators</h3><p className="text-xs text-slate-500">Patient-linked values are pre-filled only as a starting point. Every calculator field remains manually editable.</p></div><span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Editable</span></div>
      <div className="flex gap-2 mb-4"><select value={calculator} onChange={e => setCalculator(e.target.value as CalculatorKey)} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} className="w-full min-h-11 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold touch-manipulation"><optgroup label="Cardiology">{['grace','timi','chadsvasc','hasbled','heart'].map(k => <option key={k} value={k}>{calculatorLabels[k as CalculatorKey]}</option>)}</optgroup><optgroup label="VTE / Emergency">{['wellspe','wellsdvt','fourts','spesi'].map(k => <option key={k} value={k}>{calculatorLabels[k as CalculatorKey]}</option>)}</optgroup><optgroup label="ICU / Critical Care">{['qsofa','sofa','shockindex','map'].map(k => <option key={k} value={k}>{calculatorLabels[k as CalculatorKey]}</option>)}</optgroup><optgroup label="Clinical / Laboratory">{['crcl','aniongap','correctedcalcium'].map(k => <option key={k} value={k}>{calculatorLabels[k as CalculatorKey]}</option>)}</optgroup></select></div>
      <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">{calculatorLabels[calculator]}</div>
      {renderInputs()}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs text-slate-500">Result</div><div className="text-2xl font-black text-slate-900 dark:text-white">{Number(result.score.toFixed(2))}</div><div className="text-xs font-semibold text-emerald-600">{result.interpretation}</div></div><button onClick={saveResult} type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold touch-manipulation"><Save size={14} /> Save to Patient File</button></div>
    </div>
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><h4 className="text-sm font-bold flex items-center gap-2 mb-3"><History size={16} className="text-emerald-500" /> Calculation History</h4>{(patient.clinicalCalculations || []).length === 0 ? <p className="text-xs text-slate-500">No saved calculations yet.</p> : <div className="space-y-2">{(patient.clinicalCalculations || []).map(item => <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70"><div><div className="text-xs font-bold">{item.calculator}: <span className="text-emerald-600">{item.score}</span></div><div className="text-[11px] text-slate-500 flex items-center gap-1"><Clock size={11} /> {new Date(item.timestamp).toLocaleString()}</div><div className="text-[11px] text-slate-600 dark:text-slate-300">{item.interpretation}</div></div><button onClick={() => removeResult(item.id)} type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 touch-manipulation"><Trash2 size={14} /></button></div>)}</div>}</div>
  </div>;
};