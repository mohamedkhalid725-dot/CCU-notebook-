export type BedStatus =
  | 'stable'
  | 'critical'
  | 'guarded'
  | 'deteriorating'
  | 'post-op'
  | 'discharged'
  | 'empty';

export type DischargeDisposition =
  | 'Discharged Home'
  | 'Transferred to Ward'
  | 'Transferred to Step-Down Unit'
  | 'Transferred to another Facility'
  | 'Deceased'
  | 'Against Medical Advice (AMA)'
  | 'Other';

export interface DischargeDetails {
  dischargeDate: string;
  disposition: DischargeDisposition;
  conditionAtDischarge: string;
  dischargeSummary: string;
  dischargeMedications?: string;
  followUpInstructions?: string;
  dischargedBy?: string;
}

export type SpecialtyMode = 'all' | 'ccu' | 'icu';

/**
 * Main application bottom-navigation tabs.
 */
export type AppTab =
  | 'home'
  | 'patients'
  | 'beds'
  | 'archive'
  | 'settings';

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

  // Chemistry
  na?: string;
  k?: string;
  cl?: string;
  urea?: string;
  creatinine?: string;
  glucose?: string;

  // Cardiac / CCU
  troponin?: string;
  ckmb?: string;
  bnp?: string;

  // Coagulation
  pt?: string;
  inr?: string;
  aptt?: string;

  // Inflammatory
  crp?: string;
  pct?: string;
  lactate?: string;
}

export interface ABGEntry {
  timestamp: string;
  ph: string;
  pco2: string;
  po2: string;
  hco3: string;
  be: string;
  lactate: string;
  fio2: string;
  pao2fio2Ratio?: string;
  interpretation?: string;
}

export interface CCUCardiology {
  ecgSummary: string;
  stElevationLeads?: string;
  arrhythmia?: string;

  echoEF: string;
  echoFindings: string;

  cathDate?: string;
  cathFindings?: string;
  culpritLesion?: string;
  stentType?: string;
  stentDetails?: string;

  antiplatelets: string;
  anticoagulation: string;

  timiFlowPost?: string;
}

export interface ICUScores {
  gcsTotal: number;
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;

  rass: number;

  sofaScore: number;

  pupils?: string;

  deliriumCamICU?:
    | 'positive'
    | 'negative'
    | 'unassessable';
}

export interface VentilatorSettings {
  mode: string;

  fio2: number | string;
  peep: number | string;

  tv: number | string;
  rate: number | string;

  totalRate?: number | string;

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

  category?:
    | 'antibiotic'
    | 'cardiac'
    | 'sedation'
    | 'gi'
    | 'other';
}

export interface Infusion {
  id: string;
  drug: string;
  doseRate: string;
  concentration?: string;
  lineLocation?: string;
}

export interface ProgressNote {
  id: string;

  timestamp: string;
  author: string;

  title?: string;

  subjective?: string;
  objective?: string;

  assessment: string;
  plan: string;

  tag?:
    | 'Round'
    | 'Event'
    | 'Procedure'
    | 'Consult'
    | 'Handover';
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

  // Basic patient information
  bedNumber: number | string;
  name: string;
  age: number | string;

  gender: 'Male' | 'Female' | 'Other';

  mrn: string;

  admissionDate: string;

  status: BedStatus;

  primaryDiagnosis: string;
  secondary
