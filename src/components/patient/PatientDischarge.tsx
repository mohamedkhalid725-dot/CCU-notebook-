import React, { useState } from 'react';
import { PatientRecord, DischargePlan } from '../../types';
import {
  LogOut,
  Printer,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  Heart,
  FileText,
  Check,
  X
} from 'lucide-react';

interface PatientDischargeProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientDischarge: React.FC<PatientDischargeProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const plan = patient.dischargePlan || {};

  const [formState, setFormState] = useState<DischargePlan>({
    dischargeDate: plan.dischargeDate || new Date().toISOString().slice(0, 10),
    dischargeDiagnosis: plan.dischargeDiagnosis || patient.diagnosis || '',
    hospitalCourse: plan.hospitalCourse || '',
    conditionAtDischarge: plan.conditionAtDischarge || 'Improved',
    destination: plan.destination || 'Cardiac Step-Down Ward',
    dischargeMedications: plan.dischargeMedications || patient.medications?.map(m => `${m.name} ${m.dose} ${m.frequency}`).join('\n') || '',
    followUpInstructions: plan.followUpInstructions || 'Follow-up Cardiology OPD in 2 weeks. Repeat Echocardiogram in 6 weeks.',
    warningSigns: plan.warningSigns || 'Seek emergency medical attention if severe chest pain, shortness of breath, syncope, or palpitations recur.',
    attendingPhysician: plan.attendingPhysician || '',
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientRecord = {
      ...patient,
      dischargePlan: formState,
      lastUpdated: new Date().toISOString(),
    };
    onUpdatePatient(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LogOut className="text-emerald-500" size={18} />
            <span>Discharge & Step-Down Transfer Summary</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Discharge diagnoses, CCU course summary, post-discharge medication regimen and warning signs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Printer size={14} />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSavePlan} className="space-y-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Discharge / Transfer Date
              </label>
              <input
                type="date"
                value={formState.dischargeDate}
                onChange={(e) => setFormState({ ...formState, dischargeDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Condition at Discharge
              </label>
              <select
                value={formState.conditionAtDischarge}
                onChange={(e) => setFormState({ ...formState, conditionAtDischarge: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Improved">Improved (Stable)</option>
                <option value="Stable">Stable</option>
                <option value="Transferred">Transferred to other unit</option>
                <option value="Against Medical Advice">Against Medical Advice (AMA)</option>
                <option value="Deceased">Deceased (Expired)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Discharge Destination
              </label>
              <select
                value={formState.destination}
                onChange={(e) => setFormState({ ...formState, destination: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="Home">Home</option>
                <option value="Cardiac Step-Down Ward">Cardiac Step-Down Ward</option>
                <option value="General Medical Ward">General Medical Ward</option>
                <option value="Other Hospital / Facility">Other Hospital / Facility</option>
                <option value="Mortuary">Mortuary</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Primary Discharge Diagnosis & Comorbidities *
              </label>
              <input
                type="text"
                value={formState.dischargeDiagnosis}
                onChange={(e) => setFormState({ ...formState, dischargeDiagnosis: e.target.value })}
                placeholder="e.g. Acute Anterior STEMI post primary PCI with DES to LAD, T2DM, HTN"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Hospital Course & In-Unit Management Summary
              </label>
              <textarea
                rows={4}
                value={formState.hospitalCourse}
                onChange={(e) => setFormState({ ...formState, hospitalCourse: e.target.value })}
                placeholder="Brief summary of presenting complaints, catheterization results, ICU stay, weaning from inotropes/oxygen, and current clinical resolution..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Discharge Medications List (One per line)
              </label>
              <textarea
                rows={4}
                value={formState.dischargeMedications}
                onChange={(e) => setFormState({ ...formState, dischargeMedications: e.target.value })}
                placeholder="1. Aspirin 100mg PO once daily
2. Ticagrelor 90mg PO twice daily
3. Atorvastatin 80mg PO once daily at bedtime
4. Bisoprolol 2.5mg PO once daily
5. Ramipril 2.5mg PO once daily"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Follow-up Appointments & Outpatient Instructions
              </label>
              <textarea
                rows={2}
                value={formState.followUpInstructions}
                onChange={(e) => setFormState({ ...formState, followUpInstructions: e.target.value })}
                placeholder="Cardiology clinic appointment in 2 weeks with repeat ECG and renal panel..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Emergency Warning Signs & Return Precautions
              </label>
              <input
                type="text"
                value={formState.warningSigns}
                onChange={(e) => setFormState({ ...formState, warningSigns: e.target.value })}
                placeholder="Return immediately if recurrent chest pain, syncope, severe shortness of breath"
                className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Attending / Discharging Physician
              </label>
              <input
                type="text"
                value={formState.attendingPhysician}
                onChange={(e) => setFormState({ ...formState, attendingPhysician: e.target.value })}
                placeholder="Dr. Specialist / Consultant"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {isSavedNotice ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle size={14} />
                <span>Discharge summary saved!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Data persists in encrypted local notebook storage.
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
            >
              Save Discharge Plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
