export type BedStatus = 'stable' | 'critical' | 'guarded' | 'deteriorating' | 'post-op' | 'discharged' | 'empty';

export type DischargeDisposition = 
  | 'Discharged Home'
  | 'Transferred to Ward'
  | 'Transferred to Step-Down Unit'
  | 'Transferred to another Facility'
  | 'Deceased'
  | 'Against Medical Advice (AMA)'
  | 'Other';

export interface DischargeDetails {
  dischargeDate: string; // e.g. "2026-09-09 15:30"
  disposition: DischargeDisposition;
  conditionAtDischarge: string; // e.g. "Stable & Improved", "Guarded", "Deceased"
  dischargeSummary: string;
  dischargeMedications?: string;
  followUpInstructions?: string;
  dischargedBy?: string;
}

export type SpecialtyMode = 'all' | 'ccu' | 'icu';

export interface VitalSignEntry {
  timestamp: string;
  hr: number | string;
  bpSystolic: number | string;
  bpDiastolic: number | string;
  map?: number | string;
  rr: number | string;
  spo2: number | string;
  temp: number | string;
  cvp?: number | string;
  rhythm?: string;
}

export interface IOEntry {
  timestamp: string;
  intakeIV: number;
  intakeEnteral: number;
  intakeOther: number;
  outputUrine: number;
  outputDrain: number;
  outputGI: number;
  notes?: string;
}

export interface LabResults {
  timestamp: string;
  // CBC
  hb?: string;
  wbc?: string;
  platelets?: string;
  // Chem
  na?: string;
  k?: string;
  cl?: string;
  urea?: string;
  creatinine?: string;
  glucose?: string;
  // Cardiac (CCU)
  troponin?: string;
  ckmb?: string;
  bnp?: string;
  // Coag
  pt?: string;
  inr?: string;
  aptt?: string;
  // Inflammatory
  crp?: string;
  pct?: string; // Procalcitonin
  lactate?: string;
}

export interface ABGEntry {
  timestamp: string;
  ph: string;
  pco2: string;
  po2: string;
  hco3: string;
  be: string; // Base Excess
  lactate: string;
  fio2: string;
  pao2fio2Ratio?: string;
  interpretation?: string;
}

export interface CCUCardiology {
  ecgSummary: string;
  stElevationLeads?: string;
  arrhythmia?: string;
  echoEF: string; // Ejection Fraction %
  echoFindings: string;
  cathDate?: string;
  cathFindings?: string;
  culpritLesion?: string; // e.g. LAD, RCA
  stentType?: string; // e.g. DES, BMS
  stentDetails?: string; // size x length
  antiplatelets: string; // e.g. Aspirin 81mg + Ticagrelor 90mg BID
  anticoagulation: string; // e.g. Enoxaparin 1mg/kg or Heparin drip
  timiFlowPost?: string;
}

export interface ICUScores {
  gcsTotal: number;
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  rass: number; // -5 to +4
  sofaScore: number;
  pupils?: string;
  deliriumCamICU?: 'positive' | 'negative' | 'unassessable';
}

export interface VentilatorSettings {
  mode: string; // e.g. VCV, PCV, PSV, PRVC, High Flow, BiPAP
  fio2: number | string; // %
  peep: number | string; // cmH2O
  tv: number | string; // Tidal volume ml
  rate: number | string; // Set RR
  totalRate?: number | string; // Total RR
  pPeak?: number | string;
  pPlat?: number | string;
  etTubeSize?: string;
  etTubeDepth?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  category?: 'antibiotic' | 'cardiac' | 'sedation' | 'gi' | 'other';
}

export interface Infusion {
  id: string;
  drug: string;
  doseRate: string; // e.g. 0.1 mcg/kg/min or 5 ml/hr
  concentration?: string;
  lineLocation?: string;
}

export interface ProgressNote {
  id: string;
  timestamp: string; // formatted e.g. "09/09 — 08:00 PM"
  author: string;
  title?: string;
  subjective?: string;
  objective?: string;
  assessment: string;
  plan: string;
  tag?: 'Round' | 'Event' | 'Procedure' | 'Consult' | 'Handover';
}

export interface Procedure {
  id: string;
  name: string;
  date: string;
  site?: string;
  performer?: string;
  notes?: string;
}

export interface PatientRecord {
  id: string;
  bedNumber: number | string;
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
  admissionDate: string;
  status: BedStatus;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  examinationSummary: string;
  codeStatus: 'Full Code' | 'DNR' | 'DNI' | 'Modified';
  attendingPhysician: string;
  
  // Clinical Sub-systems
  vitals: VitalSignEntry[];
  ioRecords: IOEntry[];
  labs: LabResults[];
  abgRecords: ABGEntry[];
  ccuData: CCUCardiology;
  icuVentilator: VentilatorSettings;
  icuScores: ICUScores;
  medications: Medication[];
  infusions: Infusion[];
  procedures: Procedure[];
  progressNotes: ProgressNote[];
  consultations: string;
  imagingSummary: string;
  dischargeTransferPlan: string;

  // Discharge & Medical Records Archive
  isDischarged?: boolean;
  dischargeDetails?: DischargeDetails;
  previousBedNumber?: number | string;

  // Custom Fields (user-defined)
  customFields?: Record<string, string>;
  
  lastUpdated: string;
}

export interface FieldVisibilityConfig {
  patientInfo: boolean;
  chiefComplaint: boolean;
  history: boolean;
  examination: boolean;
  vitals: boolean;
  ioBalance: boolean;
  labs: boolean;
  abg: boolean;
  ccuCardiology: boolean;
  ecg: boolean;
  echo: boolean;
  cathStent: boolean;
  icuScores: boolean;
  icuVentilator: boolean;
  vasopressorsInfusions: boolean;
  medications: boolean;
  procedures: boolean;
  progressNotesTimeline: boolean;
  consultations: boolean;
  imaging: boolean;
  dischargePlan: boolean;
}

export interface AppSecuritySettings {
  isPinSet: boolean;
  hashedPin: string;
  pinSalt: string;
  autoLockMinutes: number; // 0 = immediate on blur, 1, 5, 15, -1 = disabled
  biometricEnabled: boolean;
  lastUnlockedTimestamp: number;
}
