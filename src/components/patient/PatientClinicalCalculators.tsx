import React, { useMemo, useState } from 'react';
import { Calculator, Clock, History, Save, Trash2 } from 'lucide-react';
import { ClinicalCalculatorRecord, PatientRecord } from '../../types';

interface Props {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

type CalculatorKey = 'grace' | 'timi' | 'chadsvasc' | 'hasbled';

const num = (value: string | number | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const PatientClinicalCalculators: React.FC<Props> = ({ patient, onUpdatePatient }) => {
  const latestVital = patient.vitals?.[patient.vitals.length - 1];
  const latestLab = patient.labs?.[patient.labs.length - 1];
  const [calculator, setCalculator] = useState<CalculatorKey>('grace');
  const [form, setForm] = useState<Record<string, number | boolean>>({
    age: num(patient.age),
    heartRate: num(latestVital?.hr),
    systolicBP: num(latestVital?.bpSystolic),
    creatinine: num(latestLab?.creatinine),
    killip: 1,
    cardiacArrest: false,
    stDeviation: false,
    biomarkers: false,
    timiAge65: num(patient.age) >= 65,
    timiRiskFactors: 0,
    timiKnownCAD: false,
    timiSevereAngina: false,
    timiAspirin: false,
    timiSTDeviation: false,
    timiBiomarkers: false,
    chf: false,
    hypertension: false,
    diabetes: false,
    stroke: false,
    vascular: false,
    abnormalRenal: false,
    abnormalLiver: false,
    bleeding: false,
    labileINR: false,
    drugsAlcohol: false,
  });

  const set = (key: string, value: number | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    if (calculator === 'grace') {
      const age = num(form.age);
      const hr = num(form.heartRate);
      const sbp = num(form.systolicBP);
      const creat = num(form.creatinine);
      let score = age < 40 ? 0 : age < 50 ? 18 : age < 60 ? 36 : age < 70 ? 55 : age < 80 ? 73 : age < 90 ? 91 : 100;
      score += hr < 70 ? 0 : hr < 90 ? 3 : hr < 110 ? 9 : hr < 150 ? 24 : 36;
      score += sbp >= 200 ? 0 : sbp >= 160 ? 10 : sbp >= 140 ? 24 : sbp >= 120 ? 34 : sbp >= 100 ? 43 : sbp >= 80 ? 53 : 63;
      score += creat < 1.0 ? 1 : creat < 1.4 ? 4 : creat < 2.0 ? 7 : creat < 3.0 ? 10 : creat < 4.0 ? 13 : 15;
      score += Number(form.killip) * 20 - 20;
      if (form.cardiacArrest) score += 43;
      if (form.stDeviation) score += 30;
      if (form.biomarkers) score += 15;
      const interpretation = score <= 108 ? 'Low risk' : score <= 140 ? 'Intermediate risk' : 'High risk';
      return { score, interpretation, label: 'GRACE Score' };
    }
    if (calculator === 'timi') {
      let score = 0;
      if (form.timiAge65) score++;
      score += Math.min(3, num(form.timiRiskFactors));
      if (form.timiKnownCAD) score++;
      if (form.timiSevereAngina) score++;
      if (form.timiAspirin) score++;
      if (form.timiSTDeviation) score++;
      if (form.timiBiomarkers) score++;
      return { score, interpretation: score <= 2 ? 'Low risk' : score <= 4 ? 'Intermediate risk' : 'High risk', label: 'TIMI Risk Score' };
    }
    if (calculator === 'chadsvasc') {
      const age = num(form.age);
      let score = 0;
      if (form.chf) score++;
      if (form.hypertension) score++;
      if (age >= 65 && age <= 74) score++;
      if (age >= 75) score += 2;
      if (form.diabetes) score++;
      if (form.stroke) score += 2;
      if (form.vascular) score++;
      if (patient.gender === 'Female') score++;
      return { score, interpretation: score === 0 ? 'Low thromboembolic risk' : score === 1 ? 'Low–moderate risk; clinical context required' : 'Elevated thromboembolic risk', label: 'CHA₂DS₂-VASc' };
    }
    let score = 0;
    if (form.abnormalRenal) score++;
    if (form.abnormalLiver) score++;
    if (form.stroke) score++;
    if (form.bleeding) score++;
    if (form.labileINR) score++;
    if (num(form.age) > 65) score++;
    if (form.drugsAlcohol) score++;
    return { score, interpretation: score <= 1 ? 'Low bleeding risk' : score === 2 ? 'Moderate bleeding risk' : 'Higher bleeding risk; review modifiable factors', label: 'HAS-BLED' };
  }, [calculator, form, patient.gender]);

  const saveResult = () => {
    const record: ClinicalCalculatorRecord = {
      id: `calc-${Date.now()}`,
      calculator: result.label,
      score: result.score,
      interpretation: result.interpretation,
      timestamp: new Date().toISOString(),
    };
    onUpdatePatient({
      ...patient,
      clinicalCalculations: [record, ...(patient.clinicalCalculations || [])],
      lastUpdated: new Date().toISOString(),
    });
  };

  const removeResult = (id: string) => {
    onUpdatePatient({
      ...patient,
      clinicalCalculations: (patient.clinicalCalculations || []).filter(item => item.id !== id),
      lastUpdated: new Date().toISOString(),
    });
  };

  const Toggle = ({ label, field }: { label: string; field: string }) => (
    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
      <input type="checkbox" checked={Boolean(form[field])} onChange={e => set(field, e.target.checked)} />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2"><Calculator size={18} className="text-emerald-500" /> Clinical Calculators</h3>
            <p className="text-xs text-slate-500">Patient-specific scores. Demographics and latest vitals/labs are pre-filled when available.</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Patient-linked</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto mb-4">
          {([
            ['grace', 'GRACE'], ['timi', 'TIMI'], ['chadsvasc', 'CHA₂DS₂-VASc'], ['hasbled', 'HAS-BLED']
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setCalculator(id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${calculator === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{label}</button>
          ))}
        </div>

        {calculator === 'grace' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              ['age', 'Age'], ['heartRate', 'Heart rate'], ['systolicBP', 'Systolic BP'], ['creatinine', 'Creatinine']
            ].map(([field, label]) => <label key={field}>{label}<input type="number" value={Number(form[field])} onChange={e => set(field, Number(e.target.value))} className="mt-1 w-full px-2.5 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700" /></label>)}
            <label>Killip class<select value={Number(form.killip)} onChange={e => set('killip', Number(e.target.value))} className="mt-1 w-full px-2.5 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700"><option value="1">I</option><option value="2">II</option><option value="3">III</option><option value="4">IV</option></select></label>
            <div className="sm:col-span-3 flex flex-wrap gap-4 pt-5"><Toggle label="Cardiac arrest at admission" field="cardiacArrest" /><Toggle label="ST deviation" field="stDeviation" /><Toggle label="Elevated biomarkers" field="biomarkers" /></div>
          </div>
        )}

        {calculator === 'timi' && <div className="space-y-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Toggle label="Age ≥65 years" field="timiAge65" /><Toggle label="Known CAD ≥50% stenosis" field="timiKnownCAD" /><Toggle label="≥3 CAD risk factors" field="timiRiskFactors3" /><Toggle label="Severe angina ≥2 episodes/24h" field="timiSevereAngina" /><Toggle label="Aspirin use in past 7 days" field="timiAspirin" /><Toggle label="ST deviation ≥0.5 mm" field="timiSTDeviation" /><Toggle label="Elevated cardiac biomarkers" field="timiBiomarkers" /></div><label className="block text-xs">Number of CAD risk factors<input type="number" min="0" max="6" value={Number(form.timiRiskFactors)} onChange={e => set('timiRiskFactors', Number(e.target.value))} className="mt-1 w-28 px-2.5 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 dark:border-slate-700" /></label></div>}

        {calculator === 'chadsvasc' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Toggle label="Congestive heart failure / LV dysfunction" field="chf" /><Toggle label="Hypertension" field="hypertension" /><Toggle label="Diabetes mellitus" field="diabetes" /><Toggle label="Prior stroke / TIA / thromboembolism" field="stroke" /><Toggle label="Vascular disease (MI/PAD/aortic plaque)" field="vascular" /><div className="text-xs text-slate-500">Age and sex are taken from the patient file: {patient.age} / {patient.gender}.</div></div>}

        {calculator === 'hasbled' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Toggle label="Abnormal renal function" field="abnormalRenal" /><Toggle label="Abnormal liver function" field="abnormalLiver" /><Toggle label="Prior stroke" field="stroke" /><Toggle label="Prior major bleeding / predisposition" field="bleeding" /><Toggle label="Labile INR" field="labileINR" /><Toggle label="Drugs / alcohol predisposing to bleeding" field="drugsAlcohol" /><div className="text-xs text-slate-500">Age &gt;65 is counted automatically when applicable.</div></div>}

        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div><div className="text-xs text-slate-500">{result.label}</div><div className="text-2xl font-black text-slate-900 dark:text-white">{result.score}</div><div className="text-xs font-semibold text-emerald-600">{result.interpretation}</div></div>
          <button onClick={saveResult} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"><Save size={14} /> Save to Patient File</button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold flex items-center gap-2 mb-3"><History size={16} className="text-emerald-500" /> Calculation History</h4>
        {(patient.clinicalCalculations || []).length === 0 ? <p className="text-xs text-slate-500">No saved calculations yet.</p> : <div className="space-y-2">{(patient.clinicalCalculations || []).map(item => <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70"><div><div className="text-xs font-bold">{item.calculator}: <span className="text-emerald-600">{item.score}</span></div><div className="text-[11px] text-slate-500 flex items-center gap-1"><Clock size={11} /> {new Date(item.timestamp).toLocaleString()}</div><div className="text-[11px] text-slate-600 dark:text-slate-300">{item.interpretation}</div></div><button onClick={() => removeResult(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button></div>)}</div>}
      </div>
    </div>
  );
};
