/**
 * Clinical Calculator Algorithms & Evidence-Based Formulas
 * CardioVault v1.1.0
 */

export interface CalcResult {
  score: number | string;
  interpretation: string;
  category?: 'low' | 'moderate' | 'high' | 'critical' | 'normal';
  details?: string;
}

// 1. GCS
export function calculateGCS(eye: number, verbal: number, motor: number): CalcResult {
  const score = eye + verbal + motor;
  let interpretation = '';
  let category: CalcResult['category'] = 'normal';

  if (score >= 13) {
    interpretation = 'Mild brain injury / Normal mentation (GCS 13-15)';
    category = 'normal';
  } else if (score >= 9) {
    interpretation = 'Moderate brain injury (GCS 9-12)';
    category = 'moderate';
  } else {
    interpretation = 'Severe brain injury (GCS <= 8) — Consider airway protection/intubation';
    category = 'critical';
  }

  return { score, interpretation, category };
}

// 2. SOFA
export function calculateSOFA(params: {
  pao2fio2: number;
  ventilated: boolean;
  platelets: number;
  bilirubin: number;
  map: number;
  vasopressor: number; // 0=none, 1=dopa<=5 or dobutamine, 2=dopa>5 or norepi<=0.1, 3=norepi>0.1
  gcs: number;
  creatinine: number;
}): CalcResult {
  let score = 0;

  // Resp
  if (params.pao2fio2 < 100 && params.ventilated) score += 4;
  else if (params.pao2fio2 < 200 && params.ventilated) score += 3;
  else if (params.pao2fio2 < 300) score += 2;
  else if (params.pao2fio2 < 400) score += 1;

  // Coag
  if (params.platelets < 20) score += 4;
  else if (params.platelets < 50) score += 3;
  else if (params.platelets < 100) score += 2;
  else if (params.platelets < 150) score += 1;

  // Liver
  if (params.bilirubin >= 12.0) score += 4;
  else if (params.bilirubin >= 6.0) score += 3;
  else if (params.bilirubin >= 2.0) score += 2;
  else if (params.bilirubin >= 1.2) score += 1;

  // Cardio
  if (params.vasopressor === 3) score += 4;
  else if (params.vasopressor === 2) score += 3;
  else if (params.vasopressor === 1) score += 2;
  else if (params.map < 70) score += 1;

  // CNS
  if (params.gcs < 6) score += 4;
  else if (params.gcs <= 9) score += 3;
  else if (params.gcs <= 12) score += 2;
  else if (params.gcs <= 14) score += 1;

  // Renal
  if (params.creatinine >= 5.0) score += 4;
  else if (params.creatinine >= 3.5) score += 3;
  else if (params.creatinine >= 2.0) score += 2;
  else if (params.creatinine >= 1.2) score += 1;

  let mortality = '< 5%';
  let category: CalcResult['category'] = 'low';
  if (score > 14) {
    mortality = '> 90%';
    category = 'critical';
  } else if (score >= 12) {
    mortality = '~ 80%';
    category = 'critical';
  } else if (score >= 9) {
    mortality = '~ 33 - 50%';
    category = 'high';
  } else if (score >= 6) {
    mortality = '~ 15 - 20%';
    category = 'moderate';
  }

  return {
    score,
    interpretation: `SOFA Score: ${score} points (Estimated ICU mortality: ${mortality})`,
    category,
    details: 'Evaluates organ failure across 6 systems: respiratory, coagulation, hepatic, cardiovascular, neurological, renal.'
  };
}

// 3. qSOFA
export function calculateQSOFA(rr22: boolean, alteredGcs: boolean, sbp100: boolean): CalcResult {
  let score = 0;
  if (rr22) score += 1;
  if (alteredGcs) score += 1;
  if (sbp100) score += 1;

  const category: CalcResult['category'] = score >= 2 ? 'critical' : 'normal';
  const interpretation = score >= 2
    ? `Score ${score}/3 — High risk of in-hospital mortality / prolonged ICU stay (Assess for sepsis)`
    : `Score ${score}/3 — Low immediate qSOFA risk`;

  return { score, interpretation, category };
}

// 4. APACHE II
export function calculateAPACHEII(params: {
  age: number;
  temp: number; // Celsius
  map: number;
  hr: number;
  rr: number;
  pao2: number;
  fio2: number;
  ph: number;
  na: number;
  k: number;
  cr: number;
  acuteRenalFailure: boolean;
  hct: number;
  wbc: number;
  gcs: number;
  chronicOrganFailure: 'none' | 'electivePostOp' | 'emergencyPostOpOrNonOp';
}): CalcResult {
  let acutePoints = 0;

  // Temp
  if (params.temp >= 41 || params.temp <= 29.9) acutePoints += 4;
  else if (params.temp >= 39 || params.temp <= 31.9) acutePoints += 3;
  else if (params.temp <= 33.9) acutePoints += 2;
  else if (params.temp >= 38.5 || params.temp <= 35.9) acutePoints += 1;

  // MAP
  if (params.map >= 160 || params.map <= 49) acutePoints += 4;
  else if (params.map >= 130) acutePoints += 3;
  else if (params.map >= 110 || params.map <= 69) acutePoints += 2;

  // HR
  if (params.hr >= 180 || params.hr <= 39) acutePoints += 4;
  else if (params.hr >= 140 || params.hr <= 54) acutePoints += 3;
  else if (params.hr >= 110 || params.hr <= 69) acutePoints += 2;

  // RR
  if (params.rr >= 50 || params.rr <= 5) acutePoints += 4;
  else if (params.rr >= 35) acutePoints += 3;
  else if (params.rr <= 9) acutePoints += 2;
  else if (params.rr >= 25 || params.rr <= 11) acutePoints += 1;

  // Oxygenation
  if (params.fio2 >= 0.5) {
    // A-a gradient approximation
    const pao2Expected = (params.fio2 * 713) - (40 / 0.8);
    const aado2 = Math.max(0, pao2Expected - params.pao2);
    if (aado2 >= 500) acutePoints += 4;
    else if (aado2 >= 350) acutePoints += 3;
    else if (aado2 >= 200) acutePoints += 2;
  } else {
    if (params.pao2 < 55) acutePoints += 4;
    else if (params.pao2 <= 60) acutePoints += 3;
    else if (params.pao2 <= 70) acutePoints += 1;
  }

  // pH
  if (params.ph >= 7.7 || params.ph < 7.15) acutePoints += 4;
  else if (params.ph >= 7.6 || params.ph <= 7.24) acutePoints += 3;
  else if (params.ph <= 7.32) acutePoints += 2;
  else if (params.ph >= 7.5) acutePoints += 1;

  // Na
  if (params.na >= 180 || params.na <= 110) acutePoints += 4;
  else if (params.na >= 160 || params.na <= 119) acutePoints += 3;
  else if (params.na >= 155 || params.na <= 129) acutePoints += 2;
  else if (params.na >= 150) acutePoints += 1;

  // K
  if (params.k >= 7.0 || params.k < 2.5) acutePoints += 4;
  else if (params.k >= 6.0) acutePoints += 3;
  else if (params.k <= 2.9) acutePoints += 2;
  else if (params.k >= 5.5 || params.k <= 3.4) acutePoints += 1;

  // Creatinine
  let crPoints = 0;
  if (params.cr >= 3.5) crPoints = 4;
  else if (params.cr >= 2.0) crPoints = 3;
  else if (params.cr >= 1.5 || params.cr < 0.6) crPoints = 2;
  if (params.acuteRenalFailure) crPoints *= 2;
  acutePoints += crPoints;

  // Hct
  if (params.hct >= 60 || params.hct < 20) acutePoints += 4;
  else if (params.hct >= 50 || params.hct <= 29.9) acutePoints += 2;
  else if (params.hct >= 46) acutePoints += 1;

  // WBC
  if (params.wbc >= 40 || params.wbc < 1) acutePoints += 4;
  else if (params.wbc >= 20 || params.wbc <= 2.9) acutePoints += 2;
  else if (params.wbc >= 15) acutePoints += 1;

  // GCS
  acutePoints += (15 - Math.min(15, Math.max(3, params.gcs)));

  // Age points
  let agePoints = 0;
  if (params.age >= 75) agePoints = 6;
  else if (params.age >= 65) agePoints = 5;
  else if (params.age >= 55) agePoints = 3;
  else if (params.age >= 45) agePoints = 2;

  // Chronic health points
  let chronicPoints = 0;
  if (params.chronicOrganFailure === 'electivePostOp') chronicPoints = 2;
  else if (params.chronicOrganFailure === 'emergencyPostOpOrNonOp') chronicPoints = 5;

  const totalScore = acutePoints + agePoints + chronicPoints;

  let mortality = '< 5%';
  if (totalScore >= 35) mortality = '> 80%';
  else if (totalScore >= 30) mortality = '~ 70%';
  else if (totalScore >= 25) mortality = '~ 50%';
  else if (totalScore >= 20) mortality = '~ 40%';
  else if (totalScore >= 15) mortality = '~ 25%';
  else if (totalScore >= 10) mortality = '~ 15%';

  return {
    score: totalScore,
    interpretation: `APACHE II Score: ${totalScore} (Estimated hospital mortality: ${mortality})`,
    category: totalScore >= 25 ? 'critical' : totalScore >= 15 ? 'high' : 'moderate'
  };
}

// 5. CHA2DS2-VASc
export function calculateCHA2DS2VASc(params: {
  chf: boolean;
  htn: boolean;
  age: number;
  diabetes: boolean;
  stroke: boolean;
  vascular: boolean;
  female: boolean;
}): CalcResult {
  let score = 0;
  if (params.chf) score += 1;
  if (params.htn) score += 1;
  if (params.age >= 75) score += 2;
  else if (params.age >= 65) score += 1;
  if (params.diabetes) score += 1;
  if (params.stroke) score += 2;
  if (params.vascular) score += 1;
  if (params.female) score += 1;

  let strokeRisk = '0.2%';
  if (score === 1) strokeRisk = '0.6%';
  else if (score === 2) strokeRisk = '2.2%';
  else if (score === 3) strokeRisk = '3.2%';
  else if (score === 4) strokeRisk = '4.8%';
  else if (score === 5) strokeRisk = '7.2%';
  else if (score === 6) strokeRisk = '9.7%';
  else if (score >= 7) strokeRisk = '> 11%';

  let recommendation = '';
  if (score === 0) {
    recommendation = 'Low thromboembolic risk — Anticoagulation typically not recommended.';
  } else if (score === 1 && !params.female) {
    recommendation = 'Intermediate risk — Oral anticoagulation should be considered.';
  } else if (score === 1 && params.female) {
    recommendation = 'Low risk (lone female sex criterion) — Anticoagulation generally not recommended.';
  } else {
    recommendation = 'High thromboembolic risk — Oral anticoagulation (DOAC / Warfarin) strongly recommended.';
  }

  return {
    score,
    interpretation: `CHA₂DS₂-VASc: ${score} points (Annual stroke risk: ${strokeRisk})`,
    category: score >= 2 ? 'high' : score === 1 ? 'moderate' : 'low',
    details: recommendation
  };
}

// 6. HAS-BLED
export function calculateHASBLED(params: {
  htn: boolean;
  renal: boolean;
  liver: boolean;
  stroke: boolean;
  priorBleed: boolean;
  labileInr: boolean;
  age65: boolean;
  drugs: boolean;
  alcohol: boolean;
}): CalcResult {
  let score = 0;
  if (params.htn) score += 1;
  if (params.renal) score += 1;
  if (params.liver) score += 1;
  if (params.stroke) score += 1;
  if (params.priorBleed) score += 1;
  if (params.labileInr) score += 1;
  if (params.age65) score += 1;
  if (params.drugs) score += 1;
  if (params.alcohol) score += 1;

  const category: CalcResult['category'] = score >= 3 ? 'high' : 'low';
  const interp = score >= 3
    ? `HAS-BLED Score: ${score} (High bleeding risk >= 3) — Caution & regular review; address modifiable factors.`
    : `HAS-BLED Score: ${score} (Low to moderate bleeding risk)`;

  return { score, interpretation: interp, category };
}

// 7. TIMI Risk Score (for UA / NSTEMI)
export function calculateTIMI(params: {
  age65: boolean;
  riskFactors3: boolean; // >= 3 CAD risk factors
  knownCad50: boolean;
  aspirinPast7d: boolean;
  severeAngina24h: boolean;
  elevatedMarkers: boolean;
  stDeviation: boolean;
}): CalcResult {
  let score = 0;
  if (params.age65) score += 1;
  if (params.riskFactors3) score += 1;
  if (params.knownCad50) score += 1;
  if (params.aspirinPast7d) score += 1;
  if (params.severeAngina24h) score += 1;
  if (params.elevatedMarkers) score += 1;
  if (params.stDeviation) score += 1;

  let risk = '4.7%';
  let category: CalcResult['category'] = 'low';
  if (score >= 5) {
    risk = score === 5 ? '26.2%' : '40.9%';
    category = 'high';
  } else if (score >= 3) {
    risk = score === 3 ? '13.2%' : '19.9%';
    category = 'moderate';
  } else if (score === 2) {
    risk = '8.3%';
    category = 'low';
  }

  return {
    score,
    interpretation: `TIMI Score: ${score}/7 (14-day risk of all-cause mortality, MI, or severe ischemia: ${risk})`,
    category
  };
}

// 8. GRACE Score
export function calculateGRACE(params: {
  age: number;
  hr: number;
  sbp: number;
  creatinine: number;
  killip: 1 | 2 | 3 | 4;
  cardiacArrest: boolean;
  stDeviation: boolean;
  elevatedMarkers: boolean;
}): CalcResult {
  let score = 0;

  // Age
  if (params.age >= 90) score += 100;
  else if (params.age >= 80) score += 91;
  else if (params.age >= 70) score += 75;
  else if (params.age >= 60) score += 58;
  else if (params.age >= 50) score += 41;
  else if (params.age >= 40) score += 25;
  else if (params.age >= 30) score += 8;

  // HR
  if (params.hr >= 200) score += 46;
  else if (params.hr >= 150) score += 38;
  else if (params.hr >= 110) score += 24;
  else if (params.hr >= 90) score += 15;
  else if (params.hr >= 70) score += 7;

  // SBP
  if (params.sbp < 80) score += 58;
  else if (params.sbp < 100) score += 53;
  else if (params.sbp < 120) score += 43;
  else if (params.sbp < 140) score += 34;
  else if (params.sbp < 160) score += 24;
  else if (params.sbp < 200) score += 10;

  // Creatinine
  if (params.creatinine >= 4.0) score += 28;
  else if (params.creatinine >= 2.0) score += 21;
  else if (params.creatinine >= 1.4) score += 14;
  else if (params.creatinine >= 0.8) score += 7;

  // Killip class
  if (params.killip === 4) score += 59;
  else if (params.killip === 3) score += 39;
  else if (params.killip === 2) score += 20;

  if (params.cardiacArrest) score += 39;
  if (params.stDeviation) score += 28;
  if (params.elevatedMarkers) score += 14;

  let riskCategory: CalcResult['category'] = 'low';
  let interp = '';
  if (score > 140) {
    riskCategory = 'high';
    interp = `High Risk (> 3% in-hospital mortality, > 8% 6-month mortality)`;
  } else if (score >= 109) {
    riskCategory = 'moderate';
    interp = `Intermediate Risk (1 - 3% in-hospital mortality)`;
  } else {
    riskCategory = 'low';
    interp = `Low Risk (< 1% in-hospital mortality)`;
  }

  return {
    score,
    interpretation: `GRACE Score: ${score} points — ${interp}`,
    category: riskCategory
  };
}

// 9. HEART Score
export function calculateHEART(history: number, ecg: number, age: number, riskFactors: number, troponin: number): CalcResult {
  const score = history + ecg + age + riskFactors + troponin;
  let category: CalcResult['category'] = 'low';
  let interp = '';

  if (score <= 3) {
    category = 'low';
    interp = 'Score 0-3: Low risk (0.9 - 1.7% risk of MACE). Candidate for early discharge.';
  } else if (score <= 6) {
    category = 'moderate';
    interp = 'Score 4-6: Intermediate risk (12 - 16.6% risk of MACE). Observation and clinical workup recommended.';
  } else {
    category = 'critical';
    interp = 'Score 7-10: High risk (50 - 65% risk of MACE). Early invasive coronary evaluation warranted.';
  }

  return { score, interpretation: interp, category };
}

// 10. Wells PE
export function calculateWellsPE(params: {
  dvtSigns: boolean; // +3
  peLikely: boolean; // +3
  hr100: boolean; // +1.5
  immobilitySurgery: boolean; // +1.5
  priorDvtPe: boolean; // +1.5
  hemoptysis: boolean; // +1
  malignancy: boolean; // +1
}): CalcResult {
  let score = 0;
  if (params.dvtSigns) score += 3;
  if (params.peLikely) score += 3;
  if (params.hr100) score += 1.5;
  if (params.immobilitySurgery) score += 1.5;
  if (params.priorDvtPe) score += 1.5;
  if (params.hemoptysis) score += 1;
  if (params.malignancy) score += 1;

  let category: CalcResult['category'] = 'low';
  let interp = '';
  if (score > 6) {
    category = 'critical';
    interp = `Score ${score}: High probability of PE (~ 65% risk). Proceed directly to CTPA unless contraindicated.`;
  } else if (score >= 2) {
    category = 'moderate';
    interp = `Score ${score}: Moderate probability of PE (~ 28% risk). High-sensitivity D-dimer or imaging.`;
  } else {
    category = 'low';
    interp = `Score ${score}: Low probability of PE (~ 3.7% risk). Consider PERC rule or D-dimer.`;
  }

  return { score, interpretation: interp, category };
}

// 11. Wells DVT
export function calculateWellsDVT(params: {
  activeCancer: boolean; // +1
  paralysisParesis: boolean; // +1
  bedriddenSurgery: boolean; // +1
  localizedTenderness: boolean; // +1
  entireLegSwollen: boolean; // +1
  calfSwelling3cm: boolean; // +1
  pittingEdema: boolean; // +1
  collateralVeins: boolean; // +1
  altDiagnosisLikely: boolean; // -2
}): CalcResult {
  let score = 0;
  if (params.activeCancer) score += 1;
  if (params.paralysisParesis) score += 1;
  if (params.bedriddenSurgery) score += 1;
  if (params.localizedTenderness) score += 1;
  if (params.entireLegSwollen) score += 1;
  if (params.calfSwelling3cm) score += 1;
  if (params.pittingEdema) score += 1;
  if (params.collateralVeins) score += 1;
  if (params.altDiagnosisLikely) score -= 2;

  let category: CalcResult['category'] = 'low';
  let interp = '';
  if (score >= 3) {
    category = 'critical';
    interp = `Score ${score}: High probability of DVT (~ 75% prevalence). Compression ultrasound indicated.`;
  } else if (score >= 1) {
    category = 'moderate';
    interp = `Score ${score}: Moderate probability of DVT (~ 17% prevalence). D-dimer or ultrasound.`;
  } else {
    category = 'low';
    interp = `Score ${score}: Low probability of DVT (~ 5% prevalence). Highly sensitive D-dimer to rule out.`;
  }

  return { score, interpretation: interp, category };
}

// 12. PERC
export function calculatePERC(criteria: {
  age50: boolean;
  hr100: boolean;
  spo295: boolean;
  legSwelling: boolean;
  hemoptysis: boolean;
  surgeryTrauma: boolean;
  priorPeDvt: boolean;
  hormoneUse: boolean;
}): CalcResult {
  const count = Object.values(criteria).filter(Boolean).length;
  const isRuleOut = count === 0;

  return {
    score: `${count}/8 criteria met`,
    interpretation: isRuleOut
      ? 'PERC Negative (0/8 criteria met): In patients with low clinical suspicion, PE can be safely ruled out without D-dimer or imaging.'
      : `PERC Positive (${count}/8 criteria met): PERC cannot rule out PE. Proceed with diagnostic workup / D-dimer testing.`,
    category: isRuleOut ? 'normal' : 'high'
  };
}

// 13. PESI
export function calculatePESI(params: {
  age: number;
  male: boolean;
  cancer: boolean;
  hf: boolean;
  lungDisease: boolean;
  hr110: boolean;
  sbp100: boolean;
  rr30: boolean;
  temp36: boolean;
  alteredMental: boolean;
  spo290: boolean;
}): CalcResult {
  let score = params.age;
  if (params.male) score += 10;
  if (params.cancer) score += 30;
  if (params.hf) score += 10;
  if (params.lungDisease) score += 10;
  if (params.hr110) score += 20;
  if (params.sbp100) score += 30;
  if (params.rr30) score += 20;
  if (params.temp36) score += 20;
  if (params.alteredMental) score += 60;
  if (params.spo290) score += 20;

  let riskClass = 'Class I';
  let mortality = '< 1.6%';
  let category: CalcResult['category'] = 'low';

  if (score > 125) {
    riskClass = 'Class V';
    mortality = '10 - 24.5%';
    category = 'critical';
  } else if (score > 105) {
    riskClass = 'Class IV';
    mortality = '4.0 - 11.4%';
    category = 'high';
  } else if (score > 85) {
    riskClass = 'Class III';
    mortality = '3.2 - 7.1%';
    category = 'moderate';
  } else if (score > 65) {
    riskClass = 'Class II';
    mortality = '1.7 - 3.5%';
    category = 'low';
  }

  return {
    score: `${score} pts (${riskClass})`,
    interpretation: `PESI ${riskClass}: 30-day mortality risk is ${mortality}`,
    category
  };
}

// 14. Creatinine Clearance (Cockcroft-Gault)
export function calculateCrCl(age: number, weightKg: number, scrMgDl: number, isFemale: boolean): CalcResult {
  if (scrMgDl <= 0 || weightKg <= 0 || age <= 0) {
    return { score: 'N/A', interpretation: 'Please provide valid positive values for age, weight, and serum creatinine.' };
  }
  let crcl = ((140 - age) * weightKg) / (72 * scrMgDl);
  if (isFemale) crcl *= 0.85;

  const rounded = Math.round(crcl * 10) / 10;
  let category: CalcResult['category'] = 'normal';
  let interp = 'Normal or mildly decreased clearance (> 90 mL/min)';

  if (rounded < 15) {
    category = 'critical';
    interp = 'Kidney Failure (CrCl < 15 mL/min) — Urgent dosage adjustments & dialysis consideration';
  } else if (rounded < 30) {
    category = 'high';
    interp = 'Severe renal impairment (CrCl 15 - 29 mL/min) — Critical medication dose adjustments required';
  } else if (rounded < 60) {
    category = 'moderate';
    interp = 'Moderate renal impairment (CrCl 30 - 59 mL/min)';
  }

  return {
    score: `${rounded} mL/min`,
    interpretation: interp,
    category
  };
}

// 15. eGFR (CKD-EPI 2021)
export function calculateEGFR(age: number, scrMgDl: number, isFemale: boolean): CalcResult {
  if (scrMgDl <= 0 || age <= 0) {
    return { score: 'N/A', interpretation: 'Invalid parameters for eGFR.' };
  }

  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const scrOverKappa = scrMgDl / kappa;
  const minPart = Math.pow(Math.min(scrOverKappa, 1), alpha);
  const maxPart = Math.pow(Math.max(scrOverKappa, 1), -1.200);
  const agePart = Math.pow(0.9938, age);
  const femaleFactor = isFemale ? 1.012 : 1.0;

  const egfr = 142 * minPart * maxPart * agePart * femaleFactor;
  const rounded = Math.round(egfr);

  let stage = 'Stage G1 (Normal or high: >= 90 mL/min/1.73m²)';
  let category: CalcResult['category'] = 'normal';

  if (rounded < 15) {
    stage = 'Stage G5 (Kidney Failure: < 15 mL/min/1.73m²)';
    category = 'critical';
  } else if (rounded < 30) {
    stage = 'Stage G4 (Severely decreased: 15-29 mL/min/1.73m²)';
    category = 'high';
  } else if (rounded < 45) {
    stage = 'Stage G3b (Moderately to severely decreased: 30-44 mL/min/1.73m²)';
    category = 'moderate';
  } else if (rounded < 60) {
    stage = 'Stage G3a (Mildly to moderately decreased: 45-59 mL/min/1.73m²)';
    category = 'moderate';
  } else if (rounded < 90) {
    stage = 'Stage G2 (Mildly decreased: 60-89 mL/min/1.73m²)';
    category = 'normal';
  }

  return {
    score: `${rounded} mL/min/1.73m²`,
    interpretation: `CKD-EPI (2021): ${stage}`,
    category
  };
}

// 16. CURB-65
export function calculateCURB65(params: {
  confusion: boolean;
  ureaHigh: boolean; // BUN > 19 mg/dL or Urea > 7 mmol/L
  rr30: boolean;
  bpLow: boolean; // SBP < 90 or DBP <= 60
  age65: boolean;
}): CalcResult {
  let score = 0;
  if (params.confusion) score += 1;
  if (params.ureaHigh) score += 1;
  if (params.rr30) score += 1;
  if (params.bpLow) score += 1;
  if (params.age65) score += 1;

  let mortality = '< 1.5%';
  let category: CalcResult['category'] = 'low';
  let advice = 'Low risk — Consider outpatient treatment.';

  if (score >= 4) {
    mortality = '> 27%';
    category = 'critical';
    advice = 'Severe risk — Urgent hospital admission; assess for ICU level care.';
  } else if (score === 3) {
    mortality = '~ 14%';
    category = 'high';
    advice = 'Severe risk — Inpatient hospital admission; consider ICU.';
  } else if (score === 2) {
    mortality = '~ 9%';
    category = 'moderate';
    advice = 'Moderate risk — Short inpatient hospitalization or closely monitored outpatient.';
  }

  return {
    score,
    interpretation: `CURB-65 Score: ${score}/5 (30-day mortality ~ ${mortality})`,
    category,
    details: advice
  };
}

// 17. A-a Gradient
export function calculateAaGradient(pao2: number, paco2: number, fio2Percent: number, age: number): CalcResult {
  const fio2Fraction = fio2Percent > 1 ? fio2Percent / 100 : fio2Percent;
  const patm = 760;
  const ph2o = 47;
  const r = 0.8;

  const pao2Alveolar = (fio2Fraction * (patm - ph2o)) - (paco2 / r);
  const gradient = Math.round((pao2Alveolar - pao2) * 10) / 10;
  const expectedNormal = Math.round(((age / 4) + 4) * 10) / 10;

  const isElevated = gradient > expectedNormal;
  const category: CalcResult['category'] = isElevated ? (gradient > expectedNormal + 20 ? 'critical' : 'moderate') : 'normal';

  return {
    score: `${gradient} mmHg`,
    interpretation: isElevated
      ? `Elevated A-a Gradient (Expected normal for age: ~${expectedNormal} mmHg). Suggests V/Q mismatch, shunt, or diffusion impairment.`
      : `Normal A-a Gradient (Expected for age ~${expectedNormal} mmHg). Hypoxemia likely due to hypoventilation or low FiO₂.`,
    category
  };
}

// 18. Anion Gap
export function calculateAnionGap(na: number, cl: number, hco3: number): CalcResult {
  const ag = Math.round((na - (cl + hco3)) * 10) / 10;
  let category: CalcResult['category'] = 'normal';
  let interp = 'Normal Anion Gap (8 - 12 mEq/L)';

  if (ag > 12) {
    category = 'high';
    interp = `Elevated Anion Gap (${ag} mEq/L) — Consider ketoacidosis, lactic acidosis, toxic ingestions, or uremia.`;
  } else if (ag < 4) {
    category = 'low';
    interp = `Low Anion Gap (${ag} mEq/L) — Consider severe hypoalbuminemia, multiple myeloma, or bromide toxicity.`;
  }

  return { score: `${ag} mEq/L`, interpretation: interp, category };
}

// 19. Corrected Sodium in Hyperglycemia
export function calculateCorrectedSodium(measuredNa: number, glucoseMgDl: number): CalcResult {
  if (glucoseMgDl <= 100) {
    return { score: `${measuredNa} mEq/L`, interpretation: 'Glucose is normal; measured sodium is representative.' };
  }
  const excess = (glucoseMgDl - 100) / 100;
  const correctedKatz = Math.round((measuredNa + 1.6 * excess) * 10) / 10;
  const correctedHillier = Math.round((measuredNa + 2.4 * excess) * 10) / 10;

  return {
    score: `${correctedKatz} mEq/L`,
    interpretation: `Corrected Na: ${correctedKatz} mEq/L (Katz factor 1.6) / ${correctedHillier} mEq/L (Hillier factor 2.4)`,
    category: correctedKatz > 145 ? 'high' : correctedKatz < 135 ? 'low' : 'normal'
  };
}

// 20. Corrected Calcium for Albumin
export function calculateCorrectedCalcium(measuredCa: number, albuminGDl: number): CalcResult {
  const corrected = Math.round((measuredCa + 0.8 * (4.0 - albuminGDl)) * 10) / 10;
  let category: CalcResult['category'] = 'normal';
  let interp = 'Corrected calcium within normal range (8.5 - 10.5 mg/dL)';

  if (corrected < 8.5) {
    category = 'low';
    interp = `Hypocalcemia (Corrected: ${corrected} mg/dL) — Evaluate ionized calcium & ECG QTc`;
  } else if (corrected > 10.5) {
    category = 'high';
    interp = `Hypercalcemia (Corrected: ${corrected} mg/dL) — Assess hydration, malignancy, hyperparathyroidism`;
  }

  return { score: `${corrected} mg/dL`, interpretation: interp, category };
}

// 21. Free Water Deficit
export function calculateFreeWaterDeficit(weightKg: number, serumNa: number, isFemale: boolean, isElderly: boolean): CalcResult {
  if (serumNa <= 140) {
    return { score: '0 L', interpretation: 'Serum sodium <= 140 mEq/L; no free water deficit.' };
  }

  let tbwFraction = 0.6;
  if (isFemale) tbwFraction = isElderly ? 0.45 : 0.5;
  else if (isElderly) tbwFraction = 0.5;

  const tbw = weightKg * tbwFraction;
  const deficit = Math.round(tbw * ((serumNa / 140) - 1) * 10) / 10;

  return {
    score: `${deficit} Liters`,
    interpretation: `Estimated Free Water Deficit: ${deficit} L. Correct slowly (max 8-10 mEq/L per 24h to prevent cerebral edema).`,
    category: deficit > 4 ? 'critical' : 'moderate'
  };
}

// 22. BMI
export function calculateBMI(weightKg: number, heightCm: number): CalcResult {
  if (weightKg <= 0 || heightCm <= 0) return { score: 'N/A', interpretation: 'Enter valid height and weight.' };
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let interp = 'Normal weight (18.5 - 24.9 kg/m²)';
  let category: CalcResult['category'] = 'normal';

  if (bmi < 18.5) {
    interp = 'Underweight (< 18.5 kg/m²)';
    category = 'moderate';
  } else if (bmi >= 30) {
    interp = 'Obese (>= 30.0 kg/m²)';
    category = 'high';
  } else if (bmi >= 25) {
    interp = 'Overweight (25.0 - 29.9 kg/m²)';
    category = 'moderate';
  }

  return { score: `${bmi} kg/m²`, interpretation: interp, category };
}

// 23. MAP
export function calculateMAP(sbp: number, dbp: number): CalcResult {
  const map = Math.round((2 * dbp + sbp) / 3);
  let interp = 'Target adequate organ perfusion (MAP >= 65 mmHg)';
  let category: CalcResult['category'] = 'normal';

  if (map < 65) {
    interp = 'Inadequate organ perfusion pressure (MAP < 65 mmHg) — Consider fluid challenge or vasopressors';
    category = 'critical';
  }

  return { score: `${map} mmHg`, interpretation: interp, category };
}

// 24. Shock Index
export function calculateShockIndex(hr: number, sbp: number): CalcResult {
  if (sbp <= 0) return { score: 'N/A', interpretation: 'Invalid SBP' };
  const si = Math.round((hr / sbp) * 100) / 100;
  let interp = 'Normal Shock Index (0.5 - 0.7)';
  let category: CalcResult['category'] = 'normal';

  if (si >= 1.0) {
    interp = `Markedly elevated Shock Index (${si} >= 1.0) — High risk of hemodynamic collapse, severe shock, or massive hemorrhage`;
    category = 'critical';
  } else if (si > 0.7) {
    interp = `Mildly elevated Shock Index (${si} > 0.7) — Early or occult shock state, monitor closely`;
    category = 'moderate';
  }

  return { score: `${si}`, interpretation: interp, category };
}

// 25. QTc (Bazett, Fridericia, Framingham)
export function calculateQTc(qtMs: number, hrBpm: number): CalcResult {
  if (qtMs <= 0 || hrBpm <= 0) return { score: 'N/A', interpretation: 'Enter valid QT interval and Heart Rate.' };
  const rrSec = 60 / hrBpm;
  const bazett = Math.round(qtMs / Math.sqrt(rrSec));
  const fridericia = Math.round(qtMs / Math.cbrt(rrSec));

  let category: CalcResult['category'] = 'normal';
  let interp = 'Normal QTc interval (< 440 ms in men, < 460 ms in women)';

  if (bazett > 500) {
    category = 'critical';
    interp = `Severely prolonged QTc (Bazett: ${bazett} ms > 500 ms) — High risk of Torsades de Pointes; check electrolytes & review QT-prolonging medications.`;
  } else if (bazett > 460) {
    category = 'high';
    interp = `Prolonged QTc (Bazett: ${bazett} ms, Fridericia: ${fridericia} ms)`;
  }

  return {
    score: `${bazett} ms`,
    interpretation: `${interp} • Fridericia formula: ${fridericia} ms`,
    category
  };
}
