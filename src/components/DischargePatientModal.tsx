import React, { useState } from 'react';
import { PatientRecord, DischargeDetails, DischargeDisposition } from '../types';
import { LogOut, X, Check, ArrowRight, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

interface DischargePatientModalProps {
  patient: PatientRecord;
  onConfirmDischarge: (patientId: string, details: DischargeDetails) => void;
  onClose: () => void;
}

export const DischargePatientModal: React.FC<DischargePatientModalProps> = ({
  patient,
  onConfirmDischarge,
  onClose
}) => {
  const now = new Date();
  const defaultDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const [dischargeDate, setDischargeDate] = useState(defaultDate);
  const [disposition, setDisposition] = useState<DischargeDisposition>('Transferred to Ward');
  const [conditionAtDischarge, setConditionAtDischarge] = useState('Stable & Improved');
  const [dischargeSummary, setDischargeSummary] = useState(
    patient.dischargeTransferPlan || 
    `Patient completed acute intensive care management for ${patient.primaryDiagnosis}. Hemodynamically stable, ready for step-down care.`
  );
  const [dischargeMedications, setDischargeMedications] = useState(
    patient.medications.length > 0 
      ? patient.medications.map(m => `${m.name} ${m.dose} (${m.route}) - ${m.frequency}`).join('\n')
      : ''
  );
  const [followUpInstructions, setFollowUpInstructions] = useState('Continue monitoring on floor. Routine morning labs. Follow-up with attending physician.');
  const [dischargedBy, setDischargedBy] = useState(patient.attendingPhysician || 'Attending Physician');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeSummary.trim()) return;

    const details: DischargeDetails = {
      dischargeDate,
      disposition,
      conditionAtDischarge,
      dischargeSummary: dischargeSummary.trim(),
      dischargeMedications: dischargeMedications.trim(),
      followUpInstructions: followUpInstructions.trim(),
      dischargedBy: dischargedBy.trim()
    };

    onConfirmDischarge(patient.id, details);
  };

  // Quick summary templates
  const applyTemplate = (type: 'ward' | 'home' | 'transfer') => {
    if (type === 'ward') {
      setDisposition('Transferred to Ward');
      setConditionAtDischarge('Stable & Improved');
      setDischargeSummary(`Acute phase of ${patient.primaryDiagnosis} successfully managed. Patient is hemodynamically stable, off inotropes/mechanical ventilation. Transferred to inpatient floor for continuation of oral therapy and mobilization.`);
    } else if (type === 'home') {
      setDisposition('Discharged Home');
      setConditionAtDischarge('Stable & Improved');
      setDischargeSummary(`Fully recovered and stabilized after treatment for ${patient.primaryDiagnosis}. Ambulating well, tolerating oral diet, vital signs within normal limits. Discharged home with outpatient follow-up.`);
    } else if (type === 'transfer') {
      setDisposition('Transferred to Step-Down Unit');
      setConditionAtDischarge('Guarded');
      setDischargeSummary(`Transferred to Step-Down / Telemetry unit for intermediate continuous monitoring following ${patient.primaryDiagnosis}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Discharge & Release Bed {patient.bedNumber}
              </h3>
              <p className="text-xs text-slate-400">
                {patient.name} ({patient.mrn}) • {patient.primaryDiagnosis}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Informational Reassurance Box */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-start gap-2.5 text-cyan-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[11px] text-cyan-300">
                إخلاء السرير مع بقاء المريض في السجل الطبي
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                سيتم إخلاء <strong>السرير {patient.bedNumber}</strong> ليصبح متاحاً لحجز حالة جديدة، مع <strong>الاحتفاظ بكافة بيانات وفحوصات وملاحظات المريض السريرية</strong> بشكل دائم داخل <strong>السجل الطبي (Medical Records Archive)</strong> مع إمكانية فتح ملفه وطباعته أو إعادة تسكينه في أي وقت.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Discharge Date & Time</label>
              <input
                type="text"
                required
                value={dischargeDate}
                onChange={e => setDischargeDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Discharge Destination</label>
              <select
                value={disposition}
                onChange={e => setDisposition(e.target.value as DischargeDisposition)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold focus:border-cyan-500 outline-none"
              >
                <option value="Transferred to Ward">🏥 Transferred to Ward (قسم داخلي)</option>
                <option value="Transferred to Step-Down Unit">🛏️ Step-Down / Telemetry (عناية متوسطة)</option>
                <option value="Discharged Home">🏠 Discharged Home (خروج للمنزل)</option>
                <option value="Transferred to another Facility">🚑 Transferred to Facility (مستشفى آخر)</option>
                <option value="Against Medical Advice (AMA)">⚠️ AMA (خروج حسب الطلب)</option>
                <option value="Deceased">🕊️ Deceased (وفاة)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Condition at Discharge</label>
              <select
                value={conditionAtDischarge}
                onChange={e => setConditionAtDischarge(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
              >
                <option value="Stable & Improved">Stable & Improved</option>
                <option value="Stable">Stable</option>
                <option value="Guarded">Guarded</option>
                <option value="Critical (During Transfer)">Critical (During Transfer)</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Discharging Physician</label>
              <input
                type="text"
                value={dischargedBy}
                onChange={e => setDischargedBy(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Quick template buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Discharge Summary & Handover Note *</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('ward')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                >
                  Ward
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('home')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('transfer')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                >
                  Step-Down
                </button>
              </div>
            </div>
            <textarea
              required
              rows={3}
              value={dischargeSummary}
              onChange={e => setDischargeSummary(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
              placeholder="Clinical summary, in-hospital course, and transition plan..."
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Discharge / Floor Medications</label>
            <textarea
              rows={2}
              value={dischargeMedications}
              onChange={e => setDischargeMedications(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:border-cyan-500 outline-none"
              placeholder="List medications to continue on floor or home..."
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Follow-up Instructions</label>
            <input
              type="text"
              value={followUpInstructions}
              onChange={e => setFollowUpInstructions(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 transition active:scale-95 shadow-md shadow-amber-900/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Confirm Discharge & Free Bed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
