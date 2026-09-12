import React, { useState, useEffect } from 'react';
import { 
  PatientRecord, 
  BedStatus, 
  SpecialtyMode,
  DischargeDisposition,
  BedDefinition
} from '../types';
import { 
  User, 
  Activity, 
  HeartPulse, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  Search, 
  Bed, 
  ArrowRight,
  Clock, 
  Stethoscope, 
  Wind, 
  LogOut, 
  FolderArchive, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Printer,
  Sliders,
  ArrowRightLeft,
  Filter,
  Layers,
  Settings,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { getBedsList, saveBedsList } from '../services/storage';
import { BedManagementModal } from './BedManagementModal';

interface CensusViewProps {
  patients: PatientRecord[];
  totalBeds: number;
  specialtyMode: SpecialtyMode;
  onSelectPatient: (patient: PatientRecord) => void;
  onAdmitToBed: (bedNum: number | string) => void;
  onDischargePatient: (patient: PatientRecord) => void;
  onReadmitPatient: (patient: PatientRecord) => void;
  onDeletePatient?: (patient: PatientRecord) => void;
  onChangeTotalBeds: (newTotal: number) => void;
  onUpdatePatientBed?: (patientId: string, newBedNumber: string | number) => void;
}

export const CensusView: React.FC<CensusViewProps> = ({
  patients,
  totalBeds,
  specialtyMode,
  onSelectPatient,
  onAdmitToBed,
  onDischargePatient,
  onReadmitPatient,
  onDeletePatient,
  onChangeTotalBeds,
  onUpdatePatientBed
}) => {
  const [currentView, setCurrentView] = useState<'census' | 'archive'>('census');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [archiveFilter, setArchiveFilter] = useState<string>('all');
  const [patientToDelete, setPatientToDelete] = useState<PatientRecord | null>(null);

  // Dynamic Bed definitions
  const [beds, setBeds] = useState<BedDefinition[]>(() => getBedsList(totalBeds));
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);

  // Sync beds if totalBeds changes or on mount
  useEffect(() => {
    const loaded = getBedsList(totalBeds);
    setBeds(loaded);
  }, [totalBeds]);

  const handleSaveBeds = (updatedBeds: BedDefinition[]) => {
    setBeds(updatedBeds);
    saveBedsList(updatedBeds);
    if (updatedBeds.length !== totalBeds) {
      onChangeTotalBeds(updatedBeds.length);
    }
  };

  const handleUpdatePatientBedInternal = (patientId: string, newBedNumber: string | number) => {
    if (onUpdatePatientBed) {
      onUpdatePatientBed(patientId, newBedNumber);
    } else {
      // Fallback: update in localStorage directly if handler not passed
      const currentPatient = patients.find(p => p.id === patientId);
      if (currentPatient) {
        currentPatient.bedNumber = String(newBedNumber);
      }
    }
  };

  const activePatients = patients.filter(p => !p.isDischarged);
  const dischargedPatients = patients.filter(p => p.isDischarged);

  // Calculate stats
  const occupiedCount = activePatients.length;
  const availableCount = Math.max(0, beds.length - occupiedCount);
  const criticalCount = activePatients.filter(p => p.status === 'critical' || p.status === 'deteriorating').length;
  const stableCount = activePatients.filter(p => p.status === 'stable').length;
  const occupancyRate = beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0;

  // Map beds to patients
  const bedItems = beds.map(b => {
    const patient = activePatients.find(
      p => String(p.bedNumber) === String(b.bedNumber) || (b.name && p.bedName === b.name)
    );
    return {
      definition: b,
      patient: patient || null
    };
  });

  // Filter based on search & status for active beds
  const filteredBeds = bedItems.filter(({ definition, patient }) => {
    if (filterStatus === 'occupied' && !patient) return false;
    if (filterStatus === 'empty' && patient) return false;
    if (filterStatus === 'critical' && (!patient || (patient.status !== 'critical' && patient.status !== 'deteriorating'))) return false;
    if (filterStatus === 'stable' && (!patient || patient.status !== 'stable')) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (patient) {
      return (
        patient.name.toLowerCase().includes(q) ||
        (patient.diagnosis || '').toLowerCase().includes(q) ||
        (patient.mrn || '').toLowerCase().includes(q) ||
        definition.name.toLowerCase().includes(q) ||
        String(definition.bedNumber).includes(q)
      );
    }
    return definition.name.toLowerCase().includes(q) || String(definition.bedNumber).includes(q) || 'empty'.includes(q);
  });

  // Filter for Medical Records / Discharged Archive
  const filteredArchive = dischargedPatients.filter(patient => {
    if (archiveFilter !== 'all') {
      if (archiveFilter === 'ward' && patient.dischargeDetails?.disposition !== 'Transferred to Ward') return false;
      if (archiveFilter === 'home' && patient.dischargeDetails?.disposition !== 'Discharged Home') return false;
      if (archiveFilter === 'stepdown' && patient.dischargeDetails?.disposition !== 'Transferred to Step-Down Unit') return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(q) ||
      (patient.diagnosis || '').toLowerCase().includes(q) ||
      (patient.mrn || '').toLowerCase().includes(q) ||
      (patient.dischargeDetails?.disposition || '').toLowerCase().includes(q) ||
      (patient.dischargePlan?.dischargeDiagnosis || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status?: BedStatus) => {
    switch (status) {
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Stable
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Critical
          </span>
        );
      case 'deteriorating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Deteriorating
          </span>
        );
      case 'guarded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Guarded
          </span>
        );
      case 'post-op':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Post-Op
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
            Available
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {currentView === 'census' ? (
              <>
                <Bed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>ICU / CCU Bed Census</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-6 h-6 text-amber-500" />
                <span>Medical Records Archive</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentView === 'census'
              ? 'Real-time bed occupancy, hemodynamics, patient acuity and bed allocation'
              : 'Permanent archive of discharged and transferred patient clinical files'}
          </p>
        </div>

        {/* View Switcher & Bed Management Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setCurrentView('census')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentView === 'census'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Active Beds</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                currentView === 'census' ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {occupiedCount}/{beds.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('archive')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentView === 'archive'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Discharged Archive</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                currentView === 'archive' ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {dischargedPatients.length}
              </span>
            </button>
          </div>

          {currentView === 'census' && (
            <button
              onClick={() => setIsBedModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 text-xs font-semibold shadow-sm transition"
              title="Add, rename or remove beds"
            >
              <Settings className="w-4 h-4 text-emerald-500" />
              <span>Manage Beds</span>
            </button>
          )}
        </div>
      </div>

      {/* CENSUS VIEW */}
      {currentView === 'census' && (
        <div className="space-y-4">
          {/* Occupancy Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Total Beds
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {beds.length}
                </span>
                <span className="text-[10px] text-slate-400">allocated</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
                Occupied Beds
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {occupiedCount}
                </span>
                <span className="text-[10px] text-slate-400">({occupancyRate}%)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 block">
                Available Beds
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {availableCount}
                </span>
                <span className="text-[10px] text-slate-400">ready</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block">
                Critical / Deteriorating
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {criticalCount}
                </span>
                <span className="text-[10px] text-slate-400">high alert</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Stable Cases
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {stableCount}
                </span>
                <span className="text-[10px] text-slate-400">ward candidates</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, diagnosis, bed..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto shadow-sm">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Beds ({beds.length})
              </button>
              <button
                onClick={() => setFilterStatus('occupied')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'occupied' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Occupied ({occupiedCount})
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setFilterStatus('empty')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'empty' ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Empty ({availableCount})
              </button>
            </div>
          </div>

          {/* Beds Grid / Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-3 sm:col-span-2">Bed & Unit</div>
              <div className="col-span-4 sm:col-span-3">Patient</div>
              <div className="col-span-3 sm:col-span-4">Diagnosis & Telemetry</div>
              <div className="col-span-2 sm:col-span-3 text-right">Status & Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredBeds.map(({ definition, patient }) => {
                if (!patient) {
                  // Empty Bed Row
                  return (
                    <div
                      key={`bed-${definition.id}`}
                      onClick={() => onAdmitToBed(definition.bedNumber)}
                      className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition group"
                    >
                      <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {definition.bedNumber}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            {definition.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {definition.department || 'CCU'}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-3 text-slate-400 text-xs italic flex items-center gap-2">
                        <span>—</span>
                        <span className="text-slate-400 dark:text-slate-500">(Available Bed)</span>
                      </div>

                      <div className="col-span-3 sm:col-span-4 text-slate-400 text-xs">
                        Ready for admission
                      </div>

                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAdmitToBed(definition.bedNumber);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-600 hover:text-white transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Admit</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Occupied Bed Row
                const latestVital = patient.vitals && patient.vitals[0];

                return (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition group ${
                      patient.status === 'critical' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition ${
                        patient.status === 'critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}>
                        {definition.bedNumber}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {definition.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {definition.department || 'CCU'}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-4 sm:col-span-3 pr-2">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        <span>{patient.name}</span>
                        <span className="text-xs font-normal text-slate-400">
                          ({patient.age || '—'}{patient.gender === 'Male' ? 'M' : 'F'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {patient.mrn && <span className="font-mono">MRN: {patient.mrn}</span>}
                        {patient.codeStatus && (
                          <span className="text-slate-500 dark:text-slate-400 truncate">
                            • {patient.codeStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 sm:col-span-4 pr-2">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate max-w-[200px]">{patient.diagnosis || 'Cardiology Admission'}</span>
                        {patient.echoStudies && patient.echoStudies.length > 0 && patient.echoStudies[0].ejectionFraction && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                            EF {patient.echoStudies[0].ejectionFraction}%
                          </span>
                        )}
                      </div>

                      {latestVital && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                            BP {latestVital.bpSystolic}/{latestVital.bpDiastolic || '—'} • HR {latestVital.hr || '—'} • SpO2 {latestVital.spo2 ? `${latestVital.spo2}%` : '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                      <div>{getStatusBadge(patient.status)}</div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDischargePatient(patient);
                        }}
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-950 dark:hover:text-amber-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                        title="Discharge Patient"
                      >
                        <LogOut className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden xl:inline">Discharge</span>
                      </button>

                      <div className="hidden sm:flex items-center text-xs text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL RECORDS ARCHIVE */}
      {currentView === 'archive' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search discharged patient, MRN, diagnosis..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition shadow-sm"
              />
            </div>
          </div>

          {filteredArchive.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredArchive.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {patient.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        ({patient.gender}, {patient.age || '—'}y)
                      </span>
                      {patient.mrn && (
                        <span className="text-xs font-mono text-slate-400">MRN: {patient.mrn}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {patient.dischargePlan?.dischargeDiagnosis || patient.diagnosis || 'Cardiology Admission'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onReadmitPatient(patient);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition"
                    >
                      Readmit
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setPatientToDelete(patient);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold transition flex items-center gap-1"
                      title="Permanently Delete Patient Record"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No archived patients match the search criteria.
            </div>
          )}
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Permanently Delete Patient?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Delete <strong>{patientToDelete.name}</strong> permanently? This action cannot be undone and will remove all clinical history from this device and cloud storage.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeletePatient) {
                    onDeletePatient(patientToDelete);
                  }
                  setPatientToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition"
              >
                Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bed Management Modal */}
      <BedManagementModal
        isOpen={isBedModalOpen}
        onClose={() => setIsBedModalOpen(false)}
        beds={beds}
        patients={patients}
        onSaveBeds={handleSaveBeds}
        onUpdatePatientBed={handleUpdatePatientBedInternal}
        onSelectPatient={onSelectPatient}
        onAdmitToBed={onAdmitToBed}
      />
    </div>
  );
};
