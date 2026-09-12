import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { Printer, X, Download, Share2, Loader2, Check, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generatePdfBlob = async (): Promise<{ pdf: jsPDF; blob: Blob; fileName: string }> => {
    const element = document.getElementById('printable-report');
    if (!element) {
      throw new Error('Report element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const report = clonedDoc.getElementById('printable-report');
        if (report) {
          report.style.width = '800px';
          report.style.maxWidth = '800px';
          report.style.margin = '0 auto';
          report.style.boxShadow = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = activePatient
      ? `CardioVault_${activePatient.name.replace(/[^a-z0-9_-]/gi, '_')}_Report.pdf`
      : `CardioVault_Census_Report.pdf`;

    const blob = pdf.output('blob');
    return { pdf, blob, fileName };
  };

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const { pdf, fileName } = await generatePdfBlob();
      pdf.save(fileName);
    } catch (error: any) {
      console.error('PDF export failed:', error);
      setErrorMessage('Direct PDF export encountered an issue. Launching print dialog...');
      setTimeout(() => {
        window.print();
      }, 300);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const { blob, fileName } = await generatePdfBlob();
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: `CardioVault clinical file: ${activePatient ? activePatient.name : 'Census'}`
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback to direct download if sharing files is not supported
        const { pdf } = await generatePdfBlob();
        pdf.save(fileName);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share not completed or cancelled:', err);
        setErrorMessage('Unable to share PDF via system sheet. Downloading file instead...');
        try {
          const { pdf, fileName } = await generatePdfBlob();
          pdf.save(fileName);
        } catch {
          // ignore fallback error
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Top action bar (hidden during print) */}
      <div className="sticky top-0 z-10 print:hidden flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs sm:text-sm truncate">
            {activePatient ? `CardioVault Clinical File: ${activePatient.name}` : `Census Handover (${recordsToPrint.length} Patients)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Share Button (Android / Web Share API) */}
          <button
            onClick={handleSharePdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition disabled:opacity-60"
            title="Share PDF"
          >
            {shareSuccess ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition disabled:opacity-60"
            title="Download PDF"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="print:hidden mx-auto max-w-4xl w-full px-4 pt-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Printable Sheet (Styling optimized for paper and PDF export) */}
      <div id="printable-report" className="max-w-4xl mx-auto w-full my-6 p-8 bg-white text-slate-900 rounded-xl shadow-2xl print:m-0 print:p-4 print:shadow-none print:w-full print:max-w-none text-xs leading-normal">
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              CardioVault — Clinical Patient Summary & Handover
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
                  {(patient.ventilationRecords && patient.ventilationRecords.length > 0) ? (
                    <div>
                      <strong className="block text-slate-800 text-[10px] uppercase">Mechanical Ventilation:</strong>
                      <p className="text-slate-700 font-medium">
                        Mode: {patient.ventilationRecords[0].mode} | FiO2: {patient.ventilationRecords[0].fio2}% | PEEP: {patient.ventilationRecords[0].peep} cmH2O
                      </p>
                      <p className="text-slate-600 text-[10px] font-mono">
                        TV: {patient.ventilationRecords[0].tidalVolume || '—'} mL • Rate: {patient.ventilationRecords[0].setRate || '—'}/{patient.ventilationRecords[0].actualRate || '—'} • Ppeak/Pplat: {patient.ventilationRecords[0].peakPressure || '—'}/{patient.ventilationRecords[0].plateauPressure || '—'} cmH2O • Driving P: {patient.ventilationRecords[0].drivingPressure || '—'}
                      </p>
                      {latestAbg && (
                        <p className="text-slate-700 font-mono text-[10px] mt-0.5">
                          ABG: pH {latestAbg.ph} / pCO2 {latestAbg.pco2} / HCO3 {latestAbg.hco3} / Lac {latestAbg.lactate}
                        </p>
                      )}
                    </div>
                  ) : patient.icuVentilator?.mode ? (
                    <div>
                      <strong className="block text-slate-800 text-[10px] uppercase">Respiratory & Vent:</strong>
                      <p className="text-slate-700">Mode: {patient.icuVentilator.mode} (FiO2 {patient.icuVentilator.fio2}, PEEP {patient.icuVentilator.peep})</p>
                      {latestAbg && (
                        <p className="text-slate-700 font-mono text-[11px]">
                          ABG: pH {latestAbg.ph} / pCO2 {latestAbg.pco2} / HCO3 {latestAbg.hco3} / Lac {latestAbg.lactate}
                        </p>
                      )}
                    </div>
                  ) : null}
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
