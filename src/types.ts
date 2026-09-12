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
  id?: string;
  timestamp: string;
  intakeIV: number;
  intakeEnteral?: number;
  intakeOral?: number;
  intakeBlood?: number;
  intakeOther: number;
  totalIntake?: number;
  outputUrine: number;
  outputDrain: number;
  outputGI?: number;
  outputStool?: number;
  outputOther?: number;
  totalOutput?: number;
  netBalance?: number;
  runningBalance?: number;
  dailyBalance?: number;
  notes?: string;
}

export interface LabItem {
  id?: string;
  name: string;
  result: string;
  unit: string;
  refRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  notes?: string;
}

export interface LabPanelRecord {
  id: string;
  timestamp: string;
  panelName: string;
  items: LabItem[];
  notes?: string;
}

export interface ECGRecord {
  id: string;
  timestamp: string;
  interpretation: string;
  rhythm: string;
  rate?: number | string;
  axis?: string;
  prInterval?: string;
  qrsDuration?: string;
  qtc?: string;
  stTChanges?: string;
  notes?: string;
  imageUrl?: string;
}

export interface EchoStudy {
  id: string;
  timestamp: string;
  ef: string;
  lvDimensions?: string;
  lvSystolicFunction?: string;
  rvAssessment?: string;
  tapse?: string;
  laRa?: string;
  rwma?: string;
  diastolicFunction?: string;
  valvularAssessment?: string;
  pasp?: string;
  ivc?: string;
  pericardium?: string;
  otherMeasurements?: string;
  findings?: string;
  impression: string;
  imageUrl?: string;
}

export interface ImagingStudy {
  id: string;
  timestamp: string;
  type:
    | 'Chest X-ray'
    | 'CT Chest'
    | 'CT Brain'
    | 'CT Abdomen / Pelvis'
    | 'CT Angiography'
    | 'Ultrasound / POCUS'
    | 'Echocardiogram'
    | 'MRI'
    | 'Other';
  indication?: string;
  findings: string;
  impression: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface BedDefinition {
  id: string;
  name: string;
  bedNumber?: number | string;
  department?: 'CCU' | 'ICU' | 'Step-down' | 'General';
  status?: 'active' | 'maintenance';
}

export type AppTheme = 'light' | 'dark' | 'system';

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
  spo2?: number | string;
  ventMode?: string;
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

export interface VentilatorRecord {
  id: string;
  timestamp: string;
  recordedBy?: string;
  // Mode & Airway
  mode: string;
  airwayType?: 'ETT' | 'Tracheostomy' | 'NIV Mask' | 'High-Flow Nasal Cannula (HFNC)' | 'T-Piece';
  etTubeSize?: string;
  etTubeDepth?: string;
  // Oxygenation
  fio2: number | string;
  peep: number | string;
  spo2Target?: string;
  // Volume / Pressure
  tidalVolume?: number | string;
  inspiratoryPressure?: number | string;
  pressureSupport?: number | string;
  peakPressure?: number | string;
  plateauPressure?: number | string;
  drivingPressure?: number | string;
  // Respiratory Rate
  setRate?: number | string;
  actualRate?: number | string;
  // Timing & Flow
  ieRatio?: string;
  inspiratoryTime?: number | string;
  inspiratoryFlow?: number | string;
  // Additional Parameters
  triggerType?: 'Flow' | 'Pressure';
  sensitivity?: string;
  riseTime?: string;
  // Monitoring & Mechanics
  minuteVentilation?: number | string;
  exhaledTidalVolume?: number | string;
  compliance?: number | string;
  autoPeep?: number | string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate?: string;
  stopDate?: string;
  status?: 'active' | 'held' | 'discontinued';
  notes?: string;

  category?:
    | 'antibiotic'
    | 'cardiac'
    | 'sedation'
    | 'gi'
    | 'other';
}

export interface Infusion {
  id: string;
  drug?: string;
  name?: string;
  doseRate?: string;
  concentration?: string;
  lineLocation?: string;
  rate?: string;
  dose?: string;
  unit?: string;
  target?: string;
  route?: string;
  startTime?: string;
  status?: 'active' | 'held' | 'stopped' | 'titrating' | 'running';
  notes?: string;
}

export interface InfusionDrug {
  id: string;
  name: string;
  drug?: string;
  rate: string;
  unit: string;
  concentration?: string;
  target?: string;
  startTime?: string;
  notes?: string;
  status: 'active' | 'titrating' | 'held' | 'stopped';
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
  content?: string;

  tag?:
    | 'Round'
    | 'Event'
    | 'Procedure'
    | 'Consult'
    | 'Handover';
}

export interface DailyRoundNote {
  id: string;
  timestamp: string;
  dayOfAdmission?: string;
  subjective: string;
  objectiveVitals?: string;
  objectiveExam?: string;
  objectiveLabs?: string;
  assessment: string;
  planGeneral?: string;
  planBySystem?: {
    cvs?: string;
    rs?: string;
    cns?: string;
    renal?: string;
    gi?: string;
    id?: string;
    hematology?: string;
    prophylaxis?: string;
  };
  todoList?: Array<{ id: string; text: string; done: boolean }>;
  author?: string;
  title?: string;
  objective?: string;
  plan?: string;
  content?: string;
  tag?: 'Round' | 'Event' | 'Procedure' | 'Consult' | 'Handover';
}

export interface ClinicalEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  category?: 'code' | 'procedure' | 'lab' | 'med' | 'imaging' | 'status_change' | 'general';
  severity?: 'routine' | 'urgent' | 'critical' | 'severe' | 'moderate' | 'mild';
  provider?: string;
}

export interface Procedure {
  id: string;
  name?: string;
  procedureName?: string;
  date?: string;
  timestamp?: string;

  site?: string;
  performer?: string;
  operator?: string;
  indication?: string;
  details?: string;
  complications?: string;
  postProcedurePlan?: string;
  notes?: string;
}

export interface ProcedureRecord {
  id: string;
  name?: string;
  procedureName: string;
  date?: string;
  timestamp: string;

  site?: string;
  performer?: string;
  operator?: string;
  indication?: string;
  details?: string;
  complications?: string;
  postProcedurePlan?: string;
  notes?: string;
}

export type FluidBalanceRecord = IOEntry;

export interface DischargePlan {
  dischargeDate?: string;
  dischargeDiagnosis?: string;
  hospitalCourse?: string;
  conditionAtDischarge?: string;
  destination?: string;
  condition?: string;
  dischargeMedications?: string;
  followUpInstructions?: string;
  warningSigns?: string;
  attendingPhysician?: string;
  dischargeSummary?: string;
  medications?: string;
  followUp?: string;
  pendingInvestigations?: string;
}

export interface PatientRecord {
  id: string;

  // Basic patient information
  bedNumber: number | string;
  bedName?: string;
  previousBedNumber?: number | string;
  name: string;
  age: number | string;

  gender: 'Male' | 'Female' | 'Other';

  mrn: string;

  admissionDate: string;

  status: BedStatus;
  isDischarged?: boolean;

  primaryDiagnosis: string;
  diagnosis?: string;
  secondaryDiagnoses: string[];
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory?: string;
  drugHistory?: string;
  allergies?: string;
  familyHistory?: string;
  socialHistory?: string;

  // Physical Examination
  examinationSummary: string;
  generalExamination?: string;
  cardiovascularExamination?: string;
  respiratoryExamination?: string;
  abdominalExamination?: string;
  cnsExamination?: string;
  peripheralVascularExamination?: string;
  otherExamination?: string;

  codeStatus?: string;
  attendingPhysician?: string;

  // Clinical tracking
  vitals: VitalSignEntry[];
  ioRecords: IOEntry[];
  fluidBalanceRecords?: IOEntry[];
  labs: LabResults[];
  labPanels?: LabPanelRecord[];
  abgRecords: ABGEntry[];

  // Diagnostic Studies (Multiple records)
  ecgRecords?: ECGRecord[];
  echoStudies?: EchoStudy[];
  imagingStudies?: ImagingStudy[];

  // Specialty data
  ccuData: CCUCardiology;
  icuVentilator: VentilatorSettings;
  ventilationRecords?: VentilatorRecord[];
  icuScores: ICUScores;

  // Therapies & Interventions
  medications: Medication[];
  infusions: Infusion[];
  procedures: Procedure[];

  // Documentation
  progressNotes: ProgressNote[];
  dailyNotes?: ProgressNote[];
  clinicalEvents?: ClinicalEvent[];
  consultations?: string;
  imagingSummary?: string;

  // Disposition
  dischargeTransferPlan?: string;
  dischargeDetails?: DischargeDetails;
  dischargePlan?: DischargePlan;

  // Metadata
  lastUpdated?: string;
  lastSyncedAt?: string;
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
  autoLockMinutes: number;
  biometricEnabled: boolean;
  lastUnlockedTimestamp: number;
}
