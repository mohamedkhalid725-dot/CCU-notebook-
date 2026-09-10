import React, { useState, useRef } from 'react';
import { PatientRecord, EchoStudy } from '../../types';
import { compressAndReadFileAsDataUrl } from '../../services/imageUpload';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Image as ImageIcon,
  Upload,
  Eye,
  Check,
  X,
  Maximize2,
  FileText,
  Activity
} from 'lucide-react';

interface PatientEchoProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
}

export const PatientEcho: React.FC<PatientEchoProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const echoStudies = patient.echoStudies || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    timestamp: string;
    ef: string;
    lvDimensions: string;
    lvSystolicFunction: string;
    rvAssessment: string;
    tapse: string;
    laRa: string;
    rwma: string;
    diastolicFunction: string;
    valvularAssessment: string;
    pasp: string;
    ivc: string;
    pericardium: string;
    otherMeasurements: string;
    findings: string;
    impression: string;
    imageUrl?: string;
  }>({
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ef: '55',
    lvDimensions: 'Normal cavity size, no hypertrophy',
    lvSystolicFunction: 'Normal overall systolic performance',
    rvAssessment: 'Normal RV size and systolic function',
    tapse: '22',
    laRa: 'LA normal size (vol index < 34 mL/m²)',
    rwma: 'No regional wall motion abnormality',
    diastolicFunction: 'Grade I (Impaired relaxation)',
    valvularAssessment: 'Trace MR, no significant valvular stenosis or regurgitation',
    pasp: '28',
    ivc: '1.6 cm, > 50% collapsibility (RAP ~3 mmHg)',
    pericardium: 'No pericardial effusion',
    otherMeasurements: '',
    findings: '',
    impression: '',
    imageUrl: undefined,
  });

  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressAndReadFileAsDataUrl(file);
      setFormState((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      console.error('Failed to load image:', err);
      alert('Error reading echo image. Please try again.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.impression.trim()) {
      alert('Please enter an overall Echo impression.');
      return;
    }

    const study: EchoStudy = {
      id: editingId || `echo-${Date.now()}`,
      timestamp: formState.timestamp,
      ef: formState.ef,
      lvDimensions: formState.lvDimensions,
      lvSystolicFunction: formState.lvSystolicFunction,
      rvAssessment: formState.rvAssessment,
      tapse: formState.tapse,
      laRa: formState.laRa,
      rwma: formState.rwma,
      diastolicFunction: formState.diastolicFunction,
      valvularAssessment: formState.valvularAssessment,
      pasp: formState.pasp,
      ivc: formState.ivc,
      pericardium: formState.pericardium,
      otherMeasurements: formState.otherMeasurements,
      findings: formState.findings,
      impression: formState.impression,
      imageUrl: formState.imageUrl,
    };

    let updatedStudies: EchoStudy[];
    if (editingId) {
      updatedStudies = echoStudies.map((s) => (s.id === editingId ? study : s));
    } else {
      updatedStudies = [study, ...echoStudies];
    }

    // Keep ccuData in sync for legacy compatibility
    const updatedPatient: PatientRecord = {
      ...patient,
      echoStudies: updatedStudies,
      ccuData: {
        ...patient.ccuData,
        echoEF: formState.ef,
        echoFindings: formState.impression,
      },
      lastUpdated: new Date().toISOString(),
    };

    onUpdatePatient(updatedPatient);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this echocardiogram study record?')) {
      const updated = echoStudies.filter((s) => s.id !== id);
      onUpdatePatient({
        ...patient,
        echoStudies: updated,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (study: EchoStudy) => {
    setEditingId(study.id);
    setFormState({
      timestamp: study.timestamp,
      ef: study.ef,
      lvDimensions: study.lvDimensions || '',
      lvSystolicFunction: study.lvSystolicFunction || '',
      rvAssessment: study.rvAssessment || '',
      tapse: study.tapse || '',
      laRa: study.laRa || '',
      rwma: study.rwma || '',
      diastolicFunction: study.diastolicFunction || '',
      valvularAssessment: study.valvularAssessment || '',
      pasp: study.pasp || '',
      ivc: study.ivc || '',
      pericardium: study.pericardium || '',
      otherMeasurements: study.otherMeasurements || '',
      findings: study.findings || '',
      impression: study.impression,
      imageUrl: study.imageUrl,
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="text-emerald-500" size={18} />
            <span>Transthoracic & Bedside Echocardiography (TTE/POCUS)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            LVEF, wall motion analysis, TAPSE, valvular Doppler evaluation, PASP, and pericardial space
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormState({
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              ef: patient.ccuData?.echoEF || '55',
              lvDimensions: '',
              lvSystolicFunction: '',
              rvAssessment: '',
              tapse: '20',
              laRa: '',
              rwma: '',
              diastolicFunction: '',
              valvularAssessment: '',
              pasp: '',
              ivc: '',
              pericardium: 'No effusion',
              otherMeasurements: '',
              findings: '',
              impression: '',
              imageUrl: undefined,
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus size={14} />
          <span>Add Echo Study</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              <span>{editingId ? 'Edit Echo Study' : 'Record New Echocardiography Study'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Study Date & Time
              </label>
              <input
                type="text"
                value={formState.timestamp}
                onChange={(e) => setFormState({ ...formState, timestamp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Ejection Fraction (EF %) *
              </label>
              <input
                type="text"
                value={formState.ef}
                onChange={(e) => setFormState({ ...formState, ef: e.target.value })}
                placeholder="e.g. 35% or 55%"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                TAPSE (mm) / RV Function
              </label>
              <input
                type="text"
                value={formState.tapse}
                onChange={(e) => setFormState({ ...formState, tapse: e.target.value })}
                placeholder="e.g. 18 mm (Normal >= 17)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Regional Wall Motion Abnormalities (RWMA)
              </label>
              <input
                type="text"
                value={formState.rwma}
                onChange={(e) => setFormState({ ...formState, rwma: e.target.value })}
                placeholder="e.g. Hypokinesis of anterior and apical segments, spared inferior wall"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                LV Dimensions & Walls
              </label>
              <input
                type="text"
                value={formState.lvDimensions}
                onChange={(e) => setFormState({ ...formState, lvDimensions: e.target.value })}
                placeholder="LVEDD, LVESD, IVS, PW"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Diastolic Function
              </label>
              <input
                type="text"
                value={formState.diastolicFunction}
                onChange={(e) => setFormState({ ...formState, diastolicFunction: e.target.value })}
                placeholder="e.g. Grade 1, Grade 2, E/e' ratio"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                PASP (mmHg)
              </label>
              <input
                type="text"
                value={formState.pasp}
                onChange={(e) => setFormState({ ...formState, pasp: e.target.value })}
                placeholder="e.g. 35 mmHg"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                IVC & Collapsibility
              </label>
              <input
                type="text"
                value={formState.ivc}
                onChange={(e) => setFormState({ ...formState, ivc: e.target.value })}
                placeholder="e.g. 1.8 cm, > 50% collapsibility"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Pericardium / Effusion
              </label>
              <input
                type="text"
                value={formState.pericardium}
                onChange={(e) => setFormState({ ...formState, pericardium: e.target.value })}
                placeholder="No effusion, mild posterior effusion..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Atrial Sizes (LA / RA)
              </label>
              <input
                type="text"
                value={formState.laRa}
                onChange={(e) => setFormState({ ...formState, laRa: e.target.value })}
                placeholder="e.g. Mild LA enlargement"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Valvular Assessment (Aortic, Mitral, Tricuspid, Pulmonic)
              </label>
              <textarea
                rows={2}
                value={formState.valvularAssessment}
                onChange={(e) => setFormState({ ...formState, valvularAssessment: e.target.value })}
                placeholder="e.g. Severe AS (peak gradient 65 mmHg, AVA 0.7 cm2), Moderate MR, mild TR..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                Overall Impression & Conclusion *
              </label>
              <textarea
                rows={2}
                value={formState.impression}
                onChange={(e) => setFormState({ ...formState, impression: e.target.value })}
                placeholder="Final summary diagnosis and comparison with prior studies..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            {/* Photo / Loop Screenshot Attachment */}
            <div className="sm:col-span-2 md:col-span-3 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Echo Image / Doppler Tracing Attachment
              </span>

              {formState.imageUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={formState.imageUrl}
                    alt="Echo Preview"
                    className="w-24 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shadow-sm"
                    onClick={() =>
                      setLightboxImage({
                        url: formState.imageUrl!,
                        title: 'Echocardiogram Image',
                        subtitle: `${formState.timestamp} • EF: ${formState.ef}%`,
                      })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: formState.imageUrl!,
                          title: 'Echocardiogram Image',
                          subtitle: `${formState.timestamp} • EF: ${formState.ef}%`,
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, imageUrl: undefined })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <Upload size={14} />
                    <span>Upload Echo Doppler or 4-Chamber Image</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              {editingId ? 'Update Study' : 'Save Echo Study'}
            </button>
          </div>
        </form>
      )}

      {/* Studies List */}
      {echoStudies.length > 0 ? (
        <div className="space-y-4">
          {echoStudies.map((study) => (
            <div
              key={study.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Heart size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      LVEF: {study.ef}% • {study.impression}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {study.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(study)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(study.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Echo Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">TAPSE (RV)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {study.tapse ? `${study.tapse} mm` : 'Normal'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">PASP</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {study.pasp ? `${study.pasp} mmHg` : 'Not elevated'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">IVC Collapsibility</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {study.ivc || 'Normal'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Pericardium</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {study.pericardium || 'No effusion'}
                  </span>
                </div>
              </div>

              {study.rwma && (
                <div className="text-xs p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Wall Motion (RWMA):</span> {study.rwma}
                </div>
              )}

              {study.valvularAssessment && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Valves:</strong> {study.valvularAssessment}
                </p>
              )}

              {study.imageUrl && (
                <div className="pt-1">
                  <button
                    onClick={() =>
                      setLightboxImage({
                        url: study.imageUrl!,
                        title: `Echocardiogram: LVEF ${study.ef}%`,
                        subtitle: `${study.timestamp} • ${study.impression}`,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    <ImageIcon size={14} className="text-emerald-500" />
                    <span>View Echo Study Image</span>
                    <Maximize2 size={12} className="text-slate-400 ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Heart size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Echocardiography Studies Stored
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Record comprehensive transthoracic Echo studies or bedside POCUS assessments, track LVEF evolution, TAPSE, and attach loop captures.
          </p>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          subtitle={lightboxImage.subtitle}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
