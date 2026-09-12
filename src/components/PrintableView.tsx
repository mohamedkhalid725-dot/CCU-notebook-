import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { Printer, X, Download, Share2, Loader2, Check, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

interface PrintableViewProps { patients: PatientRecord[]; activePatient?: PatientRecord | null; onClose: () => void; }
const safe = (value: unknown, fallback = '—') => value === undefined || value === null || value === '' ? fallback : String(value);

export const PrintableView: React.FC<PrintableViewProps> = ({ patients, activePatient, onClose }) => {
  const recordsToPrint = activePatient ? [activePatient] : patients;
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generatePdfBlob = async (): Promise<{ pdf: jsPDF; blob: Blob; fileName: string }> => {
    const element = document.getElementById('printable-report');
    if (!element) throw new Error('Report element not found');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, onclone: (clonedDoc) => { const report = clonedDoc.getElementById('printable-report'); if (report) { report.style.width = '800px'; report.style.maxWidth = '800px'; report.style.margin = '0 auto'; report.style.boxShadow = 'none'; } } });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight); heightLeft -= pageHeight; }
    const fileName = activePatient ? `CardioVault_${activePatient.name.replace(/[^a-z0-9_-]/gi, '_')}_Report.pdf` : 'CardioVault_Census_Report.pdf';
    return { pdf, blob: pdf.output('blob'), fileName };
  };

  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => { const result = String(reader.result || ''); const commaIndex = result.indexOf(','); resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result); }; reader.onerror = reject; reader.readAsDataURL(blob); });

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true); setErrorMessage(null);
    try { const { pdf, blob, fileName } = await generatePdfBlob(); if (Capacitor.isNativePlatform()) { const base64Data = await blobToBase64(blob); await Filesystem.writeFile({ path: `CardioVault/${fileName}`, data: base64Data, directory: Directory.Documents, recursive: true }); alert(`PDF saved successfully in Documents/CardioVault/\n${fileName}`); } else { pdf.save(fileName); } }
    catch (error) { console.error('PDF export failed:', error); setErrorMessage('Direct PDF export encountered an issue. Launching print dialog...'); setTimeout(() => window.print(), 300); }
    finally { setIsGenerating(false); }
  };

  const handleSharePdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true); setErrorMessage(null);
    try { const { pdf, blob, fileName } = await generatePdfBlob(); const file = new File([blob], fileName, { type: 'application/pdf' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: fileName, text: `CardioVault clinical file: ${activePatient ? activePatient.name : 'Census'}` }); setShareSuccess(true); setTimeout(() => setShareSuccess(false), 3000); } else { pdf.save(fileName); } }
    catch (err: any) { if (err?.name !== 'AbortError') { setErrorMessage('Unable to share PDF via system sheet. Downloading file instead...'); try { const { pdf, fileName } = await generatePdfBlob(); pdf.save(fileName); } catch { /* ignore */ } } }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="sticky top-0 z-10 print:hidden flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm">
        <div className="flex items-center gap-2 min-w-0"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Printer className="w-4 h-4" /></div><span className="font-bold text-xs sm:text-sm truncate">{activePatient ? `CardioVault Clinical File: ${activePatient.name}` : `Census Handover (${recordsToPrint.length} Patients)`}</span></div>
        <div className="flex items-center gap-2"><button onClick={handleSharePdf} disabled={isGenerating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs disabled:opacity-60">{shareSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}<span className="hidden sm:inline">Share</span></button><button onClick={handleDownloadPdf} disabled={isGenerating} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs disabled:opacity-60">{isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating PDF...</span></> : <><Download className="w-4 h-4" /><span>Export PDF</span></>}</button><button onClick={() => window.print()} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"><Printer className="w-4 h-4" />Print</button><button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button></div>
      </div>
      {errorMessage && <div className="print:hidden mx-auto max-w-4xl w-full px-4 pt-3"><div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMessage}</div></div>}

      <div id="printable-report" className="max-w-4xl mx-auto w-full my-6 p-8 bg-white text-slate-900 rounded-xl shadow-2xl print:m-0 print:p-4 print:shadow-none print:w-full print:max-w-none text-xs leading-normal">
        <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between"><div><h1 className="text-xl font-bold uppercase tracking-tight">CardioVault</h1><p className="text-sm font-semibold text-slate-600">ICU / CCU Clinical Patient Report</p><p className="text-[10px] text-slate-500">Confidential Medical Document • Generated: {new Date().toLocaleString()}</p></div><span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-xs">CONFIDENTIAL</span></div>
        {recordsToPrint.map((patient, index) => {
          const latestVital = patient.vitals?.[patient.vitals.length - 1];
          const latestAbg = patient.abgRecords?.[patient.abgRecords.length - 1];
          const latestLab = patient.labs?.[patient.labs.length - 1];
          const procedures = patient.procedures || [];
          const calculations = patient.clinicalCalculations || [];
          const latestVent = patient.ventilationRecords?.[patient.ventilationRecords.length - 1];
          return (
            <div key={patient.id} className={`space-y-4 ${index > 0 ? 'mt-8 pt-8 border-t-2 border-slate-300 print:break-before-page' : ''}`}>
              <section className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between"><div><div className="text-lg font-black">{patient.isDischarged ? `Ex-Bed ${patient.previousBedNumber || patient.bedNumber}` : `Bed ${patient.bedNumber}`} — {patient.name}</div><div className="text-slate-600">{patient.age}yo {patient.gender} • MRN: {patient.mrn}</div></div><div className="text-right"><div className="font-bold uppercase text-[11px] px-2 py-0.5 rounded bg-slate-200 border border-slate-400">{patient.isDischarged ? (patient.dischargeDetails?.disposition || 'Discharged') : patient.status}</div><div className="font-bold text-[10px] mt-1">{safe(patient.codeStatus)}</div></div></section>

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Brief Clinical History</h2><div className="grid grid-cols-2 gap-3"><div><b>Chief complaint / presenting symptoms:</b><p>{safe(patient.chiefComplaint)}</p></div><div><b>Admission:</b><p>{safe(patient.admissionDate)}</p></div><div><b>Relevant medical history:</b><p>{safe(patient.pastMedicalHistory)}</p></div><div><b>Cardiac history:</b><p>{safe(patient.ccuData?.echoFindings || patient.ccuData?.ecgSummary)}</p></div><div><b>Relevant medications:</b><p>{patient.medications?.length ? patient.medications.map(m => `${m.name} ${m.dose} (${m.frequency})`).join('; ') : 'None documented'}</p></div><div><b>Important risk factors:</b><p>{safe(patient.socialHistory || patient.secondaryDiagnoses?.join(', '))}</p></div></div></section>

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Primary Diagnosis & Comorbidities</h2><p className="text-sm font-bold">{safe(patient.primaryDiagnosis)}</p><p>{patient.secondaryDiagnoses?.length ? patient.secondaryDiagnoses.join(', ') : 'None documented'}</p></section>

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Clinical Snapshot</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono"><div className="p-2 rounded bg-slate-100 border"><span className="text-[9px] block">BP / HR</span><b>{latestVital ? `${latestVital.bpSystolic}/${latestVital.bpDiastolic} / ${latestVital.hr}` : '—'}</b></div><div className="p-2 rounded bg-slate-100 border"><span className="text-[9px] block">SpO₂ / RR</span><b>{latestVital ? `${latestVital.spo2}% / ${latestVital.rr}` : '—'}</b></div><div className="p-2 rounded bg-slate-100 border"><span className="text-[9px] block">GCS / SOFA</span><b>{patient.icuScores?.gcsTotal ?? '—'} / {patient.icuScores?.sofaScore ?? '—'}</b></div><div className="p-2 rounded bg-slate-100 border"><span className="text-[9px] block">EF / RASS</span><b>{safe(patient.ccuData?.echoEF)} / {patient.icuScores?.rass ?? '—'}</b></div></div></section>

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Respiratory / Ventilator Status</h2>{latestVent ? <p><b>Mode:</b> {latestVent.mode} • <b>FiO₂:</b> {latestVent.fio2}% • <b>PEEP:</b> {latestVent.peep} • <b>Rate:</b> {safe(latestVent.actualRate || latestVent.setRate)} • <b>Airway:</b> {safe(latestVent.airwayType)}</p> : <p><b>Mode:</b> {safe(patient.icuVentilator?.mode)} • <b>FiO₂:</b> {safe(patient.icuVentilator?.fio2)} • <b>PEEP:</b> {safe(patient.icuVentilator?.peep)}</p>}{latestAbg && <p className="mt-1 font-mono"><b>Latest ABG:</b> pH {latestAbg.ph} • PaCO₂ {latestAbg.pco2} • HCO₃ {latestAbg.hco3} • Lactate {latestAbg.lactate} • FiO₂ {latestAbg.fio2}</p>}</section>

              {procedures.length > 0 && <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Procedures & Interventions</h2><div className="space-y-2">{[...procedures].sort((a,b) => String(b.timestamp || b.date || '').localeCompare(String(a.timestamp || a.date || ''))).map(proc => <div key={proc.id} className="p-2 rounded bg-slate-50 border border-slate-200"><div className="font-bold">{safe(proc.timestamp || proc.date)} — {safe(proc.procedureName || proc.name)}</div><div><b>Indication:</b> {safe(proc.indication)} • <b>Performed by:</b> {safe(proc.operator || proc.performer)}</div>{proc.details && <div><b>Outcome / Notes:</b> {proc.details}</div>}{proc.complications && <div><b>Complications:</b> {proc.complications}</div>}{proc.postProcedurePlan && <div><b>Post-procedure plan:</b> {proc.postProcedurePlan}</div>}</div>)}</div></section>}

              {patient.progressNotes?.length > 0 && <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Progress Notes / Clinical Course</h2><div className="space-y-2">{patient.progressNotes.slice(-5).reverse().map(note => <div key={note.id} className="p-2 rounded bg-slate-50 border"><div className="font-bold font-mono">{note.timestamp} • {note.author}</div>{note.assessment && <p><b>Assessment:</b> {note.assessment}</p>}{note.plan && <p><b>Plan:</b> {note.plan}</p>}</div>)}</div></section>}

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Labs & Investigations</h2>{latestLab ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{Object.entries(latestLab).filter(([key]) => key !== 'timestamp').map(([key,value]) => value ? <div key={key} className="p-2 bg-slate-50 border rounded"><span className="text-[9px] uppercase block text-slate-500">{key}</span><b>{String(value)}</b></div> : null)}</div> : <p>No laboratory panel documented.</p>}{patient.ecgRecords?.length ? <p className="mt-2"><b>ECG:</b> {safe(patient.ecgRecords[patient.ecgRecords.length - 1].interpretation)}</p> : null}{patient.echoStudies?.length ? <p className="mt-1"><b>Echo:</b> EF {safe(patient.echoStudies[patient.echoStudies.length - 1].ef)} • {safe(patient.echoStudies[patient.echoStudies.length - 1].impression)}</p> : null}</section>

              {calculations.length > 0 && <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Clinical Calculators</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{calculations.map(calc => <div key={calc.id} className="p-2 rounded bg-slate-50 border"><div className="font-bold">{calc.calculator}: {calc.score}</div><div>{calc.interpretation}</div><div className="text-[9px] text-slate-500">Calculated: {new Date(calc.timestamp).toLocaleString()}</div></div>)}</div></section>}

              <section><h2 className="text-xs font-black uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">Current Plan / Disposition / Handover</h2><p><b>Attending:</b> {safe(patient.attendingPhysician)}</p><p><b>Current plan:</b> {safe(patient.dischargeTransferPlan || patient.dischargePlan?.hospitalCourse)}</p>{patient.dischargePlan && <p><b>Disposition:</b> {safe(patient.dischargePlan.destination || patient.dischargePlan.conditionAtDischarge)}</p>}{patient.dischargeDetails && <p><b>Discharge:</b> {safe(patient.dischargeDetails.disposition)} • {safe(patient.dischargeDetails.conditionAtDischarge)}</p>}</section>

              <div className="pt-3 border-t border-slate-300 flex justify-between text-[9px] text-slate-500"><span>CARDIOVAULT • Confidential Medical Document</span><span>Generated {new Date().toLocaleString()}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
