import React, { useState } from 'react';
import { 
  PatientRecord, 
  BedStatus, 
  SpecialtyMode,
  DischargeDisposition
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
  Printer
} from 'lucide-react';

interface CensusViewProps {
  patients: PatientRecord[];
  totalBeds: number;
  specialtyMode: SpecialtyMode;
  onSelectPatient: (patient: PatientRecord) => void;
  onAdmitToBed: (bedNum: number) => void;
  onDischargePatient: (patient: PatientRecord) => void;
  onReadmitPatient: (patient: PatientRecord) => void;
  onChangeTotalBeds: (newTotal: number) => void;
}

export const CensusView: React.FC<CensusViewProps> = ({
  patients,
  totalBeds,
  specialtyMode,
  onSelectPatient,
  onAdmitToBed,
  onDischargePatient,
  onReadmitPatient,
  onChangeTotalBeds
}) => {
  const [currentView, setCurrentView] = useState<'census' | 'archive'>('census');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [archiveFilter, setArchiveFilter] = useState<string>('all');

  const activePatients = patients.filter(p => !p.isDischarged);
  const dischargedPatients = patients.filter(p => p.isDischarged);

  // Build full bed array from 1 to totalBeds
  const bedList = Array.from({ length: totalBeds }, (_, i) => {
    const bedNum = i + 1;
    const patient = activePatients.find(p => Number(p.bedNumber) === bedNum);
    return {
      bedNumber: bedNum,
      patient: patient || null
    };
  });

  // Filter based on search & status for active beds
  const filteredBeds = bedList.filter(({ bedNumber, patient }) => {
    if (filterStatus === 'occupied' && !patient) return false;
    if (filterStatus === 'empty' && patient) return false;
    if (filterStatus === 'critical' && (!patient || (patient.status !== 'critical' && patient.status !== 'deteriorating'))) return false;
    if (filterStatus === 'stable' && (!patient || patient.status !== 'stable')) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (patient) {
      return (
        patient.name.toLowerCase().includes(q) ||
        patient.primaryDiagnosis.toLowerCase().includes(q) ||
        patient.mrn.toLowerCase().includes(q) ||
        bedNumber.toString().includes(q)
      );
    }
    return bedNumber.toString().includes(q) || 'empty'.includes(q);
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
      patient.primaryDiagnosis.toLowerCase().includes(q) ||
      patient.mrn.toLowerCase().includes(q) ||
      (patient.dischargeDetails?.disposition || '').toLowerCase().includes(q) ||
      (patient.dischargeDetails?.dischargeSummary || '').toLowerCase().includes(q) ||
      (patient.dischargeDetails?.dischargeDate || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: BedStatus) => {
    switch (status) {
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Stable
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-800/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Critical
          </span>
        );
      case 'deteriorating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Deteriorating
          </span>
        );
      case 'guarded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Guarded
          </span>
        );
      case 'post-op':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Post-Op
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
            Empty
          </span>
        );
    }
  };

  const getDispositionBadge = (disposition?: DischargeDisposition) => {
    switch (disposition) {
      case 'Transferred to Ward':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/90 text-blue-300 border border-blue-800/70">
            🏥 Transferred to Ward
          </span>
        );
      case 'Discharged Home':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800/70">
            🏠 Discharged Home
          </span>
        );
      case 'Transferred to Step-Down Unit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-800/70">
            🛏️ Step-Down Unit
          </span>
        );
      case 'Deceased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            🕊️ Deceased
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
            📋 {disposition || 'Discharged'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5">
      {/* Primary Navigation Tabs: Bed Census vs Medical Records Archive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              {currentView === 'census' ? (
                <>
                  <Bed className="w-6 h-6 text-cyan-400" />
                  <span>ICU / CCU Census</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-6 h-6 text-amber-400" />
                  <span>Medical Records Archive (السجل الطبي)</span>
                </>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {currentView === 'census'
              ? 'Real-time bed occupancy, hemodynamics, and patient clinical charts'
              : 'Permanent archive of discharged & transferred patients with complete clinical history'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setCurrentView('census')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              currentView === 'census'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Active Beds Census</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              currentView === 'census' ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-300'
            }`}>
              {activePatients.length}/{totalBeds}
            </span>
          </button>

          <button
            onClick={() => setCurrentView('archive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              currentView === 'archive'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Medical Records (السجل الطبي)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              currentView === 'archive' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-300'
            }`}>
              {dischargedPatients.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE BEDS CENSUS */}
      {currentView === 'census' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, diagnosis, bed..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'all' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Beds
              </button>
              <button
                onClick={() => setFilterStatus('occupied')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'occupied' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Occupied ({activePatients.length})
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'critical' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterStatus('empty')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'empty' ? 'bg-slate-800 text-slate-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Empty ({totalBeds - activePatients.length})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-2 sm:col-span-1">Bed</div>
              <div className="col-span-4 sm:col-span-3">Patient</div>
              <div className="col-span-4 sm:col-span-5">Diagnosis & Clinical Focus</div>
              <div className="col-span-2 sm:col-span-3 text-right sm:text-left">Status & Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800/70">
              {filteredBeds.map(({ bedNumber, patient }) => {
                if (!patient) {
                  // Empty Bed Row
                  return (
                    <div
                      key={`bed-${bedNumber}`}
                      onClick={() => onAdmitToBed(bedNumber)}
                      className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-slate-800/40 cursor-pointer transition group"
                    >
                      {/* Bed Number */}
                      <div className="col-span-2 sm:col-span-1 font-mono font-bold text-slate-500 group-hover:text-cyan-400 flex items-center gap-1.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-400">
                          {bedNumber}
                        </span>
                      </div>

                      {/* Patient Name Placeholder */}
                      <div className="col-span-4 sm:col-span-3 text-slate-500 italic flex items-center gap-2 text-xs sm:text-sm">
                        <span>—</span>
                        <span className="text-slate-600">(Available Bed)</span>
                      </div>

                      {/* Diagnosis Placeholder */}
                      <div className="col-span-4 sm:col-span-5 text-slate-500 text-xs">
                        Empty Bed — Ready for admission
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end sm:justify-between">
                        <span className="hidden sm:inline text-xs text-slate-500">—</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAdmitToBed(bedNumber);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 font-medium px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 group-hover:bg-cyan-600 group-hover:text-white transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Admit</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Occupied Bed Row
                const latestVital = patient.vitals[patient.vitals.length - 1];
                const latestNote = patient.progressNotes[patient.progressNotes.length - 1];

                return (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-slate-800/60 cursor-pointer transition group ${
                      patient.status === 'critical' ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Bed # */}
                    <div className="col-span-2 sm:col-span-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs transition ${
                        patient.status === 'critical'
                          ? 'bg-rose-900/60 border border-rose-700/80 text-rose-200'
                          : 'bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 group-hover:bg-cyan-600 group-hover:text-white'
                      }`}>
                        {bedNumber}
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="col-span-4 sm:col-span-3 pr-2">
                      <div className="font-semibold text-white text-sm sm:text-base flex items-center gap-1.5 group-hover:text-cyan-300 transition">
                        <span>{patient.name}</span>
                        <span className="text-xs font-normal text-slate-400">
                          ({patient.age}{patient.gender === 'Male' ? 'M' : 'F'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{patient.mrn}</span>
                        <span className="text-slate-600">•</span>
                        <span className="truncate">{patient.codeStatus}</span>
                      </div>
                    </div>

                    {/* Diagnosis & Key Clinical Tags */}
                    <div className="col-span-4 sm:col-span-5 pr-2">
                      <div className="text-xs sm:text-sm font-medium text-slate-100 flex items-center gap-1.5 flex-wrap">
                        <span>{patient.primaryDiagnosis}</span>
                        {patient.ccuData?.echoEF && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                            EF {patient.ccuData.echoEF}
                          </span>
                        )}
                        {patient.icuScores?.sofaScore > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                            SOFA {patient.icuScores.sofaScore}
                          </span>
                        )}
                      </div>

                      {/* Secondary info or latest note snippet */}
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        {latestVital && (
                          <span className="font-mono text-slate-300 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/60">
                            BP {latestVital.bpSystolic}/{latestVital.bpDiastolic} • HR {latestVital.hr} • SpO2 {latestVital.spo2}%
                          </span>
                        )}
                        {latestNote && (
                          <span className="hidden md:inline-flex items-center gap-1 text-slate-400 truncate max-w-xs">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{latestNote.timestamp}: {latestNote.assessment || latestNote.plan}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status, Discharge & Open */}
                    <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                      <div>{getStatusBadge(patient.status)}</div>

                      {/* Quick Discharge Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDischargePatient(patient);
                        }}
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-amber-950 hover:text-amber-300 text-slate-300 border border-slate-700/80 transition"
                        title="Discharge / Free Bed"
                      >
                        <LogOut className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden xl:inline">Discharge</span>
                      </button>

                      <div className="hidden sm:flex items-center text-xs text-slate-400 group-hover:text-cyan-300 transition ml-1">
                        <span>File</span>
                        <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer / Bed Capacity settings */}
            <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span>Total Bed Capacity: <strong className="text-white">{totalBeds} Beds</strong></span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => onChangeTotalBeds(Math.max(4, totalBeds - 2))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                    title="Decrease bed count"
                  >
                    -2
                  </button>
                  <button
                    onClick={() => onChangeTotalBeds(totalBeds + 2)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                    title="Add 2 beds"
                  >
                    +2
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-400">● Stable</span>
                <span className="text-rose-400">● Critical</span>
                <span className="text-amber-400">● Deteriorating</span>
                <span className="text-slate-500">○ Empty</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MEDICAL RECORDS ARCHIVE (السجل الطبي وأرشيف الخروج) */}
      {currentView === 'archive' && (
        <div className="space-y-4">
          {/* Header & Reassurance card */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>الأرشيف الطبي والسجل التاريخي للحالات</span>
                  <span className="text-xs px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700/60 font-normal">
                    {dischargedPatients.length} حالات مسجلة
                  </span>
                </h3>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  الحالات التي تم إخلاء أسرتها تظل محفوظة بالكامل في هذا السجل الطبي مع إمكانية فتح الملف وطباعته أو إعادة التسكين في سرير شاغر.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">الأسرة الشاغرة حالياً:</span>
              <span className="font-bold text-cyan-300 text-sm font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                {totalBeds - activePatients.length} أسرة
              </span>
            </div>
          </div>

          {/* Search & Filter bar for archive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search discharged patient, MRN, diagnosis, date..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
              <button
                onClick={() => setArchiveFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  archiveFilter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Archive ({dischargedPatients.length})
              </button>
              <button
                onClick={() => setArchiveFilter('ward')}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  archiveFilter === 'ward' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                To Ward
              </button>
              <button
                onClick={() => setArchiveFilter('home')}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  archiveFilter === 'home' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setArchiveFilter('stepdown')}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  archiveFilter === 'stepdown' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Step-Down
              </button>
            </div>
          </div>

          {/* Discharged Patients List */}
          {filteredArchive.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
              <FolderArchive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">No Discharged Records Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery
                  ? 'No records match your search criteria. Try a different query.'
                  : 'When active patients in bed are discharged, their beds become available while their full clinical record will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArchive.map(patient => (
                <div
                  key={patient.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-700/60 transition shadow-lg space-y-3.5 flex flex-col justify-between"
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white hover:text-amber-300 transition cursor-pointer" onClick={() => onSelectPatient(patient)}>
                            {patient.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            ({patient.age}{patient.gender === 'Male' ? 'M' : 'F'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {patient.mrn} • Ex-Bed {patient.previousBedNumber || patient.bedNumber}
                        </p>
                      </div>

                      {/* Disposition badge */}
                      <div>
                        {getDispositionBadge(patient.dischargeDetails?.disposition)}
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mt-2.5">
                      <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {patient.primaryDiagnosis}
                      </span>
                    </div>

                    {/* Admission & Discharge Timestamps */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Admitted:</span>
                        <span className="text-slate-300 font-mono">{patient.admissionDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Discharged:</span>
                        <span className="text-amber-300 font-mono">
                          {patient.dischargeDetails?.dischargeDate || 'Recorded'}
                        </span>
                      </div>
                    </div>

                    {/* Summary Excerpt */}
                    {patient.dischargeDetails?.dischargeSummary && (
                      <div className="mt-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                        <span className="text-slate-500 font-semibold">Summary: </span>
                        {patient.dischargeDetails.dischargeSummary}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>فتح السجل الطبي</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReadmitPatient(patient)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                        title="Re-admit this patient to an available bed"
                      >
                        <Bed className="w-3.5 h-3.5" />
                        <span>إعادة تسكين</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
