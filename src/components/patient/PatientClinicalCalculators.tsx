import React, { useMemo, useState } from 'react';
import { Calculator, History, Save, Trash2 } from 'lucide-react';
import { ClinicalCalculatorRecord, PatientRecord } from '../../types';

interface Props { patient: PatientRecord; onUpdatePatient: (updated: PatientRecord) => void; }
type CalculatorKey = 'grace'|'timi'|'chadsvasc'|'hasbled'|'heart'|'wellspe'|'wellsdvt'|'fourts'|'qsofa'|'sofa'|'spesi'|'shockindex'|'map'|'crcl'|'aniongap'|'correctedcalcium';
type FormValue = number|string|boolean;

const LABELS: Record<CalculatorKey,string> = {
  grace:'GRACE Score', timi:'TIMI Risk Score', chadsvasc:'CHA₂DS₂-VASc', hasbled:'HAS-BLED', heart:'HEART Score',
  wellspe:'Wells PE', wellsdvt:'Wells DVT', fourts:'4Ts Score', qsofa:'qSOFA', sofa:'SOFA', spesi:'sPESI',
  shockindex:'Shock Index', map:'MAP', crcl:'Creatinine Clearance', aniongap:'Anion Gap', correctedcalcium:'Corrected Calcium'
};
const num=(v:FormValue|undefined)=>{const n=Number(v); return Number.isFinite(n)?n:0;};

const Field: React.FC<{label:string; value:FormValue|undefined; onChange:(v:string)=>void; step?:string; inputMode?:'numeric'|'decimal'}> = ({label,value,onChange,step='1',inputMode}) => (
  <label className="block">
    <span className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    <input type="text" inputMode={inputMode || (step==='1'?'numeric':'decimal')} enterKeyHint="done" value={value===undefined?'':String(value)} onChange={e=>onChange(e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} className="block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
  </label>
);
const SelectField: React.FC<{label:string; value:number; options:string[]; onChange:(v:number)=>void}> = ({label,value,options,onChange}) => (
  <label className="block"><span className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span><select value={value} onChange={e=>onChange(Number(e.target.value))} className="block w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">{options.map((x,i)=><option key={i} value={i}>{x}</option>)}</select></label>
);
const CheckField: React.FC<{label:string; checked:boolean; onChange:(v:boolean)=>void}> = ({label,checked,onChange}) => (
  <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 cursor-pointer"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="h-5 w-5 shrink-0"/><span className="text-sm text-slate-700 dark:text-slate-200">{label}</span></label>
);

export const PatientClinicalCalculators: React.FC<Props> = ({patient,onUpdatePatient}) => {
  const latestVital=patient.vitals?.[patient.vitals.length-1];
  const latestLab=patient.labs?.[patient.labs.length-1];
  const [calculator,setCalculator]=useState<CalculatorKey>('grace');
  const [form,setForm]=useState<Record<string,FormValue>>({
    age:num(patient.age), genderFemale:patient.gender==='Female', chadsAge:num(patient.age), chadsFemale:patient.gender==='Female', hasbledAge:num(patient.age),
    heartRate:num(latestVital?.hr), systolicBP:num(latestVital?.bpSystolic), diastolicBP:num(latestVital?.bpDiastolic), creatinine:num(latestLab?.creatinine),
    killip:0, cardiacArrest:false, stDeviation:false, biomarkers:false,
    timiAge:num(patient.age), timiRiskFactors:0, timiKnownCAD:false, timiSevereAngina:false, timiAspirin:false, timiSTDeviation:false, timiBiomarkers:false,
    chf:false, hypertension:false, diabetes:false, stroke:false, vascular:false, abnormalRenal:false, abnormalLiver:false, bleeding:false, labileINR:false, drugsAlcohol:false,
    heartHistory:0, heartECG:0, heartAge:num(patient.age), heartRisk:0, heartTroponin:0,
    peDVT:false, peLikely:false, peImmobilization:false, pePreviousVTE:false, peHemoptysis:false, peCancer:false,
    dvtCancer:false,dvtBedridden:false,dvtCalf:false,dvtVeins:false,dvtEntireLeg:false,dvtTenderness:false,dvtEdema:false,dvtParalysis:false,dvtPrevious:false,dvtAlternative:false,
    fourTThrombocytopenia:0,fourTTiming:0,fourTThrombosis:0,fourTOther:0,
    qsofaRR:num(latestVital?.rr),qsofaSBP:num(latestVital?.bpSystolic),qsofaGCS:15,
    sofaPao2:100,sofaFio2:0.21,sofaPlatelets:150,sofaBilirubin:1,sofaMAP:num(latestVital?.map)||70,sofaGCS:15,sofaCreatinine:num(latestLab?.creatinine),sofaVasopressor:0,
    spesiAge:num(patient.age),spesiCancer:false,spesiCardiopulmonary:false,spesiSBP:num(latestVital?.bpSystolic),spesiSpo2:num(latestVital?.spo2),
    weight:70, sodium:140, chloride:105, bicarbonate:24, albumin:4, totalCalcium:9, crclFemale:patient.gender==='Female'
  });
  const set=(k:string,v:FormValue)=>setForm(p=>({...p,[k]:v}));
  const F=(k:string,l:string,s='1')=><Field label={l} value={form[k]} step={s} onChange={v=>set(k,v)} />;
  const S=(k:string,l:string,o:string[]) => <SelectField label={l} value={num(form[k])} options={o} onChange={v=>set(k,v)} />;
  const C=(k:string,l:string)=><CheckField label={l} checked={Boolean(form[k])} onChange={v=>set(k,v)} />;

  const result=useMemo(()=>{
    let score=0, interpretation='';
    if(calculator==='grace'){
      const age=num(form.age),hr=num(form.heartRate),sbp=num(form.systolicBP),cr=num(form.creatinine);
      score=age<40?0:age<50?18:age<60?36:age<70?55:age<80?73:age<90?91:100;
      score+=hr<70?0:hr<90?3:hr<110?9:hr<150?24:36; score+=sbp>=200?0:sbp>=160?10:sbp>=140?24:sbp>=120?34:sbp>=100?43:sbp>=80?53:63;
      score+=cr<1?1:cr<1.4?4:cr<2?7:cr<3?10:cr<4?13:15; score+=num(form.killip)*20; if(form.cardiacArrest)score+=43; if(form.stDeviation)score+=30; if(form.biomarkers)score+=15;
      interpretation=score<=108?'Low risk':score<=140?'Intermediate risk':'High risk';
    } else if(calculator==='timi') { if(num(form.timiAge)>=65)score++; score+=Math.min(3,num(form.timiRiskFactors)); if(form.timiKnownCAD)score++; if(form.timiSevereAngina)score++; if(form.timiAspirin)score++; if(form.timiSTDeviation)score++; if(form.timiBiomarkers)score++; interpretation=score<=2?'Low risk':score<=4?'Intermediate risk':'High risk';
    } else if(calculator==='chadsvasc') { const age=num(form.chadsAge); if(form.chf)score++; if(form.hypertension)score++; if(age>=75)score+=2; else if(age>=65)score++; if(form.diabetes)score++; if(form.stroke)score+=2; if(form.vascular)score++; if(form.chadsFemale)score++; interpretation=score===0?'Low thromboembolic risk':score===1?'Low–moderate risk; clinical context required':'Elevated thromboembolic risk';
    } else if(calculator==='hasbled') { if(form.abnormalRenal)score++; if(form.abnormalLiver)score++; if(form.stroke)score++; if(form.bleeding)score++; if(form.labileINR)score++; if(num(form.hasbledAge)>65)score++; if(form.drugsAlcohol)score++; interpretation=score<=1?'Low bleeding risk':score===2?'Moderate bleeding risk':'Higher bleeding risk; review modifiable factors';
    } else if(calculator==='heart') { const a=num(form.heartAge); score=num(form.heartHistory)+num(form.heartECG)+(a<45?0:a<65?1:2)+num(form.heartRisk)+num(form.heartTroponin); interpretation=score<=3?'Low risk':score<=6?'Moderate risk':'High risk';
    } else if(calculator==='wellspe') { score=(form.peDVT?3:0)+(form.peLikely?3:0)+(num(form.heartRate)>100?1.5:0)+(form.peImmobilization?1.5:0)+(form.pePreviousVTE?1.5:0)+(form.peHemoptysis?1:0)+(form.peCancer?1:0); interpretation=score<=4?'PE unlikely':'PE likely';
    } else if(calculator==='wellsdvt') { score=(form.dvtCancer?1:0)+(form.dvtBedridden?1:0)+(form.dvtCalf?1:0)+(form.dvtVeins?1:0)+(form.dvtEntireLeg?1:0)+(form.dvtTenderness?1:0)+(form.dvtEdema?1:0)+(form.dvtParalysis?1:0)+(form.dvtPrevious?1:0)-(form.dvtAlternative?2:0); interpretation=score<=0?'DVT unlikely':score<=2?'Intermediate probability':'DVT likely';
    } else if(calculator==='fourts') { score=num(form.fourTThrombocytopenia)+num(form.fourTTiming)+num(form.fourTThrombosis)+num(form.fourTOther); interpretation=score<=3?'Low probability':score<=5?'Intermediate probability':'High probability';
    } else if(calculator==='qsofa') { score=(num(form.qsofaRR)>=22?1:0)+(num(form.qsofaSBP)<=100?1:0)+(num(form.qsofaGCS)<15?1:0); interpretation=score>=2?'High-risk qSOFA (≥2)':'qSOFA <2';
    } else if(calculator==='sofa') { const pf=num(form.sofaPao2)/Math.max(.21,num(form.sofaFio2)); const resp=pf>=400?0:pf>=300?1:pf>=200?2:pf>=100?3:4; const plate=num(form.sofaPlatelets)>=150?0:num(form.sofaPlatelets)>=100?1:num(form.sofaPlatelets)>=50?2:num(form.sofaPlatelets)>=20?3:4; const bili=num(form.sofaBilirubin)<1.2?0:num(form.sofaBilirubin)<2?1:num(form.sofaBilirubin)<6?2:num(form.sofaBilirubin)<12?3:4; const cardio=num(form.sofaVasopressor); const neuro=num(form.sofaGCS)>=15?0:num(form.sofaGCS)>=13?1:num(form.sofaGCS)>=10?2:num(form.sofaGCS)>=6?3:4; const renal=num(form.sofaCreatinine)<1.2?0:num(form.sofaCreatinine)<2?1:num(form.sofaCreatinine)<3.5?2:num(form.sofaCreatinine)<5?3:4; score=resp+plate+bili+cardio+neuro+renal; interpretation=score<=6?'Lower organ dysfunction burden':'Significant organ dysfunction; trend clinically';
    } else if(calculator==='spesi') { score=num(form.spesiAge)>80?1:0; if(form.spesiCancer)score++; if(form.spesiCardiopulmonary)score++; if(num(form.heartRate)>=110)score++; if(num(form.spesiSBP)<100)score++; if(num(form.spesiSpo2)<90)score++; interpretation=score===0?'Low-risk sPESI':'Higher-risk sPESI';
    } else if(calculator==='shockindex') { score=num(form.heartRate)/Math.max(1,num(form.systolicBP)); interpretation=score<.7?'Within usual range':score<.9?'Borderline elevation':'Elevated; assess for shock/instability';
    } else if(calculator==='map') { score=(num(form.systolicBP)+2*num(form.diastolicBP))/3; interpretation=score<65?'Low MAP':score<=100?'Typical MAP range':'Elevated MAP';
    } else if(calculator==='crcl') { const age=num(form.age),weight=num(form.weight),cr=Math.max(.1,num(form.creatinine)); score=((140-age)*weight)/(72*cr)*(form.crclFemale?.85:1); interpretation=score<30?'Severely reduced renal clearance':score<60?'Moderately reduced renal clearance':'CrCl ≥60 mL/min';
    } else if(calculator==='aniongap') { score=num(form.sodium)-num(form.chloride)-num(form.bicarbonate); interpretation=score>12?'Elevated anion gap':'Not elevated by the classic 12 mEq/L cutoff';
    } else { score=num(form.totalCalcium)+.8*(4-num(form.albumin)); interpretation=score<8.5?'Low corrected calcium':score>10.5?'High corrected calcium':'Within usual range'; }
    return {score,interpretation,label:LABELS[calculator]};
  },[calculator,form]);

  const saveResult=()=>{ const record:ClinicalCalculatorRecord={id:`calc-${Date.now()}`,calculator:result.label,score:Number(result.score.toFixed(2)),interpretation:result.interpretation,timestamp:new Date().toISOString()}; onUpdatePatient({...patient,clinicalCalculations:[record,...(patient.clinicalCalculations||[])],lastUpdated:new Date().toISOString()}); };
  const removeResult=(id:string)=>onUpdatePatient({...patient,clinicalCalculations:(patient.clinicalCalculations||[]).filter(x=>x.id!==id),lastUpdated:new Date().toISOString()});

  const renderFields=()=>{
    switch(calculator){
      case 'grace': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('age','Age')}{F('heartRate','Heart rate')}{F('systolicBP','Systolic BP')}{F('creatinine','Creatinine','0.1')}{S('killip','Killip class',['I','II','III','IV'])}<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">{C('cardiacArrest','Cardiac arrest on admission')}{C('stDeviation','ST-segment deviation')}{C('biomarkers','Elevated cardiac biomarkers')}</div></div>;
      case 'timi': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{F('timiAge','Age')}{F('timiRiskFactors','Risk factors (0–3)')}{C('timiKnownCAD','Known CAD ≥50% stenosis')}{C('timiSevereAngina','≥2 anginal episodes in 24 h')}{C('timiAspirin','Aspirin use in past 7 days')}{C('timiSTDeviation','ST deviation ≥0.5 mm')}{C('timiBiomarkers','Elevated biomarkers')}</div>;
      case 'chadsvasc': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{C('chf','Congestive heart failure/LV dysfunction')}{C('hypertension','Hypertension')}{F('chadsAge','Age')}{C('diabetes','Diabetes mellitus')}{C('stroke','Previous stroke/TIA/thromboembolism')}{C('vascular','Vascular disease')}{C('chadsFemale','Female sex')}</div>;
      case 'hasbled': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{F('hasbledAge','Age')}{C('abnormalRenal','Abnormal renal function')}{C('abnormalLiver','Abnormal liver function')}{C('stroke','Stroke history')}{C('bleeding','Bleeding history/predisposition')}{C('labileINR','Labile INR')}{C('drugsAlcohol','Drugs/alcohol')}</div>;
      case 'heart': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{S('heartHistory','History',['Slightly suspicious','Moderately suspicious','Highly suspicious'])}{S('heartECG','ECG',['Normal','Nonspecific repolarization disturbance','Significant ST-depression'])}{F('heartAge','Age')}{S('heartRisk','Risk factors',['None','1–2 risk factors','≥3 risk factors or known atherosclerotic disease'])}{S('heartTroponin','Troponin',['≤normal limit','1–3× normal limit','>3× normal limit'])}</div>;
      case 'wellspe': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{C('peDVT','Clinical signs of DVT')}{C('peLikely','PE more likely than alternative diagnosis')}{F('heartRate','Heart rate')}{C('peImmobilization','Immobilization ≥3 days or surgery in previous 4 weeks')}{C('pePreviousVTE','Previous DVT/PE')}{C('peHemoptysis','Hemoptysis')}{C('peCancer','Malignancy')}</div>;
      case 'wellsdvt': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{C('dvtCancer','Active cancer')}{C('dvtBedridden','Bedridden >3 days or major surgery')}{C('dvtCalf','Calf swelling >3 cm')}{C('dvtVeins','Collateral superficial veins')}{C('dvtEntireLeg','Entire leg swollen')}{C('dvtTenderness','Tenderness along deep veins')}{C('dvtEdema','Pitting edema')}{C('dvtParalysis','Paralysis/paresis/recent plaster')}{C('dvtPrevious','Previous DVT')}{C('dvtAlternative','Alternative diagnosis at least as likely')}</div>;
      case 'fourts': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{S('fourTThrombocytopenia','Thrombocytopenia',['>50% fall or nadir ≥20','30–50% fall or nadir 10–19','<30% fall or nadir <10'])}{S('fourTTiming','Timing',['Clear onset 5–10 days or ≤1 day with recent heparin','Consistent but not clear','≤4 days without recent heparin'])}{S('fourTThrombosis','Thrombosis/sequelae',['New thrombosis or skin necrosis','Progressive/recurrent/suspected thrombosis','None'])}{S('fourTOther','Other causes',['None apparent','Possible','Definite'])}</div>;
      case 'qsofa': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('qsofaRR','Respiratory rate')}{F('qsofaSBP','Systolic BP')}{F('qsofaGCS','GCS')}</div>;
      case 'sofa': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('sofaPao2','PaO₂','1')}{F('sofaFio2','FiO₂','0.01')}{F('sofaPlatelets','Platelets')}{F('sofaBilirubin','Bilirubin','0.1')}{F('sofaMAP','MAP')}{S('sofaVasopressor','Cardiovascular score',['None','Dopamine ≤5 or dobutamine any dose','Dopamine >5 or epinephrine/norepinephrine ≤0.1','Dopamine >15 or epinephrine/norepinephrine >0.1','Other/maximum score'])}{F('sofaGCS','GCS')}{F('sofaCreatinine','Creatinine','0.1')}</div>;
      case 'spesi': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{F('spesiAge','Age')}{C('spesiCancer','Cancer')}{C('spesiCardiopulmonary','Chronic cardiopulmonary disease')}{F('heartRate','Heart rate')}{F('spesiSBP','Systolic BP')}{F('spesiSpo2','O₂ saturation')}</div>;
      case 'shockindex': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('heartRate','Heart rate')}{F('systolicBP','Systolic BP')}</div>;
      case 'map': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('systolicBP','Systolic BP')}{F('diastolicBP','Diastolic BP')}</div>;
      case 'crcl': return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('age','Age')}{F('weight','Weight (kg)','0.1')}{F('creatinine','Creatinine','0.1')}{C('crclFemale','Female')}</div>;
      case 'aniongap': return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{F('sodium','Sodium')}{F('chloride','Chloride')}{F('bicarbonate','Bicarbonate')}</div>;
      default: return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{F('totalCalcium','Total calcium','0.1')}{F('albumin','Albumin','0.1')}</div>;
    }
  };

  return <div className="space-y-4" id="clinical-calculators">
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700"><Calculator className="w-5 h-5"/></div><div><h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Calculators</h3><p className="text-xs text-slate-500">Enter values directly in the fields below.</p></div></div></div>
      <div className="p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">{(Object.keys(LABELS) as CalculatorKey[]).map(k=><button key={k} type="button" onClick={()=>setCalculator(k)} className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-bold transition ${calculator===k?'bg-emerald-600 text-white border-emerald-600':'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>{LABELS[k]}</button>)}</div>
        <div className="pt-1">{renderFields()}</div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="text-xs font-semibold text-slate-500">{result.label}</div><div className="text-3xl font-black text-slate-900 dark:text-white">{Number(result.score.toFixed(2))}</div><div className="text-sm text-slate-600 dark:text-slate-300">{result.interpretation}</div></div><button type="button" onClick={saveResult} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 font-bold inline-flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Save result</button></div>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5"><div className="flex items-center gap-2 mb-3"><History className="w-4 h-4 text-emerald-600"/><h4 className="font-bold text-slate-900 dark:text-white">Calculation History</h4></div>{(patient.clinicalCalculations||[]).length===0?<p className="text-sm text-slate-500">No saved calculations.</p>:<div className="space-y-2">{(patient.clinicalCalculations||[]).map(item=><div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3"><div><div className="text-sm font-bold text-slate-900 dark:text-white">{item.calculator}: {item.score}</div><div className="text-xs text-slate-500">{item.interpretation} · {new Date(item.timestamp).toLocaleString()}</div></div><button type="button" onClick={()=>removeResult(item.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" aria-label="Delete calculation"><Trash2 className="w-4 h-4"/></button></div>)}</div>}</section>
  </div>;
};