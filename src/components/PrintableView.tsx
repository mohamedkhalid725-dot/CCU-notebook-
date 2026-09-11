import React from 'react';
import { PatientRecord } from '../types';
import { Printer, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintableViewProps {
  patients: PatientRecord[];
  activePatient?: PatientRecord | null;
  onClose: () => void;
}

export const PrintableView: React.FC<PrintableViewProps> = ({
  patients,
  activePatient,
  onClose
}) => {
  const recordsToPrint = activePatient ? [activePatient] : patients;

  const handlePrint = async () => {
    const element = document.getElementById('printable-report');
    if (!element) {
      window.print();
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      const fileName = activePatient
        ? `CardioVault_${activePatient.name.replace(/[^a-z0-9_-]/gi, '_')}_Report.pdf`
        : `CardioVault_Census_Report.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Top action bar (hidden during print) */}
      <div className="sticky top-0 z-10 print:hidden flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 text-white">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm">
            {activePatient ? `Print Handover: ${activePatient.name} (Bed ${activePatient.bedNumber})` : `Print Census Handover (${recordsToPrint.length} Patients)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (Styling optimized for paper and PDF export) */}
      <div id="printable-report" className="max-w-4xl mx-auto w-full my-6 p-8 bg-white text-slate-900 rounded-xl shadow-2xl print:m-0 print:p-4 print:shadow-none print:w-full print:max-w-none text-xs leading-normal">
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              ICU & CCU Clinical Handover Report
            </h1>
            <p className="text-slate-600 text-[11px]">
              Confidential Medical Document • Generated: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-xs">
              CONFIDENTIAL
            </span>
          </div>
        </div>

        {recordsToPrint.map((patient, index) => {
          const latestVital = patient.vitals[patient.vitals.length - 1];
          const latestLab = patient.labs[patient.labs.length - 1];
          const latestAbg = patient.abgRecords[patient.abgRecords.length - 1];

          return (
            <div
              key={patient.id}
              className={`space-y-4 ${index > 0 ? 'mt-8 pt-8 border-t-2 border-slate-300 print:break-before-page' : ''}`}
            >
              {/* Header Box */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900">
                    {patient.isDischarged 
                      ? `Ex-Bed ${patient.previousBedNumber || patient.bedNumber} — ${patient.name}`
                      : `Bed ${patient.bedNumber} — ${patient.name}`}
                  </span>
                  <span className="text-slate-600 ml-2 font-medium">
                    ({patient.age}yo {patient.gender}, MRN: {patient.mrn})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded border ${
                    patient.isDischarged ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-200 border-slate-400'
                  }`}>
                    {patient.isDischarged ? (patient.dischargeDetails?.disposition || 'Discharged') : patient.status}
                  </span>
                  <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-slate-200 border border-slate-400">
                    {patient.codeStatus}
                  </span>
                </div>
              </div>

              {/* Discharge / Transfer Summary */}
              {patient.isDischarged && patient.dischargeDetails && (
                <div className="border border-amber-300 rounded p-2.5 bg-amber-50">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-amber-900 font-bold uppercase text-[10px]">
                      Discharge & Handover Summary ({patient.dischargeDetails.disposition}):
                    </strong>
                    <span className="font-mono text-slate-700 text-[10px]">
                      {patient.dischargeDetails.dischargeDate} • {patient.dischargeDetails.conditionAtDischarge}
                    </span>
                  </div>
                  <p className="text-slate-800">{patient.dischargeDetails.dischargeSummary}</p>
                  {patient.dischargeDetails.dischargeMedications && (
                    <p className="text-slate-700 mt-1 font-mono text-[10px]">
                      <strong>Floor Meds: </strong>{patient.dischargeDetails.dischargeMedications}
                    </p>
                  )}
                  {patient.dischargeDetails.followUpInstructions && (
                    <p className="text-slate-700 mt-0.5 text-[10px]">
                      <strong>Follow-up: </strong>{patient.dischargeDetails.followUpInstructions}
                    </p>
                  )}
                </div>
              )}

              {/* Diagnosis & HPI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="block text-slate-700 font-bold uppercase text-[10px]">Primary Diagnosis:</strong>
                  <p className="font-bold text-slate-900 text-sm">{patient.primaryDiagnosis}</p>
                  {patient.secondaryDiagnoses.length > 0 && (
                    <p className="text-slate-600 text-[11px]">
                      Comorbidities: {patient.secondaryDiagnoses.join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <strong className="block text-slate-700 font-bold uppercase text-[10px]">Admission Info:</strong>
                  <p className="text-slate-800">Admit: {patient.admissionDate}</p>
                  <p className="text-slate-800">Attending: {patient.attendingPhysician}</p>
                </div>
              </div>

              {/* Chief Complaint & HPI */}
              <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
                <strong className="block text-slate-800 font-semibold mb-0.5">Clinical Presentation:</strong>
                <p className="text-slate-700">{patient.chiefComplaint}</p>
                <p className="text-slate-600 mt-1">{patient.historyOfPresentIllness}</p>
              </div>

              {/* Latest Vitals & Labs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">BP & HR</span>
                  <span className="font-bold text-slate-900">
                    {latestVital ? `${latestVital.bpSystolic}/${latestVital.bpDiastolic} (${latestVital.hr})` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">SpO2 / RR</span>
                  <span className="font-bold text-slate-900">
                    {latestVital ? `${latestVital.spo2}% / ${latestVital.rr}m` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Echo EF% / SOFA</span>
                  <span className="font-bold text-slate-900">
                    {patient.ccuData?.echoEF || '—'} / SOFA {patient.icuScores?.sofaScore ?? '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">GCS / RASS</span>
                  <span className="font-bold text-slate-900">
                    GCS {patient.icuScores?.gcsTotal || 15} / RASS {patient.icuScores?.rass || 0}
                  </span>
                </div>
              </div>

              {/* CCU / ICU Specialty Data */}
              {(patient.ccuData?.cathFindings || patient.ccuData?.antiplatelets || patient.icuVentilator?.mode) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 p-2.5 rounded">
                  {patient.ccuData?.cathFindings && (
                    <div>
                      <strong className="block text-slate-800 text-[10px] uppercase">Cardiology & Cath:</strong>
                      <p className="text-slate-700">Culprit: {patient.ccuData.culpritLesion || '—'} | Stent: {patient.ccuData.stentType || '—'} ({patient.ccuData.stentDetails || ''})</p>
                      <p className="text-slate-700">DAPT: {patient.ccuData.antiplatelets}</p>
                    </div>
                  )}
                  {patient.icuVentilator?.mode && (
                    <div>
                      <strong className="block text-slate-800 text-[10px] uppercase">Respiratory & Vent:</strong>
                      <p className="text-slate-700">Mode: {patient.icuVentilator.mode} (FiO2 {patient.icuVentilator.fio2}, PEEP {patient.icuVentilator.peep})</p>
                      {latestAbg && (
                        <p className="text-slate-700 font-mono text-[11px]">
                          ABG: pH {latestAbg.ph} / pCO2 {latestAbg.pco2} / HCO3 {latestAbg.hco3} / Lac {latestAbg.lactate}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Active Infusions & Medications */}
              {(patient.medications.length > 0 || patient.infusions.length > 0) && (
                <div>
                  <strong className="block text-slate-800 font-semibold mb-1">Medications & Infusions:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.infusions.map(inf => (
                      <span key={inf.id} className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-900 font-medium">
                        💧 {inf.drug}: {inf.doseRate}
                      </span>
                    ))}
                    {patient.medications.map(med => (
                      <span key={med.id} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                        {med.name} {med.dose} ({med.frequency})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Progress Notes */}
              {patient.progressNotes.length > 0 && (
                <div className="border-t border-slate-200 pt-2">
                  <strong className="block text-slate-800 font-semibold mb-1">Latest Progress Notes:</strong>
                  <div className="space-y-2">
                    {patient.progressNotes.slice(-2).map(n => (
                      <div key={n.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-800 font-mono">{n.timestamp}</span> - <span className="text-slate-600">{n.author}</span>
                        {n.assessment && <p className="text-slate-800 font-medium mt-0.5"><strong>A:</strong> {n.assessment}</p>}
                        {n.plan && <p className="text-slate-700 whitespace-pre-line"><strong>P:</strong> {n.plan}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plan & Step-down */}
              {patient.dischargeTransferPlan && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  <strong>Transfer / Discharge Goal:</strong> {patient.dischargeTransferPlan}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
