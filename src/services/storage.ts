import { PatientRecord, AppSecuritySettings, FieldVisibilityConfig } from '../types';
import { encryptData, decryptData, hashPin, generateSalt } from './crypto';

const STORAGE_KEY_DATA = 'icu_patients_enc_data';
const STORAGE_KEY_SECURITY = 'icu_security_config';
const STORAGE_KEY_FIELDS = 'icu_fields_config';
const STORAGE_KEY_ACTIVE_BEDS = 'icu_total_beds';

export const DEFAULT_TOTAL_BEDS = 8;

export const DEFAULT_FIELD_CONFIG: FieldVisibilityConfig = {
  patientInfo: true,
  chiefComplaint: true,
  history: true,
  examination: true,
  vitals: true,
  ioBalance: true,
  labs: true,
  abg: true,
  ccuCardiology: true,
  ecg: true,
  echo: true,
  cathStent: true,
  icuScores: true,
  icuVentilator: true,
  vasopressorsInfusions: true,
  medications: true,
  procedures: true,
  progressNotesTimeline: true,
  consultations: true,
  imaging: true,
  dischargePlan: true,
};

// Initial data matching the user's explicit prompt
export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-1',
    bedNumber: 1,
    name: 'Ahmed',
    age: 58,
    gender: 'Male',
    mrn: 'MRN-78219',
    admissionDate: '2026-09-08 14:30',
    status: 'stable',
    primaryDiagnosis: 'STEMI (Acute Anterior Wall)',
    secondaryDiagnoses: ['Hypertension', 'Dyslipidemia', 'Former smoker'],
    chiefComplaint: 'Crushing central chest pain radiating to left jaw & shoulder for 2 hours',
    historyOfPresentIllness: '58-year-old male presenting with acute onset severe retrosternal squeezing chest pain (8/10 severity) accompanied by diaphoresis and mild nausea. Taken immediately to cath lab for primary PCI.',
    pastMedicalHistory: 'Essential HTN x 10 years on Amlodipine 5mg. No prior MI or PCI. No known drug allergies.',
    examinationSummary: 'Alert, oriented x 3, pain-free post-stenting. S1/S2 audible, no murmurs or S3 gallop. Chest: clear to auscultation bilaterally. Abdomen soft, non-tender. Right radial access site clean, soft, with intact distal radial pulse and no hematoma.',
    codeStatus: 'Full Code',
    attendingPhysician: 'Dr. Tarek Cardiology CCU',
    vitals: [
      {
        timestamp: '09/09 08:00 AM',
        hr: 74,
        bpSystolic: 122,
        bpDiastolic: 76,
        map: 91,
        rr: 16,
        spo2: 98,
        temp: 36.8,
        rhythm: 'NSR, no ectopy'
      },
      {
        timestamp: '09/09 12:00 PM',
        hr: 70,
        bpSystolic: 118,
        bpDiastolic: 74,
        map: 88,
        rr: 15,
        spo2: 99,
        temp: 36.7,
        rhythm: 'NSR'
      },
      {
        timestamp: '09/09 08:00 PM',
        hr: 72,
        bpSystolic: 116,
        bpDiastolic: 72,
        map: 86,
        rr: 16,
        spo2: 98,
        temp: 36.9,
        rhythm: 'Sinus rhythm'
      }
    ],
    ioRecords: [
      {
        timestamp: '09/09 08:00 PM',
        intakeIV: 1200,
        intakeEnteral: 600,
        intakeOther: 0,
        outputUrine: 1650,
        outputDrain: 0,
        outputGI: 0,
        notes: 'Good urine output > 1.2 ml/kg/hr post-contrast'
      }
    ],
    labs: [
      {
        timestamp: '09/09 06:00 AM',
        hb: '14.2',
        wbc: '9.8',
        platelets: '240',
        na: '138',
        k: '4.2',
        urea: '32',
        creatinine: '1.0',
        glucose: '134',
        troponin: '18.4',
        ckmb: '46',
        bnp: '120',
        pt: '12.8',
        inr: '1.05',
        aptt: '31'
      }
    ],
    abgRecords: [
      {
        timestamp: '09/08 15:00',
        ph: '7.41',
        pco2: '38',
        po2: '94',
        hco3: '24',
        be: '+0.2',
        lactate: '1.1',
        fio2: '28%',
        pao2fio2Ratio: '335',
        interpretation: 'Normal arterial blood gas'
      }
    ],
    ccuData: {
      ecgSummary: 'Acute Anterior STEMI with 3mm ST elevation in V1-V4, reciprocal ST depression in II, III, aVF. Post-PCI: complete ST resolution > 70% with early T-wave inversion.',
      stElevationLeads: 'V1, V2, V3, V4',
      arrhythmia: 'None (monitored continuous telemetry)',
      echoEF: '45%',
      echoFindings: 'Hypokinesis of anterior and apical myocardium. Preserved basal LV function. Normal RV size and function. Trace mitral regurgitation. No pericardial effusion.',
      cathDate: '2026-09-08 15:15',
      cathFindings: 'Right radial access (6 Fr). Left Main: normal. LAD: 95% thrombotic lesion in proximal LAD with TIMI 1 flow. LCx: mild 30% irregularities. RCA: dominant, normal.',
      culpritLesion: 'Proximal LAD',
      stentType: 'DES (Drug-Eluting Stent - Onyx)',
      stentDetails: '3.5 mm x 24 mm DES deployed at 16 atm',
      antiplatelets: 'DAPT: Aspirin 81 mg daily + Ticagrelor (Brilinta) 90 mg BID',
      anticoagulation: 'Unfractionated Heparin during PCI (ACT achieved 280s). Discontinued post-cath.',
      timiFlowPost: 'TIMI III flow with myocardial blush grade 3'
    },
    icuVentilator: {
      mode: 'Room Air (Nasal Cannula 2L/m)',
      fio2: '28%',
      peep: 0,
      tv: '-',
      rate: '16'
    },
    icuScores: {
      gcsTotal: 15,
      gcsEye: 4,
      gcsVerbal: 5,
      gcsMotor: 6,
      rass: 0,
      sofaScore: 1,
      pupils: 'Equal, round, reactive to light (3mm)'
    },
    medications: [
      { id: 'm1', name: 'Aspirin', dose: '81 mg', route: 'Oral', frequency: 'Once daily' },
      { id: 'm2', name: 'Ticagrelor (Brilinta)', dose: '90 mg', route: 'Oral', frequency: 'Twice daily' },
      { id: 'm3', name: 'Atorvastatin', dose: '80 mg', route: 'Oral', frequency: 'Once daily at night' },
      { id: 'm4', name: 'Metoprolol Tartrate', dose: '25 mg', route: 'Oral', frequency: 'Twice daily' },
      { id: 'm5', name: 'Ramipril', dose: '2.5 mg', route: 'Oral', frequency: 'Once daily' },
      { id: 'm6', name: 'Pantoprazole', dose: '40 mg', route: 'IV/Oral', frequency: 'Once daily' }
    ],
    infusions: [],
    procedures: [
      { id: 'p1', name: 'Coronary Angiography + Primary PCI to LAD', date: '2026-09-08 15:30', site: 'Right Radial', performer: 'Dr. Tarek' },
      { id: 'p2', name: 'Radial TR Band Hemostasis', date: '2026-09-08 17:00', site: 'Right Radial Wrist', performer: 'Cath Lab Team' }
    ],
    progressNotes: [
      {
        id: 'n1',
        timestamp: '09/08 — 06:30 PM',
        author: 'Dr. CCU Fellow',
        tag: 'Round',
        subjective: 'Patient settled in CCU Bed 1 post-cath. Pain-free.',
        objective: 'Vitals: BP 120/78, HR 76 NSR, SpO2 98% on 2L NC. Radial site soft and clean. No bleeding.',
        assessment: '58yo M post anterior STEMI status post primary PCI to pLAD with DES. Hemodynamically stable.',
        plan: '1. Bed rest for 6h.\n2. Continue DAPT, high-intensity statin, beta blocker.\n3. Serial cardiac enzymes at 06:00 tomorrow.\n4. Repeat Transthoracic Echo prior to step-down.'
      },
      {
        id: 'n2',
        timestamp: '09/09 — 08:00 PM',
        author: 'Dr. On Duty',
        tag: 'Handover',
        subjective: 'Patient conscious, alert, hemodynamically stable. No chest discomfort or dyspnea.',
        objective: 'Vitals stable: BP 116/72, HR 72 NSR, SpO2 98% room air. Clear chest, soft abdomen. Urine output adequate (1650 ml/24h).',
        assessment: 'Day 1 Post-STEMI PCI LAD. Uncomplicated clinical course.',
        plan: '1. Ambulate with telemetry monitoring.\n2. If stable, plan step-down transfer to cardiology ward tomorrow morning.\n3. Cardiac rehab education & lipid profile optimization.'
      }
    ],
    consultations: 'Cardiology (Admitting team): Plan for ward transfer tomorrow if tele event-free.',
    imagingSummary: 'CXR: Normal cardiac silhouette, clear lung fields, no pulmonary congestion or pneumothorax.',
    dischargeTransferPlan: 'Transfer to Ward / Step-down expected tomorrow 09/10.',
    lastUpdated: '2026-09-09 20:00'
  },
  {
    id: 'pat-2',
    bedNumber: 2,
    name: 'Mohamed',
    age: 42,
    gender: 'Male',
    mrn: 'MRN-84302',
    admissionDate: '2026-09-09 03:15',
    status: 'critical',
    primaryDiagnosis: 'Diabetic Ketoacidosis (DKA) - Severe',
    secondaryDiagnoses: ['Type 1 Diabetes Mellitus', 'Dehydration', 'Pre-renal acute kidney injury'],
    chiefComplaint: 'Shortness of breath (Kussmaul breathing), persistent vomiting x 2 days, lethargy',
    historyOfPresentIllness: '42yo male with known T1DM who missed insulin doses for 3 days due to gastroenteritis. Admitted with tachypnea, severe dehydration, fruity breath, blood glucose 480 mg/dL, and marked ketonuria.',
    pastMedicalHistory: 'Type 1 DM since age 16 on basal-bolus regimen. Prior DKA episode 3 years ago.',
    examinationSummary: 'Lethargic but arousable (GCS 13: E3, V4, M6). Dry mucous membranes, sunken eyes, skin turgor reduced. Chest: deep rapid Kussmaul respirations, clear lung bases. Tachycardic S1/S2, dry peripheral pulses.',
    codeStatus: 'Full Code',
    attendingPhysician: 'Dr. ICU Intensivist',
    vitals: [
      {
        timestamp: '09/09 04:00 AM',
        hr: 124,
        bpSystolic: 94,
        bpDiastolic: 58,
        map: 70,
        rr: 28,
        spo2: 96,
        temp: 37.4,
        rhythm: 'Sinus Tachycardia'
      },
      {
        timestamp: '09/09 12:00 PM',
        hr: 104,
        bpSystolic: 106,
        bpDiastolic: 66,
        map: 79,
        rr: 22,
        spo2: 98,
        temp: 37.1,
        rhythm: 'Sinus Tachycardia'
      },
      {
        timestamp: '09/09 08:00 PM',
        hr: 92,
        bpSystolic: 114,
        bpDiastolic: 70,
        map: 84,
        rr: 18,
        spo2: 99,
        temp: 36.9,
        rhythm: 'Normal Sinus Rhythm'
      }
    ],
    ioRecords: [
      {
        timestamp: '09/09 08:00 PM',
        intakeIV: 4500,
        intakeEnteral: 0,
        intakeOther: 0,
        outputUrine: 2100,
        outputDrain: 0,
        outputGI: 350,
        notes: 'Net positive fluid balance +2050 ml for resuscitation'
      }
    ],
    labs: [
      {
        timestamp: '09/09 03:30 AM',
        hb: '15.6',
        wbc: '16.2',
        platelets: '310',
        na: '131',
        k: '5.6',
        cl: '98',
        urea: '58',
        creatinine: '2.1',
        glucose: '480',
        troponin: '<0.01',
        ckmb: '18',
        bnp: '45',
        lactate: '3.4',
        pt: '13.1',
        inr: '1.08'
      },
      {
        timestamp: '09/09 07:00 PM',
        hb: '13.8',
        wbc: '11.4',
        platelets: '280',
        na: '137',
        k: '4.3',
        cl: '104',
        urea: '41',
        creatinine: '1.4',
        glucose: '190',
        troponin: '<0.01',
        lactate: '1.6'
      }
    ],
    abgRecords: [
      {
        timestamp: '09/09 03:30 AM',
        ph: '7.12',
        pco2: '21',
        po2: '98',
        hco3: '6.8',
        be: '-18.5',
        lactate: '3.4',
        fio2: 'Room Air',
        interpretation: 'Severe High Anion Gap Metabolic Acidosis (AG 26) with partial respiratory compensation'
      },
      {
        timestamp: '09/09 07:30 PM',
        ph: '7.34',
        pco2: '32',
        po2: '102',
        hco3: '17.2',
        be: '-7.0',
        lactate: '1.6',
        fio2: 'Room Air',
        interpretation: 'Improving metabolic acidosis, anion gap closing (AG 16)'
      }
    ],
    ccuData: {
      ecgSummary: 'Sinus tachycardia, peaked T waves initially on arrival, normalized after K+ correction. No ST-T ischemic changes.',
      echoEF: '60%',
      echoFindings: 'Normal global LV systolic function, hyperdynamic circulation, IVC collapsed on inspiration (volume depleted).',
      antiplatelets: 'None indicated',
      anticoagulation: 'LMWH Enoxaparin 40 mg SC daily for VTE prophylaxis'
    },
    icuVentilator: {
      mode: 'Spontaneous (Nasal Cannula 3L/min)',
      fio2: '32%',
      peep: 0,
      tv: '-',
      rate: '18'
    },
    icuScores: {
      gcsTotal: 14,
      gcsEye: 4,
      gcsVerbal: 4,
      gcsMotor: 6,
      rass: -1,
      sofaScore: 4,
      pupils: '3mm reactive',
      deliriumCamICU: 'negative'
    },
    medications: [
      { id: 'm1', name: 'Regular Insulin Protocol', dose: 'Variable (currently 4 units/hr)', route: 'IV Infusion', frequency: 'Continuous titration' },
      { id: 'm2', name: 'Potassium Chloride', dose: '20 mEq / L fluid', route: 'IV', frequency: 'Continuous' },
      { id: 'm3', name: '0.9% Normal Saline / D5 0.45% NS', dose: '150 ml/hr', route: 'IV', frequency: 'Continuous' },
      { id: 'm4', name: 'Enoxaparin', dose: '40 mg', route: 'Subcutaneous', frequency: 'Once daily' },
      { id: 'm5', name: 'Ondansetron', dose: '4 mg', route: 'IV', frequency: 'PRN nausea' }
    ],
    infusions: [
      { id: 'inf1', drug: 'Regular Human Insulin', doseRate: '4.0 units/hr', concentration: '100 units / 100ml NS', lineLocation: 'Left forearm IV' },
      { id: 'inf2', drug: 'D5 0.45% NaCl + 20 mEq KCl', doseRate: '150 ml/hr', lineLocation: 'Right AC IV' }
    ],
    procedures: [
      { id: 'pr1', name: 'Radial Arterial Line for serial ABGs', date: '2026-09-09 04:00', site: 'Left Radial', performer: 'ICU Fellow' },
      { id: 'pr2', name: 'Urinary Catheter Placement', date: '2026-09-09 03:45', site: 'Foley 16 Fr', performer: 'ICU Nurse' }
    ],
    progressNotes: [
      {
        id: 'n1',
        timestamp: '09/09 — 04:30 AM',
        author: 'Dr. ICU Registrar',
        tag: 'Round',
        subjective: 'Patient admitted with profound DKA, severe metabolic acidosis pH 7.12, HCO3 6.8.',
        objective: 'Vitals: HR 124, BP 94/58, Glucose 480 mg/dL, K+ 5.6. Initiated 2L bolus crystalloid + insulin drip at 0.1 u/kg/hr.',
        assessment: 'Severe DKA with pre-renal azotemia and high anion gap metabolic acidosis.',
        plan: '1. Hourly point-of-care glucose checks.\n2. Potassium replacement once urine output confirmed and K < 5.2.\n3. Add D5W when blood glucose falls below 250 mg/dL.'
      },
      {
        id: 'n2',
        timestamp: '09/09 — 08:00 PM',
        author: 'Dr. Intensivist',
        tag: 'Round',
        subjective: 'Patient much more alert, conversational, nausea resolved, breathing comfortably without Kussmaul pattern.',
        objective: 'ABG improved: pH 7.34, HCO3 17.2, BG 190 mg/dL, K+ 4.3. Fluid balance positive +2050ml. Urine output robust (90-110 ml/hr).',
        assessment: 'DKA resolving, acidosis closing, renal function recovering.',
        plan: '1. Continue insulin drip with D5W until anion gap < 12 and HCO3 > 18.\n2. Overlap with subcutaneous Glargine 2 hours before stopping IV insulin.\n3. Transition to diabetic diet when fully alert.'
      }
    ],
    consultations: 'Endocrinology: Plan transition to SC insulin tomorrow morning after DKA resolution criteria met.',
    imagingSummary: 'CXR: Clear lungs, no focal infiltrate or pneumothorax.',
    dischargeTransferPlan: 'Transfer to step-down ward expected tomorrow post-insulin transition.',
    lastUpdated: '2026-09-09 20:00'
  },
  {
    id: 'pat-3',
    bedNumber: '',
    previousBedNumber: 3,
    isDischarged: true,
    dischargeDetails: {
      dischargeDate: '2026-09-09 11:30',
      disposition: 'Transferred to Ward',
      conditionAtDischarge: 'Stable & Improved',
      dischargeSummary: '52-year-old male treated for Acute Decompensated Heart Failure (HFrEF 30%). Successfully diuresed with IV Furosemide infusion with negative fluid balance of 4.2L. Dyspnea resolved, NYHA functional class improved from IV to II. Converted to oral guideline-directed medical therapy (GDMT). Transferred to cardiology ward for mobilization.',
      dischargeMedications: '1. Sacubitril/Valsartan 24/26mg BID\n2. Empagliflozin 10mg OD\n3. Bisoprolol 2.5mg OD\n4. Spironolactone 25mg OD\n5. Furosemide 40mg PO morning',
      followUpInstructions: 'Monitor daily weight and renal function on floor. Repeat Echo in 3 months.',
      dischargedBy: 'Dr. Tarek Cardiology CCU'
    },
    name: 'Khaled',
    age: 52,
    gender: 'Male',
    mrn: 'MRN-64102',
    admissionDate: '2026-09-06 09:15',
    status: 'discharged',
    primaryDiagnosis: 'Acute Decompensated Heart Failure (HFrEF)',
    secondaryDiagnoses: ['Ischemic Cardiomyopathy', 'Type 2 Diabetes', 'Hypertension'],
    chiefComplaint: 'Severe orthopnea, PND, and bilateral lower limb edema for 4 days',
    historyOfPresentIllness: 'Known ischemic cardiomyopathy patient presented with acute pulmonary congestion, unable to lie flat.',
    pastMedicalHistory: 'Prior MI in 2022. Diabetic nephropathy stage 2.',
    examinationSummary: 'Chest clear, no crackles, JVP flat, trace pedal edema.',
    codeStatus: 'Full Code',
    attendingPhysician: 'Dr. Tarek Cardiology CCU',
    vitals: [
      {
        timestamp: '09/09 11:00 AM',
        hr: 72,
        bpSystolic: 115,
        bpDiastolic: 70,
        map: 85,
        rr: 16,
        spo2: 98,
        temp: 36.7,
        rhythm: 'Normal Sinus Rhythm'
      }
    ],
    ioRecords: [],
    labs: [
      {
        timestamp: '09/09 06:00 AM',
        hb: '13.2',
        wbc: '7.8',
        platelets: '240',
        na: '138',
        k: '4.2',
        cl: '101',
        urea: '38',
        creatinine: '1.1',
        glucose: '135',
        troponin: '<0.01',
        bnp: '280'
      }
    ],
    abgRecords: [],
    ccuData: {
      ecgSummary: 'Sinus rhythm, old anterior Q waves, no acute ST changes.',
      echoEF: '30-35%',
      echoFindings: 'Moderate MR, trace TR. Anterior & apical hypokinesia. Decreased global LV systolic function.',
      cathFindings: 'Old LAD stent patent',
      antiplatelets: 'Aspirin 81 mg OD',
      anticoagulation: 'None'
    },
    icuVentilator: {
      mode: 'Room Air',
      peep: 0,
      fio2: '21%',
      tv: '-',
      rate: '16'
    },
    icuScores: {
      gcsTotal: 15,
      gcsEye: 4,
      gcsVerbal: 5,
      gcsMotor: 6,
      rass: 0,
      sofaScore: 1,
      pupils: 'Equal & reactive'
    },
    medications: [],
    infusions: [],
    procedures: [],
    progressNotes: [
      {
        id: 'note-khaled-1',
        timestamp: '09/09 — 11:30 AM',
        author: 'Dr. Tarek Cardiology CCU',
        tag: 'Handover',
        subjective: 'Patient feeling well, ambulating in room without dyspnea.',
        objective: 'BP 115/70, HR 72, SpO2 98% room air. Chest clear.',
        assessment: 'Acute pulmonary edema resolved. GDMT initiated.',
        plan: 'Transfer to cardiology ward Bed 412.'
      }
    ],
    consultations: 'Cardiology HF team consulted.',
    imagingSummary: 'Chest X-Ray: Pulmonary venous congestion completely cleared.',
    dischargeTransferPlan: 'Transferred to Cardiology floor.',
    lastUpdated: '2026-09-09 11:30'
  }
];

export function getSecuritySettings(): AppSecuritySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SECURITY);
    if (!raw) {
      return {
        isPinSet: false,
        hashedPin: '',
        pinSalt: '',
        autoLockMinutes: 5,
        biometricEnabled: false,
        lastUnlockedTimestamp: Date.now()
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      isPinSet: false,
      hashedPin: '',
      pinSalt: '',
      autoLockMinutes: 5,
      biometricEnabled: false,
      lastUnlockedTimestamp: Date.now()
    };
  }
}

export function saveSecuritySettings(settings: AppSecuritySettings): void {
  localStorage.setItem(STORAGE_KEY_SECURITY, JSON.stringify(settings));
}

export function getFieldConfig(): FieldVisibilityConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIELDS);
    if (!raw) return { ...DEFAULT_FIELD_CONFIG };
    return { ...DEFAULT_FIELD_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_FIELD_CONFIG };
  }
}

export function saveFieldConfig(config: FieldVisibilityConfig): void {
  localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(config));
}

export function getTotalBeds(): number {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_BEDS);
  if (!stored) return DEFAULT_TOTAL_BEDS;
  const num = parseInt(stored, 10);
  return isNaN(num) || num < 4 ? DEFAULT_TOTAL_BEDS : num;
}

export function setTotalBeds(beds: number): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_BEDS, beds.toString());
}

/**
 * Load patients from local storage.
 * If PIN is set and encryption is enabled, requires current active PIN.
 */
export async function loadPatients(activePin?: string): Promise<PatientRecord[]> {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_DATA);
    const security = getSecuritySettings();

    if (!rawData) {
      // First run: persist initial patients
      await savePatients(INITIAL_PATIENTS, activePin);
      return INITIAL_PATIENTS;
    }

    if (security.isPinSet && activePin) {
      // Encrypted data format
      try {
        const decryptedJson = await decryptData(rawData, activePin, security.pinSalt);
        return JSON.parse(decryptedJson);
      } catch (err) {
        console.warn('Could not decrypt with provided PIN, attempting fallback or re-throw', err);
        throw err;
      }
    } else {
      // Unencrypted or initial
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // May be encrypted but no pin provided yet
      }
      return INITIAL_PATIENTS;
    }
  } catch (err) {
    console.error('Error loading patients:', err);
    return INITIAL_PATIENTS;
  }
}

/**
 * Save patients to local storage, encrypting if PIN is set.
 */
export async function savePatients(patients: PatientRecord[], activePin?: string): Promise<void> {
  try {
    const security = getSecuritySettings();
    const jsonStr = JSON.stringify(patients);

    if (security.isPinSet && activePin) {
      const encrypted = await encryptData(jsonStr, activePin, security.pinSalt);
      localStorage.setItem(STORAGE_KEY_DATA, encrypted);
    } else {
      localStorage.setItem(STORAGE_KEY_DATA, jsonStr);
    }
  } catch (err) {
    console.error('Error saving patients:', err);
    throw err;
  }
}

/**
 * Setup or change PIN
 */
export async function setupNewPin(newPin: string, currentPin?: string): Promise<void> {
  const currentPatients = await loadPatients(currentPin);
  const salt = generateSalt();
  const hash = await hashPin(newPin, salt);

  const newSecurity: AppSecuritySettings = {
    isPinSet: true,
    hashedPin: hash,
    pinSalt: salt,
    autoLockMinutes: 5,
    biometricEnabled: false,
    lastUnlockedTimestamp: Date.now()
  };

  saveSecuritySettings(newSecurity);
  // Re-save patient data encrypted with new PIN
  await savePatients(currentPatients, newPin);
}

/**
 * Export full backup as encrypted JSON file
 */
export async function exportEncryptedBackup(passphrase: string, patients: PatientRecord[]): Promise<string> {
  const backupSalt = generateSalt();
  const rawPayload = JSON.stringify({
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    patients: patients,
    fieldConfig: getFieldConfig(),
    totalBeds: getTotalBeds()
  });

  const cipher = await encryptData(rawPayload, passphrase, backupSalt);
  const backupFileContent = JSON.stringify({
    format: 'ICU_NOTEBOOK_BACKUP',
    salt: backupSalt,
    payload: cipher,
    timestamp: Date.now()
  });

  return backupFileContent;
}

/**
 * Import backup from JSON file
 */
export async function importEncryptedBackup(fileContent: string, passphrase: string): Promise<PatientRecord[]> {
  const parsed = JSON.parse(fileContent);
  if (parsed.format !== 'ICU_NOTEBOOK_BACKUP' || !parsed.salt || !parsed.payload) {
    throw new Error('Invalid backup file format');
  }

  const decryptedJson = await decryptData(parsed.payload, passphrase, parsed.salt);
  const data = JSON.parse(decryptedJson);
  if (!Array.isArray(data.patients)) {
    throw new Error('Corrupted patient data in backup');
  }

  if (data.fieldConfig) {
    saveFieldConfig(data.fieldConfig);
  }
  if (data.totalBeds) {
    setTotalBeds(data.totalBeds);
  }

  return data.patients;
}

/**
 * Wipe all local data and reset to defaults
 */
export function wipeAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEY_DATA);
  localStorage.removeItem(STORAGE_KEY_SECURITY);
  localStorage.removeItem(STORAGE_KEY_FIELDS);
  localStorage.removeItem(STORAGE_KEY_ACTIVE_BEDS);
}
